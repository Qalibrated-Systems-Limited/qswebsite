'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { applicationsAPI } from '@/utils/apiFactory';
import ConfirmationModal from './ConfirmationModal';

const STATUSES = ['New', 'Reviewed', 'Shortlisted', 'Rejected'];

const STATUS_STYLES = {
  New: 'bg-amber-100 text-amber-800',
  Reviewed: 'bg-blue-100 text-blue-700',
  Shortlisted: 'bg-green-100 text-green-700',
  Rejected: 'bg-gray-200 text-gray-600',
};

const fmtSize = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

const EXPERIENCE_LABELS = { '0-1': '< 1 yr', '1-3': '1–3 yrs', '3-5': '3–5 yrs', '5-10': '5–10 yrs', '10+': '10+ yrs' };

const docKind = (mime = '') =>
  mime === 'application/pdf' ? 'PDF' : mime.includes('wordprocessingml') ? 'Word' : mime.startsWith('image/') ? 'Image' : 'File';

// Styles for the sandboxed .docx preview so the converted HTML reads like a page.
const DOCX_PREVIEW_CSS =
  'body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;line-height:1.5;max-width:800px;margin:24px auto;padding:0 24px}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:4px 8px}';

function Field({ label, children }) {
  if (children === null || children === undefined || children === '') return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800 whitespace-pre-line break-words">{children}</dd>
    </div>
  );
}

