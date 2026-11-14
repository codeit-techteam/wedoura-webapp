"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { PRIMARY_LINKS, type NavCategory } from "@/components/chrome/Navbar";
import { SavedCount } from "@/components/chrome/SavedCount";
import { Wordmark } from "@/components/chrome/Wordmark";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import { useFocusTrap } from "@/lib/focus-trap";
import { EASE } from "@/lib/motion";

type Props = {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
  categories: NavCategory[];
};

const list = { show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } }, hide: {} };
const item = {
  hide: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Full-screen menu for phones. Large serif links that fade and rise in sequence. */
export function MobileMenu({ open, onClose, onSearch, categories }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(rootRef, open, closeRef);

  const big = "inline-flex tap items-center font-serif text-menu font-light text-ink";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={rootRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white text-ink"
        >
          <div className="container-site flex h-nav shrink-0 items-center justify-between border-b border-line">
            <Wordmark size="menu" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="-mr-2 inline-flex tap items-center justify-center"
            >
              <Icon name="close" size={24} />
            </button>
          </div>

          <motion.nav
            aria-label="Menu"
            variants={list}
            initial="hide"
            animate="show"
            className="container-site flex flex-1 flex-col py-10 pb-section-sm"
          >
            <ul className="flex flex-col gap-2">
              <motion.li variants={item}>
                <Link href="/vendors" onClick={onClose} className={big}>
                  Vendors
                </Link>
              </motion.li>
              {PRIMARY_LINKS.map((link) => (
                <motion.li key={link.href} variants={item}>
                  <Link href={link.href} onClick={onClose} className={big}>
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li variants={item}>
                <Link href="/gallery" onClick={onClose} className={big}>
                  Gallery
                </Link>
              </motion.li>
            </ul>

            <motion.div variants={item} className="mt-10 border-t border-line pt-8">
              <Label>Vendors by category</Label>
              <ul className="mt-3 grid grid-cols-2 gap-x-6">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/vendors?category=${category.slug}`}
                      onClick={onClose}
                      className="inline-flex tap items-center text-body text-ink"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.ul variants={item} className="mt-8 flex flex-col gap-1 border-t border-line pt-8">
              <li>
                <button type="button" onClick={onSearch} className="inline-flex tap items-center gap-3 text-body text-ink">
                  <Icon name="search" size={20} />
                  Search
                </button>
              </li>
              <li>
                <Link href="/saved" onClick={onClose} className="inline-flex tap items-center gap-3 text-body text-ink">
                  <Icon name="bookmark" size={20} />
                  Saved
                  <SavedCount />
                </Link>
              </li>
              <li>
                <Link href="/login" onClick={onClose} className="inline-flex tap items-center text-body text-ink">
                  Vendor login
                </Link>
              </li>
            </motion.ul>

            <motion.div variants={item} className="mt-auto pt-10">
              <Link
                href="/list-your-business"
                onClick={onClose}
                className="nav-link inline-flex tap w-full items-center justify-center border border-ink bg-ink px-6 text-white"
              >
                List Your Business
              </Link>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
