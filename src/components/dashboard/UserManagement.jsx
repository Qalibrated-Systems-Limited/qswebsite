'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usersAPI } from '@/utils/apiFactory';
import ConfirmationModal from './ConfirmationModal';

const EMPTY = { name: '', email: '', password: '', role: 'Client', status: 'Active' };
const ROLES = ['Admin', 'Client', 'Guest'];
const STATUSES = ['Active', 'Pending', 'Inactive'];

const UserManagement = () => {
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
      const { data } = await usersAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load users. Make sure you are signed in as an admin and the API is reachable.');
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
      name: item.name || '',
      email: item.email || '',
      password: '',
      role: item.role || 'Client',
      status: item.status || 'Active',
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name: form.name, email: form.email, role: form.role, status: form.status };
      if (form.password) payload.password = form.password;
      if (editId) await usersAPI.update(editId, payload);
      else await usersAPI.create({ ...payload, password: form.password });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save the user.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await usersAPI.delete(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete the user.');
    }
  };

  const roleClass = (r) =>
    r === 'Admin' ? 'bg-amber-100 text-amber-700' : r === 'Guest' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700';

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">Manage who can sign in and their access level.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + New user
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
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600">{item.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleClass(item.role)}`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.status}</td>
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
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={save} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[88vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-900">{editId ? 'Edit user' : 'New user'}</h3>
            <div className="grid gap-3">
              <input
                required
                placeholder="Full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="password"
                placeholder={editId ? 'New password (leave blank to keep)' : 'Password'}
                required={!editId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
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
                {saving ? 'Saving…' : 'Save user'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationModal
        open={!!confirmId}
        message="Delete this user? This cannot be undone."
        onConfirm={remove}
        onCancel={() => setConfirmId(null)}
      />
    </section>
  );
};

export default UserManagement;