function ApplicantDetails({ item }) {
  return (
    <div className="overflow-y-auto p-5 space-y-5 border-r">
      <section>
        <h4 className="text-sm font-bold text-amber-700 mb-2">Personal</h4>
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <a href={`mailto:${item.email}`} className="text-blue-700 hover:underline">
              {item.email}
            </a>
          </Field>
          <Field label="Phone">
            <a href={`tel:${item.phone}`} className="text-blue-700 hover:underline">
              {item.phone}
            </a>
          </Field>
          <Field label="Location">{item.location}</Field>
          <Field label="LinkedIn / portfolio">
            {item.linkedinUrl && (
              <a href={item.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                {item.linkedinUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
          </Field>
        </dl>
      </section>
      <section>
        <h4 className="text-sm font-bold text-amber-700 mb-2">Education</h4>
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Level">{item.educationLevel}</Field>
          <Field label="Field of study">{item.fieldOfStudy}</Field>
          <Field label="Institution">{item.institution}</Field>
          <Field label="Year completed">{item.graduationYear}</Field>
        </dl>
        <div className="mt-3">
          <Field label="Certifications / licences">{item.certifications}</Field>
        </div>
      </section>
      <section>
        <h4 className="text-sm font-bold text-amber-700 mb-2">Experience</h4>
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Years">{EXPERIENCE_LABELS[item.yearsExperience] || item.yearsExperience}</Field>
          <Field label="Current / last title">{item.currentTitle}</Field>
          <Field label="Current / last employer">{item.currentEmployer}</Field>
        </dl>
        <dl className="mt-3 space-y-3">
          <Field label="Relevant experience">{item.experienceSummary}</Field>
          <Field label="Key skills">{item.skills}</Field>
        </dl>
      </section>
      <section>
        <h4 className="text-sm font-bold text-amber-700 mb-2">Availability</h4>
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Can start">{item.availability}</Field>
          <Field label="Expected salary">{item.expectedSalary}</Field>
          <Field label="Travel / relocate">{item.willingToTravel ? 'Yes' : 'No'}</Field>
        </dl>
        <dl className="mt-3">
          <Field label="Why Qalibrated">{item.message}</Field>
        </dl>
      </section>
    </div>
  );
}

const ApplicationManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  // Details modal state: { item, loading, error, url?, html? } — the doc fields
  // are only filled when the application has a CV attached.
  const [preview, setPreview] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await applicationsAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load applications. Check that you are signed in as an admin and the API is reachable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Release the blob URL when the preview closes or changes.
  useEffect(() => {
    const url = preview?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [preview?.url]);

  const roles = useMemo(() => [...new Set(items.map((i) => i.jobTitle))].sort(), [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) =>
        (!roleFilter || i.jobTitle === roleFilter) &&
        (!statusFilter || i.status === statusFilter) &&
        (!q ||
          [i.fullName, i.email, i.phone, i.location, i.skills, i.fieldOfStudy, i.institution, i.currentTitle, i.currentEmployer, i.cvFileName]
            .join(' ')
            .toLowerCase()
            .includes(q)),
    );
  }, [items, query, roleFilter, statusFilter]);

  const setStatus = async (id, status) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await applicationsAPI.updateStatus(id, status);
    } catch {
      setError('Failed to update the status.');
      load();
    }
  };

  const openPreview = async (item) => {
    if (item.status === 'New') setStatus(item.id, 'Reviewed');
    if (!item.cvFileName) return setPreview({ item, loading: false });
    setPreview({ item, loading: true });
    try {
      if (item.cvMimeType.includes('wordprocessingml')) {
        const { data } = await applicationsAPI.getPreview(item.id);
        setPreview({ item, loading: false, html: `<style>${DOCX_PREVIEW_CSS}</style>${data.html || ''}` });
      } else {
        const { data } = await applicationsAPI.getCv(item.id);
        const blob = new Blob([data], { type: item.cvMimeType });
        setPreview({ item, loading: false, url: URL.createObjectURL(blob) });
      }
    } catch {
      setPreview({ item, loading: false, error: 'Could not load this document.' });
    }
  };

  const download = async (item) => {
    try {
      const { data } = await applicationsAPI.getCv(item.id);
      const url = URL.createObjectURL(new Blob([data], { type: item.cvMimeType }));
      const a = document.createElement('a');
      a.href = url;
      a.download = item.cvMimeType === 'image/webp' ? item.cvFileName.replace(/\.[^.]+$/, '') + '.webp' : item.cvFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('Failed to download the CV.');
    }
  };

  const remove = async () => {
    const id = confirmId;
    setConfirmId(null);
    try {
      await applicationsAPI.delete(id);
      if (preview?.item.id === id) setPreview(null);
      await load();
    } catch {
      setError('Failed to delete the application.');
    }
  };

  const newCount = items.filter((i) => i.status === 'New').length;

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Job applications</h2>
          <p className="text-sm text-gray-500">
            {items.length} application{items.length === 1 ? '' : 's'}
            {newCount > 0 && <> · <span className="text-amber-700 font-semibold">{newCount} new</span></>}
          </p>
        </div>
        <button onClick={load} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md">
          Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <input
          placeholder="Search name, skills, school, employer…"
          className="border rounded-md px-3 py-2 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="border rounded-md px-3 py-2 text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select className="border rounded-md px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-center text-gray-500 py-6">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 font-semibold">Applicant</th>
                <th className="px-4 py-2 font-semibold">Role</th>
                <th className="px-4 py-2 font-semibold">Education</th>
                <th className="px-4 py-2 font-semibold">Experience</th>
                <th className="px-4 py-2 font-semibold">CV</th>
                <th className="px-4 py-2 font-semibold">Submitted</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length ? (
                visible.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 align-top">
                    <td className="px-4 py-2">
                      <button onClick={() => openPreview(item)} className="font-medium text-blue-700 hover:underline text-left">
                        {item.fullName}
                      </button>
                      <div className="text-xs text-gray-600">{item.email}</div>
                      <div className="text-xs text-gray-600">
                        {item.phone} · {item.location}
                      </div>
                    </td>
                    <td className="px-4 py-2">{item.jobTitle}</td>
                    <td className="px-4 py-2">
                      <div>{item.educationLevel}</div>
                      <div className="text-xs text-gray-600">{item.fieldOfStudy}</div>
                    </td>
                    <td className="px-4 py-2">
                      <div>{EXPERIENCE_LABELS[item.yearsExperience] || item.yearsExperience}</div>
                      {item.currentTitle && <div className="text-xs text-gray-600">{item.currentTitle}</div>}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {item.cvFileName ? (
                        <>
                          <div className="font-medium text-gray-800">{docKind(item.cvMimeType)}</div>
                          <div className="text-gray-500">{fmtSize(item.storedSize)}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <select
                        value={item.status}
                        onChange={(e) => setStatus(item.id, e.target.value)}
                        className={`rounded-full text-xs font-semibold px-2 py-1 border-0 ${STATUS_STYLES[item.status] || ''}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                      <button onClick={() => openPreview(item)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                        View
                      </button>
                      <button onClick={() => setConfirmId(item.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    {items.length ? 'No applications match these filters.' : 'No applications yet. Applications submitted on the Careers page appear here.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setPreview(null)}>
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-5 py-3 border-b">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{preview.item.fullName}</h3>
                <p className="text-xs text-gray-600">
                  {preview.item.jobTitle} · submitted {new Date(preview.item.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {preview.item.cvFileName && (
                  <button onClick={() => download(preview.item)} className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1.5 rounded">
                    Download CV
                  </button>
                )}
                <button onClick={() => setPreview(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-1.5 rounded">
                  Close
                </button>
              </div>
            </div>
            <div className={`flex-1 min-h-0 grid ${preview.item.cvFileName ? 'lg:grid-cols-[minmax(0,26rem)_1fr]' : ''}`}>
              <ApplicantDetails item={preview.item} />
              {preview.item.cvFileName && (
                <div className="bg-gray-100 min-h-[50vh] lg:min-h-0 flex flex-col">
                  <div className="px-4 py-2 text-xs text-gray-600 border-b bg-white truncate">
                    CV: {preview.item.cvFileName} ({docKind(preview.item.cvMimeType)}, {fmtSize(preview.item.storedSize)} stored
                    {preview.item.originalSize > preview.item.storedSize && <>, was {fmtSize(preview.item.originalSize)}</>})
                  </div>
                  <div className="flex-1 min-h-0">
                    {preview.loading ? (
                      <p className="text-center text-gray-500 py-10">Loading document…</p>
                    ) : preview.error ? (
                      <p className="text-center text-red-600 py-10">{preview.error}</p>
                    ) : preview.html !== undefined ? (
                      // Converted Word document — sandboxed (no scripts) so the HTML can't run anything.
                      <iframe title="CV preview" sandbox="" srcDoc={preview.html} className="w-full h-full bg-white" />
                    ) : preview.item.cvMimeType.startsWith('image/') ? (
                      <div className="w-full h-full overflow-auto flex justify-center p-4">
                        <img src={preview.url} alt={preview.item.cvFileName} className="max-w-full h-auto shadow" />
                      </div>
                    ) : (
                      <iframe title="CV preview" src={preview.url} className="w-full h-full" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        open={!!confirmId}
        message="Delete this application and its CV? This cannot be undone."
        onConfirm={remove}
        onCancel={() => setConfirmId(null)}
      />
    </section>
  );
};

export default ApplicationManagement;
