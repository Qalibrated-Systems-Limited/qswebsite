'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { productsAPI, imageUrl } from '@/utils/apiFactory';
import ConfirmationModal from './ConfirmationModal';

const EMPTY = { name: '', category: '', price: '', description: '', features: '', isActive: true };

// features are stored as a JSON string on the backend; the form edits them as a
// simple comma-separated list.
function featuresToText(json) {
  try {
    const arr = JSON.parse(json || '[]');
    return Array.isArray(arr) ? arr.join(', ') : '';
  } catch {
    return '';
  }
}
function textToFeatures(text) {
  const arr = (text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(arr);
}

const ProductManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await productsAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load products. Make sure you are signed in as an admin and the API is reachable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY);
    setFile(null);
    setPreview('');
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name || '',
      category: item.category || '',
      price: item.price ?? '',
      description: item.description || '',
      features: featuresToText(item.features),
      isActive: item.isActive !== false,
    });
    setFile(null);
    setPreview(imageUrl(item.imageUrl) || '');
    setEditId(item.id);
    setShowForm(true);
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('category', form.category);
      if (form.price !== '') fd.append('price', String(form.price));
      fd.append('description', form.description);
      fd.append('features', textToFeatures(form.features));
      fd.append('isActive', String(form.isActive));
      if (file) fd.append('image', file);
      if (editId) await productsAPI.update(editId, fd);
      else await productsAPI.create(fd);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save the product.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await productsAPI.delete(id);
      await load();
    } catch {
      setError('Failed to delete the product.');
    }
  };

  const money = (v) => (v || v === 0 ? `KSh ${Number(v).toLocaleString()}` : '—');

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">Manage the products and services shown on the site.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + New product
        </button>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Image</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Price</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl(item.imageUrl)} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-[10px]">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600">{item.category}</td>
                    <td className="px-4 py-3 text-gray-600">{money(item.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-sm font-medium text-gray-600 hover:text-amber-600 px-2 py-1 rounded hover:bg-amber-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmId(item.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No products yet. Click “New product” to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={save} className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[88vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-900">{editId ? 'Edit product' : 'New product'}</h3>
            <div className="grid gap-3">
              <input
                required
                placeholder="Product name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Category"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price (KSh, optional)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <textarea
                required
                rows={3}
                placeholder="Description"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <input
                placeholder="Key features (comma separated)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
              />
              <div>
                <label className="text-sm text-gray-600">Product image</label>
                <input type="file" accept="image/*" onChange={onPickFile} className="block mt-1 text-sm" />
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="mt-2 w-24 h-24 object-cover rounded-lg border border-gray-200" />
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Visible on the website
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationModal
        open={!!confirmId}
        message="Delete this product? This cannot be undone."
        onConfirm={remove}
        onCancel={() => setConfirmId(null)}
      />
    </section>
  );
};

export default ProductManagement;
