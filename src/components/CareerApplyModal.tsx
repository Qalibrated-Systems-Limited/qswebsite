'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { applicationsAPI } from '@/utils/apiFactory';

export type ApplyJob = { id: string; title: string; department: string; location: string };

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = '.pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png';
const ALLOWED_EXT = /\.(pdf|docx|jpe?g|png)$/i;

// Keep in sync with backend/src/routes/applications.ts.
const EDUCATION_LEVELS = ['Certificate', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Other'];
const EXPERIENCE_BANDS = [
  ['0-1', 'Less than 1 year'],
  ['1-3', '1 – 3 years'],
  ['3-5', '3 – 5 years'],
  ['5-10', '5 – 10 years'],
  ['10+', 'More than 10 years'],
];
const AVAILABILITY = ['Immediately', '2 weeks', '1 month', '2+ months'];

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedinUrl: '',
  educationLevel: '',
  fieldOfStudy: '',
  institution: '',
  graduationYear: '',
  yearsExperience: '',
  currentTitle: '',
  currentEmployer: '',
  experienceSummary: '',
  skills: '',
  certifications: '',
  availability: '',
  expectedSalary: '',
  willingToTravel: false,
  message: '',
  consent: false,
  website: '', // honeypot
};

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-black focus:outline-none focus:ring-2 focus:ring-amber-400';
const label = 'block text-sm font-semibold text-gray-800 mb-1';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-xs font-extrabold uppercase tracking-widest text-amber-600 mb-1">{title}</legend>
      {children}
    </fieldset>
  );
}

