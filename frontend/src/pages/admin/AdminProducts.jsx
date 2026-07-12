import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Upload, X } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [images, setImages] = useState([]); // File list for upload
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    brand: '',
    category: '',
    stock: '',
    tags: '',
    featured: false,
    isActive: true,
  });

  const fetchProducts = async () => {
    try {
      const { data } = await api.get(`/products?page=${page}&limit=10`);
      setProducts(data.products);
      setPages(data.pagination.pages);
    } catch {}
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, [page]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      brand: '',
      category: categories[0]?._id || '',
      stock: '',
      tags: '',
      featured: false,
      isActive: true,
    });
    setImages([]);
    setImagePreviews([]);
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingId(prod._id);
    setFormData({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      discountPrice: prod.discountPrice || '',
      brand: prod.brand || '',
      category: prod.category?._id || '',
      stock: prod.stock,
      tags: prod.tags ? prod.tags.join(', ') : '',
      featured: prod.featured || false,
      isActive: prod.isActive ?? true,
    });
    setImages([]);
    setImagePreviews(prod.images || []);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
    }));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemovePreview = async (img, index) => {
    if (img.isNew) {
      // Remove from local file list
      const fileIndex = imagePreviews.slice(0, index).filter((i) => i.isNew).length;
      const nextImages = [...images];
      nextImages.splice(fileIndex, 1);
      setImages(nextImages);

      const nextPreviews = [...imagePreviews];
      nextPreviews.splice(index, 1);
      setImagePreviews(nextPreviews);
    } else {
      // Remove from backend if editing
      if (window.confirm('Delete image permanently from this product?')) {
        try {
          await api.delete(`/products/${editingId}/images/${img._id}`);
          toast.success('Image deleted');
          setImagePreviews(imagePreviews.filter((_, idx) => idx !== index));
          await fetchProducts();
        } catch {
          toast.error('Failed to delete image');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });
      images.forEach((file) => {
        payload.append('images', file);
      });

      if (editingId) {
        await api.put(`/products/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created successfully');
      }
      setModalOpen(false);
      await fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Product deleted');
        await fetchProducts();
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn" id="admin-products-page">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="admin-page-title">Manage Products</h1>
        <button onClick={openAddModal} className="btn btn-primary flex-center gap-1" id="add-product-btn">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No products added yet.
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod._id}>
                  <td>
                    <img
                      src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop'}
                      alt=""
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prod.name}</td>
                  <td>{prod.category?.name || 'N/A'}</td>
                  <td>₹{prod.price.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${prod.stock < 10 ? 'badge-danger' : 'badge-default'}`}>
                      {prod.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${prod.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {prod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(prod)}
                        className="qty-btn"
                        style={{ color: 'var(--accent)', borderColor: 'rgba(34, 197, 94, 0.2)' }}
                        title="Edit product"
                        id={`edit-prod-btn-${prod._id}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="qty-btn"
                        style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        title="Delete product"
                        id={`delete-prod-btn-${prod._id}`}
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

      <Pagination page={page} pages={pages} onPageChange={setPage} />

      {/* Product Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Product' : 'Add Product'} maxWidth="680px">
        <form onSubmit={handleSubmit} id="product-dialog-form">
          <div className="form-group">
            <label className="form-label" htmlFor="prod-name">Product Name</label>
            <input
              type="text"
              id="prod-name"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-price">Original Price (₹)</label>
              <input
                type="number"
                id="prod-price"
                className="form-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-discount">Discount Price (₹, Optional)</label>
              <input
                type="number"
                id="prod-discount"
                className="form-input"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-category">Category</label>
              <select
                id="prod-category"
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-brand">Brand</label>
              <input
                type="text"
                id="prod-brand"
                className="form-input"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-stock">Stock Quantity</label>
              <input
                type="number"
                id="prod-stock"
                className="form-input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-desc">Product Description</label>
            <textarea
              id="prod-desc"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-tags">Tags (Comma separated)</label>
            <input
              type="text"
              id="prod-tags"
              className="form-input"
              placeholder="e.g. electronics, summer, premium"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          {/* Image Uploader */}
          <div className="form-group">
            <span className="form-label">Product Images</span>
            <label className="upload-zone" style={{ display: 'block' }}>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              <Upload className="upload-zone__icon" style={{ margin: '0 auto' }} />
              <p className="upload-zone__text">Click or drag images here to upload</p>
            </label>

            {/* Images list previews */}
            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {imagePreviews.map((img, index) => (
                  <div key={index} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemovePreview(img, index)}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 18, height: 18, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <label className="flex gap-1" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.9rem' }}>Featured Product</span>
            </label>
            <label className="flex gap-1" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.9rem' }}>Active / Publish</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1.5rem' }} disabled={submitting} id="dialog-save-prod-btn">
            {submitting ? 'Saving Product...' : editingId ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
