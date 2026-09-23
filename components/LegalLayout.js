export default function LegalLayout({ title, children }) {
  return (
    <main className="min-h-screen bg-page pb-28 md:pb-10">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="font-display text-2xl font-700 text-ink">{title}</h1>
        <div className="prose-legal mt-6 space-y-4 text-sm leading-relaxed text-ink">
          {children}
        </div>
      </div>
      <style jsx global>{`
        .prose-legal h2 {
          font-family: var(--font-display, inherit);
          font-weight: 700;
          font-size: 1rem;
          color: #1b1f1e;
          margin-top: 1.75rem;
        }
        .prose-legal p, .prose-legal li {
          color: #767c7a;
        }
        .prose-legal ul {
          list-style: disc;
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .prose-legal strong {
          color: #1b1f1e;
        }
      `}</style>
    </main>
  );
}
