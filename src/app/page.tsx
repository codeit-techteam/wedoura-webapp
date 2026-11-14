import Link from "next/link";

// Placeholder until the homepage is built (build order step 3).
export default function HomePage() {
  return (
    <main className="container-site flex flex-1 flex-col items-start justify-center py-section">
      <p className="label text-gold">Wedoura</p>
      <h1 className="mt-4 text-display">
        Weddings, <em>seen whole</em>.
      </h1>
      <p className="mt-6 max-w-prose text-lead font-serif text-mute">
        The homepage is next on the build list. The foundations live on the styleguide.
      </p>
      <Link href="/styleguide" className="label mt-10 inline-flex tap items-center border-b border-gold pb-1">
        Open the styleguide
      </Link>
    </main>
  );
}
