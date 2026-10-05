import { Request, Response } from 'express';
import { ReadingType } from '../models/ReadingType';
import { Booking } from '../models/Booking';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class ReadingTypeController {
  /**
   * GET /api/reading-types
   * Public: List all active reading types
   */
  public static async getActive(req: Request, res: Response): Promise<void> {
    try {
      const types = await ReadingType.find({ isActive: true }).sort({ price: 1 });
      sendSuccess(res, types);
    } catch (error: any) {
      console.error('[ReadingTypeController.getActive] Error:', error);
      sendError(res, error.message || 'Failed to fetch reading types', 500);
    }
  }

  /**
   * GET /api/admin/reading-types
   * Admin: List all reading types
   */
  public static async getAllAdmin(req: Request, res: Response): Promise<void> {
    try {
      const types = await ReadingType.find().sort({ createdAt: -1 });
      sendSuccess(res, types);
    } catch (error: any) {
      console.error('[ReadingTypeController.getAllAdmin] Error:', error);
      sendError(res, error.message || 'Failed to fetch reading types', 500);
    }
  }

  /**
   * POST /api/admin/reading-types
   * Admin: Create a new reading type
   */
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, duration, price, isActive } = req.body;

      const existing = await ReadingType.findOne({ name: name.trim() });
      if (existing) {
        sendError(res, 'A reading type with this name already exists', 409);
        return;
      }

      const readingType = new ReadingType({
        name: name.trim(),
        description: description.trim(),
        duration,
        price,
        isActive: isActive !== undefined ? isActive : true,
      });

      await readingType.save();
      sendSuccess(res, readingType, 201, 'Reading type created successfully');
    } catch (error: any) {
      console.error('[ReadingTypeController.create] Error:', error);
      sendError(res, error.message || 'Failed to create reading type', 500);
    }
  }

  /**
   * PATCH /api/admin/reading-types/:id
   * Admin: Update reading type
   */
  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, duration, price, isActive } = req.body;

      const readingType = await ReadingType.findById(id);
      if (!readingType) {
        sendError(res, 'Reading type not found', 404);
        return;
      }

      if (name && name.trim() !== readingType.name) {
        const existing = await ReadingType.findOne({ name: name.trim() });
        if (existing && existing._id.toString() !== id) {
          sendError(res, 'Another reading type already uses this name', 409);
          return;
        }
        readingType.name = name.trim();
      }

      if (description !== undefined) readingType.description = description.trim();
      if (duration !== undefined) readingType.duration = duration;
      if (price !== undefined) readingType.price = price;
      if (isActive !== undefined) readingType.isActive = isActive;

      await readingType.save();
      sendSuccess(res, readingType, 200, 'Reading type updated successfully');
    } catch (error: any) {
      console.error('[ReadingTypeController.update] Error:', error);
      sendError(res, error.message || 'Failed to update reading type', 500);
    }
  }

  /**
   * DELETE /api/admin/reading-types/:id
   * Admin: Delete reading type
   */
  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if bookings exist for this reading type
      const bookingsCount = await Booking.countDocuments({ readingTypeId: id });
      if (bookingsCount > 0) {
        // Soft delete / disable instead of hard deleting
        await ReadingType.findByIdAndUpdate(id, { isActive: false });
        sendSuccess(res, null, 200, 'Reading type has existing bookings and was deactivated.');
        return;
      }

      await ReadingType.findByIdAndDelete(id);
      sendSuccess(res, null, 200, 'Reading type deleted successfully');
    } catch (error: any) {
      console.error('[ReadingTypeController.delete] Error:', error);
      sendError(res, error.message || 'Failed to delete reading type', 500);
    }
  }
}
