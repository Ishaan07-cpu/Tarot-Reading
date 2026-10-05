import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { ReadingType } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { BookOpen, Plus, Edit2, Trash2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export const AdminReadingTypesPage: React.FC = () => {
  const [readingTypes, setReadingTypes] = useState<ReadingType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ReadingType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 999,
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTypes = useCallback(async () => {
    try {
      const res = await api.get('/admin/reading-types');
      if (res.data?.success) {
        setReadingTypes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reading types', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleOpenCreate = () => {
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: 999,
      isActive: true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (rt: ReadingType) => {
    setEditingType(rt);
    setFormData({
      name: rt.name,
      description: rt.description,
      duration: rt.duration,
      price: rt.price,
      isActive: rt.isActive,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingType) {
        await api.patch(`/admin/reading-types/${editingType._id}`, formData);
      } else {
        await api.post('/admin/reading-types', formData);
      }
      setModalOpen(false);
      fetchTypes();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete or deactivate this reading type?')) return;
    try {
      await api.delete(`/admin/reading-types/${id}`);
      fetchTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Reading Types Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure offerings, durations, pricing, and active catalog visibility
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchTypes}
              className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-amber-300"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button
              variant="gold"
              size="md"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reading Type</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-24">
            <LoadingSpinner message="Consulting the reading spreads..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readingTypes.map((rt) => (
              <div
                key={rt._id}
                className="p-6 rounded-2xl bg-[#140e30]/90 border border-purple-800/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                        rt.isActive
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {rt.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <span className="text-xl font-serif font-bold text-amber-300">
                      ₹{rt.price}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-slate-100 mb-2">
                    {rt.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {rt.description}
                  </p>
                  <div className="text-xs text-purple-300 font-mono">
                    Duration: {rt.duration} minutes
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-purple-900/40 flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(rt)}
                    className="text-xs text-purple-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rt._id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingType ? 'Edit Reading Type' : 'Add New Reading Type'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/50 text-xs text-red-200">
                {formError}
              </div>
            )}

            <Input
              label="Reading Spread Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Love & Relationship Consultation"
              required
            />

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-purple-200 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what cards, spreads, and insight this reading entails..."
                className="w-full px-3.5 py-2.5 bg-[#120c29] border border-purple-800/60 rounded-lg text-sm text-slate-100 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (Minutes)"
                type="number"
                min={5}
                max={180}
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value, 10) })
                }
                required
              />

              <Input
                label="Price (₹ INR)"
                type="number"
                min={0}
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-purple-700 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="isActive" className="text-xs text-slate-200 font-mono">
                Visible to clients on public website
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-purple-900/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="sm" isLoading={formLoading}>
                {editingType ? 'Save Changes' : 'Create Reading Type'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
};
