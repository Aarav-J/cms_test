'use client';

import { useState, useEffect } from 'react';

type Announcement = { id: string; title: string; body: string };

type SiteData = {
  hero: { title: string; tagline: string; ctaText: string };
  about: { heading: string; body: string };
  announcements: Announcement[];
  contact: { email: string; instagram: string; meetingLocation: string };
};

type PublishStatus = 'idle' | 'loading' | 'success' | 'error';

const input =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 transition';

const textarea = input + ' resize-none';

function Section({ title, children, action }: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-sm">{title}</h2>
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Club CMS</h1>
          <p className="text-sm text-gray-400 mt-1">Enter your password to continue</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(pw); }} className="space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={input}
            autoFocus
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg py-2.5 text-sm font-semibold"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CMSPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<SiteData | null>(null);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!authed) return;
    fetch('/api/content')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setStatusMessage('Failed to load content'));
  }, [authed]);

  const handlePublish = async () => {
    if (!data) return;
    setPublishStatus('loading');
    setStatusMessage('');
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-cms-password': password },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Unknown error');
      setPublishStatus('success');
      setStatusMessage(`Pushed to GitHub · commit ${(json.sha as string).slice(0, 7)}`);
    } catch (err: unknown) {
      setPublishStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Publish failed');
    }
    setTimeout(() => { setPublishStatus('idle'); setStatusMessage(''); }, 6000);
  };

  const updateAnnouncement = (id: string, field: 'title' | 'body', value: string) =>
    setData((d) => d ? {
      ...d,
      announcements: d.announcements.map((a) => a.id === id ? { ...a, [field]: value } : a),
    } : d);

  const addAnnouncement = () =>
    setData((d) => d ? {
      ...d,
      announcements: [...d.announcements, { id: Date.now().toString(), title: '', body: '' }],
    } : d);

  const removeAnnouncement = (id: string) =>
    setData((d) => d ? { ...d, announcements: d.announcements.filter((a) => a.id !== id) } : d);

  if (!authed) {
    return <LoginScreen onLogin={(pw) => { setPassword(pw); setAuthed(true); }} />;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-400">
        Loading content…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-base">Club CMS</p>
          <p className="text-xs text-gray-400">Saves push directly to GitHub</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" rel="noreferrer"
            className="text-sm text-gray-400 hover:text-gray-700 transition underline underline-offset-2">
            Preview site ↗
          </a>
          <button
            onClick={handlePublish}
            disabled={publishStatus === 'loading'}
            className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition ${
              publishStatus === 'loading' ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {publishStatus === 'loading' ? 'Publishing…' : 'Publish to GitHub'}
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className={`px-6 py-2 text-sm font-medium ${
          publishStatus === 'success'
            ? 'bg-green-50 text-green-700 border-b border-green-100'
            : 'bg-red-50 text-red-700 border-b border-red-100'
        }`}>
          {publishStatus === 'success' ? '✓ ' : '✗ '}{statusMessage}
        </div>
      )}

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        <Section title="Hero">
          <Field label="Title">
            <input value={data.hero.title}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
              className={input} />
          </Field>
          <Field label="Tagline">
            <input value={data.hero.tagline}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, tagline: e.target.value } })}
              className={input} />
          </Field>
          <Field label="Button text">
            <input value={data.hero.ctaText}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaText: e.target.value } })}
              className={input} />
          </Field>
        </Section>

        <Section title="About">
          <Field label="Heading">
            <input value={data.about.heading}
              onChange={(e) => setData({ ...data, about: { ...data.about, heading: e.target.value } })}
              className={input} />
          </Field>
          <Field label="Body">
            <textarea value={data.about.body}
              onChange={(e) => setData({ ...data, about: { ...data.about, body: e.target.value } })}
              className={`${textarea} h-28`} />
          </Field>
        </Section>

        <Section
          title="Announcements"
          action={
            <button onClick={addAnnouncement}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">
              + Add
            </button>
          }
        >
          {data.announcements.length === 0 && (
            <p className="text-sm text-gray-400">No announcements. Hit + Add to create one.</p>
          )}
          {data.announcements.map((a, i) => (
            <div key={a.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">#{i + 1}</span>
                <button onClick={() => removeAnnouncement(a.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition">
                  Remove
                </button>
              </div>
              <Field label="Title">
                <input value={a.title}
                  onChange={(e) => updateAnnouncement(a.id, 'title', e.target.value)}
                  className={input} />
              </Field>
              <Field label="Body">
                <textarea value={a.body}
                  onChange={(e) => updateAnnouncement(a.id, 'body', e.target.value)}
                  className={`${textarea} h-20`} />
              </Field>
            </div>
          ))}
        </Section>

        <Section title="Contact">
          <Field label="Email">
            <input value={data.contact.email}
              onChange={(e) => setData({ ...data, contact: { ...data.contact, email: e.target.value } })}
              className={input} />
          </Field>
          <Field label="Instagram">
            <input value={data.contact.instagram}
              onChange={(e) => setData({ ...data, contact: { ...data.contact, instagram: e.target.value } })}
              className={input} />
          </Field>
          <Field label="Meeting location">
            <input value={data.contact.meetingLocation}
              onChange={(e) => setData({ ...data, contact: { ...data.contact, meetingLocation: e.target.value } })}
              className={input} />
          </Field>
        </Section>

        <p className="text-center text-xs text-gray-300 pb-4">
          Changes only go live when you hit "Publish to GitHub"
        </p>
      </main>
    </div>
  );
}
