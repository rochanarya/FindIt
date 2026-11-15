import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, { name, description });
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory({ name, description });
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category (items may be referencing it)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Item Categories</h1>
          <p className="text-xs text-slate-500 mt-1">Manage standard categories for campus lost & found reporting</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading categories..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-blue-600" />
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sports Equipment"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Basketballs, badminton rackets, yoga mats..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-xs font-semibold px-4 py-2 rounded-xl border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;

