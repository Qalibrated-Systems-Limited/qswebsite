'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { careersAPI } from '@/utils/apiFactory';
import ConfirmationModal from './ConfirmationModal';

const EMPTY = {
  title: '',
  department: '',
  location: 'Nairobi, Kenya',
  type: 'Full-time',
  description: '',
  requirements: '',
  isOpen: true,
};

const CareerManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await careersAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load careers. Check that you are signed in as an admin and the API is reachable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      title: item.title || '',
      department: item.department || '',
      location: item.location || '',
      type: item.type || 'Full-time',
      description: item.description || '',
      requirements: item.requirements || '',
      isOpen: !!item.isOpen,
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) await careersAPI.update(editId, form);
      else await careersAPI.create(form);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save the role.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await careersAPI.delete(id);
      await load();
    } catch {
      setError('Failed to delete the role.');
    }
  };

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-800">Careers</h2>
        <button
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-md"
        >
          + New role
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
                <th className="px-4 py-2 font-semibold">Title</th>
                <th className="px-4 py-2 font-semibold">Department</th>
                <th className="px-4 py-2 font-semibold">Location</th>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{item.title}</td>
                    <td className="px-4 py-2">{item.department}</td>
                    <td className="px-4 py-2">{item.location}</td>
                    <td className="px-4 py-2">{item.type}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {item.isOpen ? 'Open' : 'Closed'}
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
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No roles yet. Click “New role” to post one.
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
            <h3 className="text-lg font-bold mb-4 text-gray-800">{editId ? 'Edit role' : 'New role'}</h3>
            <div className="grid gap-3">
              <input
                required
                placeholder="Job title"
                className="border rounded-md px-3 py-2"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Department"
                  className="border rounded-md px-3 py-2"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
                <input
                  required
                  placeholder="Location"
                  className="border rounded-md px-3 py-2"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <select
                className="border rounded-md px-3 py-2"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <textarea
                required
                rows={3}
                placeholder="Role description"
                className="border rounded-md px-3 py-2"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <textarea
                rows={3}
                placeholder="Requirements (one per line)"
                className="border rounded-md px-3 py-2"
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isOpen}
                  onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
                />
                Open for applications
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
                {saving ? 'Saving…' : 'Save role'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationModal
        open={!!confirmId}
        message="Delete this role? This cannot be undone."
        onConfirm={remove}
        onCancel={() => setConfirmId(null)}
      />
    </section>
  );
};

export default CareerManagement;
