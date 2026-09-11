'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adsAPI, imageUrl } from '@/utils/apiFactory';
import ConfirmationModal from './ConfirmationModal';

const EMPTY = { title: '', description: '', linkUrl: '', position: 'banner', isActive: true, endDate: '' };

const AdManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adsAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load ads. Check that you are signed in as an admin and the API is reachable.');
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
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      linkUrl: item.linkUrl || '',
      position: item.position || 'banner',
      isActive: !!item.isActive,
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
    });
    setFile(null);
    setEditId(item.id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('linkUrl', form.linkUrl);
      fd.append('position', form.position);
      fd.append('isActive', String(form.isActive));
      if (form.endDate) fd.append('endDate', form.endDate);
      if (file) fd.append('image', file);
      if (editId) await adsAPI.update(editId, fd);
      else await adsAPI.create(fd);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save the ad.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await adsAPI.delete(id);
      await load();
    } catch {
      setError('Failed to delete the ad.');
    }
  };

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-800">Ads &amp; Promotions</h2>
        <button
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-md"
        >
          + New ad
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-center text-gray-500 py-6">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 font-semibold">Image</th>
                <th className="px-4 py-2 font-semibold">Title</th>
                <th className="px-4 py-2 font-semibold">Position</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl(item.imageUrl)} alt={item.title} className="w-14 h-10 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-800 max-w-xs truncate">{item.title}</td>
                    <td className="px-4 py-2 capitalize">{item.position}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(item)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmId(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No ads yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={save}
            className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[88vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold mb-4 text-gray-800">{editId ? 'Edit ad' : 'New ad'}</h3>
            <div className="grid gap-3">
              <input
                required
                placeholder="Title"
                className="border rounded-md px-3 py-2"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                rows={2}
                placeholder="Description (optional)"
                className="border rounded-md px-3 py-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <input
                placeholder="Link URL (optional, e.g. https://…)"
                className="border rounded-md px-3 py-2"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <select
                  className="border rounded-md px-3 py-2"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                >
                  {['banner', 'sidebar', 'popup'].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <label className="text-sm text-gray-600">
                  End date (optional)
                  <input
                    type="date"
                    className="block border rounded-md px-3 py-2 w-full mt-1"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </label>
              </div>
              <label className="text-sm text-gray-600">
                Image (optional)
                <input
                  type="file"
                  accept="image/*"
                  className="block mt-1 text-sm"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationModal
        open={!!confirmId}
        message="Delete this ad? This cannot be undone."
        onConfirm={remove}
        onCancel={() => setConfirmId(null)}
      />
    </section>
  );
};

export default AdManagement;
