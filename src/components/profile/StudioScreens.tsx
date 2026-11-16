"use client";

import { AnimatePresence, motion } from "motion/react";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Photo } from "@/components/media/Photo";
import { AlbumList } from "@/components/profile/AlbumList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Label } from "@/components/ui/Label";
import type { Vendor } from "@/data/types";
import { EASE } from "@/lib/motion";
import { useParamState } from "@/lib/url-state";

type Props = {
  vendor: Vendor;
  cityName: string;
  categoryName: string;
};

const TABS = [
  { value: "covers", label: "Cover picks" },
  { value: "albums", label: "Albums" },
  { value: "films", label: "Films" },
  { value: "pricing", label: "Pricing" },
  { value: "inquiries", label: "Inquiries" },
];

const SAMPLE_INQUIRIES = [
  { name: "T. & J.", city: "Bengaluru", date: "Sample · 2 days ago", note: "Looking for two days in October, garden wedding, around 150 guests." },
  { name: "S. & V.", city: "Delhi", date: "Sample · 5 days ago", note: "Winter wedding, mostly outdoors. Are you free around 20 December?" },
  { name: "I. & F.", city: "Mumbai", date: "Sample · last week", note: "One evening reception in town. What does your smallest package cover?" },
];

/** The studio screens: what a vendor will manage, driven by sample data. */
export function StudioScreens({ vendor, cityName, categoryName }: Props) {
  const [tab] = useParamState("tab");
  const active = TABS.some((t) => t.value === tab) ? tab : "";

  return (
    <div>
      <UnderlineTabs param="tab" label="Studio sections" allLabel="Profile" tabs={TABS} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active || "profile"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="mt-10"
        >
          {active === "" && (
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <Label>Public details</Label>
                <dl className="mt-4 border-t border-line">
                  {[
                    ["Business", vendor.name],
                    ["Category", categoryName],
                    ["City", cityName],
                    ["Tagline", vendor.tagline],
                    ["WhatsApp", vendor.whatsapp],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
                      <dt className="label text-mute">{label}</dt>
                      <dd className="text-right text-body">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <Label>About</Label>
                <div className="mt-4 flex flex-col gap-4">
                  {vendor.about.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)} className="max-w-prose text-body text-mute">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active === "covers" && (
            <div>
              <p className="max-w-prose text-small text-mute">
                The first photo is your cover; all three appear on your card.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3">
                {vendor.bestPhotos.map((photo, i) => (
                  <li key={photo.id} className="relative">
                    <div className="relative aspect-3/4 overflow-hidden bg-ivory">
                      <Photo photo={photo} mode="cover" sizes="(min-width: 48rem) 30vw, 50vw" />
                    </div>
                    <span className="label absolute top-2 left-2 bg-white px-2 py-1">
                      {i === 0 ? "Cover" : `Pick ${i + 1}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {active === "albums" &&
            (vendor.albums.length > 0 ? (
              <AlbumList albums={vendor.albums} />
            ) : (
              <EmptyState title="No albums yet." text="Albums group a wedding's photographs into one sequence." />
            ))}

          {active === "films" &&
            (vendor.films.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2">
                {vendor.films.map((film) => (
                  <FilmPreview key={film.id} film={film} sizes="(min-width: 48rem) 50vw, 100vw" />
                ))}
              </div>
            ) : (
              <EmptyState title="No films yet." text="Short previews play on your profile; full films open in the player." />
            ))}

          {active === "pricing" && (
            <ul className="border-t border-line">
              {vendor.pricing.map((line) => (
                <li key={line.label} className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-1 border-b border-line py-4">
                  <div>
                    <p className="font-serif text-h3">{line.label}</p>
                    {line.note && <p className="mt-1 text-small text-mute">{line.note}</p>}
                  </div>
                  <p className="text-body font-medium">{line.price}</p>
                </li>
              ))}
            </ul>
          )}

          {active === "inquiries" && (
            <ul className="border-t border-line">
              {SAMPLE_INQUIRIES.map((inquiry) => (
                <li key={inquiry.name} className="border-b border-line py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <p className="font-serif text-h3">
                      {inquiry.name} <span className="text-mute">· {inquiry.city}</span>
                    </p>
                    <p className="text-small text-mute">{inquiry.date}</p>
                  </div>
                  <p className="mt-2 max-w-prose text-body text-mute">{inquiry.note}</p>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
