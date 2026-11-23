import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/chrome/Wordmark";

type Props = {
  imageSrc: string;
  imageAlt: string;
  credit?: string;
  topRight?: { href: string; label: string };
  children: ReactNode;
};

/** Two-column auth layout: photograph + form column, matching the login references. */
export function LoginShell({ imageSrc, imageAlt, credit, topRight, children }: Props) {
  return (
    <div className="auth-shell">
      <header className="auth-top">
        <Link href="/" className="auth-back">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          <span>Wedoura</span>
        </Link>
        <Wordmark />
        {topRight ? (
          <Link href={topRight.href} className="auth-tr">
            {topRight.label}
          </Link>
        ) : (
          <span />
        )}
      </header>
      <main className="auth-wrap">
        <figure className="auth-fig" aria-hidden={imageAlt ? undefined : true}>
          <Image src={imageSrc} alt={imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" priority quality={75} />
        </figure>
        <section className="auth-col">
          {children}
          {credit ? <p className="auth-credit">{credit}</p> : null}
        </section>
      </main>
    </div>
  );
}
