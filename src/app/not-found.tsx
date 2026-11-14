import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-site flex flex-1 flex-col items-start justify-center py-section">
      <p className="label text-gold">404</p>
      <h1 className="mt-4 text-h1">
        This page has <em>wandered off</em>.
      </h1>
      <Link href="/" className="label mt-10 inline-flex tap items-center border-b border-gold pb-1">
        Back to the homepage
      </Link>
    </main>
  );
}
