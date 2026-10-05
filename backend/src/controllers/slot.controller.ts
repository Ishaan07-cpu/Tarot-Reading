import { Request, Response } from 'express';
import { Slot } from '../models/Slot';
import { Booking } from '../models/Booking';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class SlotController {
  /**
   * GET /api/slots
   * Public: List available upcoming slots
   */
  public static async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const queryDate = req.query.date as string | undefined;

      const filter: any = {
        status: 'AVAILABLE',
        date: queryDate ? queryDate : { $gte: todayStr },
      };

      const slots = await Slot.find(filter).sort({ date: 1, startTime: 1 });
      sendSuccess(res, slots);
    } catch (error: any) {
      console.error('[SlotController.getAvailableSlots] Error:', error);
      sendError(res, error.message || 'Failed to fetch slots', 500);
    }
  }

  /**
   * GET /api/admin/slots
   * Admin: List all slots (including BOOKED, HELD, DISABLED)
   */
  public static async getAdminSlots(req: Request, res: Response): Promise<void> {
    try {
      const queryDate = req.query.date as string | undefined;
      const status = req.query.status as string | undefined;

      const filter: any = {};
      if (queryDate) filter.date = queryDate;
      if (status && status !== 'ALL') filter.status = status;

      const slots = await Slot.find(filter)
        .populate('heldBy', 'name email phone')
        .sort({ date: 1, startTime: 1 });

      sendSuccess(res, slots);
    } catch (error: any) {
      console.error('[SlotController.getAdminSlots] Error:', error);
      sendError(res, error.message || 'Failed to fetch admin slots', 500);
    }
  }

  /**
   * POST /api/admin/slots
   * Admin: Create a new slot
   */
  public static async createSlot(req: Request, res: Response): Promise<void> {
    try {
      const { date, startTime, endTime } = req.body;

      // Check duplicate slot
      const existing = await Slot.findOne({ date, startTime });
      if (existing) {
        sendError(res, 'A slot starting at this time on this date already exists', 409);
        return;
      }

      // Check overlapping slots on the same date
      const overlap = await Slot.findOne({
        date,
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
        ],
      });

      if (overlap) {
        sendError(res, `Slot overlaps with existing slot (${overlap.startTime} - ${overlap.endTime})`, 409);
        return;
      }

      const slot = new Slot({
        date,
        startTime,
        endTime,
        status: 'AVAILABLE',
      });
      await slot.save();

      sendSuccess(res, slot, 201, 'Slot created successfully');
    } catch (error: any) {
      console.error('[SlotController.createSlot] Error:', error);
      sendError(res, error.message || 'Failed to create slot', 500);
    }
  }

  /**
   * PATCH /api/admin/slots/:id
   * Admin: Update slot status or times
   */
  public static async updateSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const slot = await Slot.findById(id);
      if (!slot) {
        sendError(res, 'Slot not found', 404);
        return;
      }

      // If slot is BOOKED, check if there's an active booking before allowing status override
      if (slot.status === 'BOOKED' && status === 'AVAILABLE') {
        const activeBooking = await Booking.findOne({
          slotId: id,
          status: { $in: ['PENDING', 'APPROVED'] },
        });
        if (activeBooking) {
          sendError(
            res,
            'Cannot mark slot AVAILABLE while an active booking exists. Cancel or reject the booking first.',
            409
          );
          return;
        }
      }

      if (status) {
        slot.status = status;
      }

      await slot.save();
      sendSuccess(res, slot, 200, 'Slot updated successfully');
    } catch (error: any) {
      console.error('[SlotController.updateSlot] Error:', error);
      sendError(res, error.message || 'Failed to update slot', 500);
    }
  }

  /**
   * DELETE /api/admin/slots/:id
   * Admin: Delete an unbooked slot
   */
  public static async deleteSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const slot = await Slot.findById(id);
      if (!slot) {
        sendError(res, 'Slot not found', 404);
        return;
      }

      const activeBooking = await Booking.findOne({
        slotId: id,
        status: { $in: ['PENDING', 'APPROVED', 'COMPLETED'] },
      });

      if (activeBooking) {
        sendError(res, 'Cannot delete a slot tied to a booking record', 409);
        return;
      }

      await Slot.deleteOne({ _id: id });
      sendSuccess(res, null, 200, 'Slot deleted successfully');
    } catch (error: any) {
      console.error('[SlotController.deleteSlot] Error:', error);
      sendError(res, error.message || 'Failed to delete slot', 500);
    }
  }
}
