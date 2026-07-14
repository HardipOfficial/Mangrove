import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };
    init();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.image?.url || '',
      isActive: cat.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (catId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${catId}`);
        toast.success('Category deleted');
        await fetchCategories();
      } catch (err) {
        toast.error('Failed to delete category. Check if it is being referenced by products.');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn" id="admin-categories-page">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="admin-page-title">Manage Categories</h1>
        <button onClick={openAddModal} className="btn btn-primary flex-center gap-1" id="add-category-btn">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <img
                      src={cat.image?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop'}
                      alt=""
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</td>
                  <td>{cat.description || <span style={{ color: 'var(--text-muted)' }}>No description</span>}</td>
                  <td>
                    <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="qty-btn"
                        style={{ color: 'var(--accent)', borderColor: 'rgba(34, 197, 94, 0.2)' }}
                        title="Edit Category"
                        id={`edit-cat-btn-${cat._id}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="qty-btn"
                        style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        title="Delete Category"
                        id={`delete-cat-btn-${cat._id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Category Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} id="category-dialog-form">
          <div className="form-group">
            <label className="form-label" htmlFor="cat-name">Category Name</label>
            <input
              type="text"
              id="cat-name"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cat-desc">Description</label>
            <textarea
              id="cat-desc"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cat-image">Category Image URL</label>
            <input
              type="text"
              id="cat-image"
              className="form-input"
              placeholder="Paste category image URL here..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
            {formData.imageUrl && (
              <div style={{ marginTop: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: '80px', height: '80px' }}>
                <img
                  src={formData.imageUrl}
                  alt="Category Preview"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>
          <label className="form-group flex" style={{ gap: '0.5rem', cursor: 'pointer', marginTop: '1rem' }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ accentColor: 'var(--accent)' }}
            />
            <span style={{ fontSize: '0.9rem' }}>Active / Published</span>
          </label>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} disabled={submitting} id="dialog-save-cat-btn">
            {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
