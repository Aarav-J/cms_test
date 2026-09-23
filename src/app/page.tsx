import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

type Announcement = { id: string; title: string; body: string };

type SiteData = {
  hero: { title: string; tagline: string; ctaText: string };
  about: { heading: string; body: string };
  announcements: Announcement[];
  contact: { email: string; instagram: string; meetingLocation: string };
};

function getContent(): SiteData {
  const raw = readFileSync(join(process.cwd(), 'content', 'site-data.json'), 'utf-8');
  return JSON.parse(raw);
}

export default function Home() {
  const d = getContent();

  return (
    <main>
      {/* ── Hero ── */}
      <section className="bg-slate-900 text-white px-6 py-28 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-4">{d.hero.title}</h1>
          <p className="text-lg text-slate-400 mb-10">{d.hero.tagline}</p>
          <button className="bg-indigo-500 hover:bg-indigo-600 transition text-white px-8 py-3 rounded-full font-semibold text-sm">
            {d.hero.ctaText}
          </button>
        </div>
      </section>

      {/* ── About ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-5">{d.about.heading}</h2>
        <p className="text-gray-600 text-lg leading-relaxed">{d.about.body}</p>
      </section>

      {/* ── Announcements ── */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Announcements</h2>
          {d.announcements.length === 0 ? (
            <p className="text-gray-400">No announcements right now.</p>
          ) : (
            <div className="space-y-4">
              {d.announcements.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-base mb-1">{a.title}</h3>
                  <p className="text-gray-600 text-sm">{a.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-6">Find Us</h2>
        <ul className="space-y-3 text-gray-700">
          <li><span className="font-medium text-gray-900">Email</span><span className="mx-2 text-gray-300">|</span>{d.contact.email}</li>
          <li><span className="font-medium text-gray-900">Instagram</span><span className="mx-2 text-gray-300">|</span>{d.contact.instagram}</li>
          <li><span className="font-medium text-gray-900">Meetings</span><span className="mx-2 text-gray-300">|</span>{d.contact.meetingLocation}</li>
        </ul>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-xs text-gray-400">
        <a href="/cms" className="hover:text-indigo-600 transition">CMS ↗</a>
      </footer>
    </main>
  );
}