// Application form used by every role on the Careers page (and for general
// applications). Submits straight to the website's database; the backend stores
// the optional CV compressed and emails recruitment an alert.
export default function CareerApplyModal({ job, onClose }: { job: ApplyJob | null | undefined; onClose: () => void }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !sending && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, sending]);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [error]);

  const set = <K extends keyof typeof EMPTY>(key: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const pickFile = (f: File | undefined) => {
    setError('');
    if (!f) return setFile(null);
    if (!ALLOWED_EXT.test(f.name)) {
      setFile(null);
      return setError('Please upload your CV as a PDF, Word (.docx) or image (JPG/PNG) file.');
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      return setError('Your CV must be 5 MB or smaller.');
    }
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return setError('Please agree to us processing your details for recruitment.');
    setSending(true);
    setError('');
    try {
      const fd = new FormData();
      if (job) fd.append('careerId', job.id);
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (file) fd.append('cv', file);
      await applicationsAPI.submit(fd);
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'We couldn’t submit your application. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const title = job ? `Apply: ${job.title}` : 'General application';
  const thisYear = new Date().getFullYear();

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
      onClick={() => !sending && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 flex items-start justify-between gap-4 p-6 pb-3 border-b">
          <div>
            <h3 className="text-xl font-extrabold text-black">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {job ? `${job.department} · ${job.location}` : 'Tell us about yourself for future opportunities.'}
            </p>
          </div>
          <button onClick={onClose} disabled={sending} aria-label="Close" className="text-gray-500 hover:text-black">
            <X size={22} />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto text-green-600" size={48} />
            <p className="mt-4 text-lg font-bold text-black">Application received — thank you!</p>
            <p className="mt-2 text-gray-600 text-sm">
              Our recruitment team will review your application and get in touch if your profile matches the role.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-amber-400 text-black rounded-full font-bold hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 grid gap-7">
            <Section title="Personal details">
              <div>
                <label className={label}>Full name *</label>
                <input required maxLength={120} autoComplete="name" className={input} value={form.fullName} onChange={set('fullName')} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={label}>Email *</label>
                  <input required type="email" maxLength={200} autoComplete="email" className={input} value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className={label}>Phone *</label>
                  <input required type="tel" maxLength={40} autoComplete="tel" className={input} value={form.phone} onChange={set('phone')} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={label}>Current location (town / county) *</label>
                  <input required maxLength={120} className={input} value={form.location} onChange={set('location')} />
                </div>
                <div>
                  <label className={label}>LinkedIn / portfolio link</label>
                  <input maxLength={300} inputMode="url" placeholder="linkedin.com/in/…" className={input} value={form.linkedinUrl} onChange={set('linkedinUrl')} />
                </div>
              </div>
            </Section>

            <Section title="Education">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={label}>Highest level of education *</label>
                  <select required className={input} value={form.educationLevel} onChange={set('educationLevel')}>
                    <option value="">Select…</option>
                    {EDUCATION_LEVELS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Field of study *</label>
                  <input required maxLength={150} placeholder="e.g. Electrical Engineering" className={input} value={form.fieldOfStudy} onChange={set('fieldOfStudy')} />
                </div>
              </div>
              <div className="grid sm:grid-cols-[1fr_10rem] gap-3">
                <div>
                  <label className={label}>Institution *</label>
                  <input required maxLength={150} className={input} value={form.institution} onChange={set('institution')} />
                </div>
                <div>
                  <label className={label}>Year completed</label>
                  <input type="number" min={1950} max={thisYear + 6} className={input} value={form.graduationYear} onChange={set('graduationYear')} />
                </div>
              </div>
              <div>
                <label className={label}>Professional certifications / licences</label>
                <textarea rows={2} maxLength={2000} placeholder="e.g. EBK registration, ISO/IEC 17025 training, driving licence" className={input} value={form.certifications} onChange={set('certifications')} />
              </div>
            </Section>

            <Section title="Experience & skills">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className={label}>Years of experience *</label>
                  <select required className={input} value={form.yearsExperience} onChange={set('yearsExperience')}>
                    <option value="">Select…</option>
                    {EXPERIENCE_BANDS.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Current / last job title</label>
                  <input maxLength={150} className={input} value={form.currentTitle} onChange={set('currentTitle')} />
                </div>
                <div>
                  <label className={label}>Current / last employer</label>
                  <input maxLength={150} className={input} value={form.currentEmployer} onChange={set('currentEmployer')} />
                </div>
              </div>
              <div>
                <label className={label}>Relevant work experience *</label>
                <textarea required rows={4} maxLength={4000} placeholder="Roles held, key responsibilities and achievements relevant to this position" className={input} value={form.experienceSummary} onChange={set('experienceSummary')} />
              </div>
              <div>
                <label className={label}>Key skills *</label>
                <textarea required rows={2} maxLength={2000} placeholder="e.g. load cell installation, PLC programming, AutoCAD" className={input} value={form.skills} onChange={set('skills')} />
              </div>
            </Section>

            <Section title="Availability">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={label}>When can you start? *</label>
                  <select required className={input} value={form.availability} onChange={set('availability')}>
                    <option value="">Select…</option>
                    {AVAILABILITY.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Expected monthly salary (KES)</label>
                  <input maxLength={60} className={input} value={form.expectedSalary} onChange={set('expectedSalary')} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={form.willingToTravel} onChange={set('willingToTravel')} />
                I am willing to travel to client sites / relocate if required
              </label>
              <div>
                <label className={label}>Why do you want to join Qalibrated?</label>
                <textarea rows={3} maxLength={3000} className={input} value={form.message} onChange={set('message')} />
              </div>
            </Section>

            <Section title="CV (optional)">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-lg px-4 py-4 text-center transition"
              >
                <Upload className="mx-auto text-amber-500" size={22} />
                <span className="block mt-1 text-sm font-semibold text-black break-all">{file ? file.name : 'Attach a CV'}</span>
                <span className="block text-xs text-gray-500 mt-1">PDF, Word (.docx), JPG or PNG · max 5 MB</span>
              </button>
              {file && (
                <button type="button" onClick={() => pickFile(undefined)} className="text-xs text-gray-500 hover:text-red-600 justify-self-start">
                  Remove file
                </button>
              )}
              <input ref={fileInput} type="file" accept={ACCEPT} className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
            </Section>

            {/* Honeypot — hidden from people, filled by bots. */}
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={set('website')} />

            <div className="grid gap-3">
              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input type="checkbox" className="mt-1" checked={form.consent} onChange={set('consent')} />
                <span>
                  I confirm the information above is accurate and I agree to Qalibrated Systems Limited processing my
                  details for recruitment purposes. *
                </span>
              </label>

              {error && (
                <p ref={errorRef} className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 text-black rounded-full font-bold hover:opacity-90 transition disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Submitting…
                  </>
                ) : (
                  'Submit application'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
