"use client";

import { Field, inputClass, selectClass } from "@/components/studio/Field";
import { TagListInput } from "@/components/studio/screen";
import type {
  Photo,
  VenueDetails,
  VenueRuleStatus,
  VenueSpaceDetail,
} from "@/data/types";

type Props = {
  venue: VenueDetails;
  portfolio: Photo[];
  onChange: (venue: VenueDetails) => void;
};

const addButtonClass =
  "mt-4 border-b border-gold pb-1 text-button tracking-[0.2em] uppercase";
const removeButtonClass = "mt-3 text-small text-mute";
const cardClass = "grid gap-3 border border-line p-4";

function numOptional(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function newSceneId(): string {
  return `scene-${Date.now().toString(36)}`;
}

function Subheading({ children }: { children: string }) {
  return <p className="label mt-8 text-mute first:mt-0">{children}</p>;
}

export function VenueFields({ venue, portfolio, onChange }: Props) {
  const patch = (partial: Partial<VenueDetails>) => onChange({ ...venue, ...partial });

  const flatPhotos = portfolio;
  const panoPhotos = portfolio.filter((p) => p.projection === "equirectangular");

  const spaceDetails = venue.spaceDetails ?? [];
  const roomTiers = venue.roomTiers ?? [];
  const menus = venue.food?.menus ?? [];
  const ruleItems = venue.rules?.items ?? [];
  const overviewFacts = venue.overviewFacts ?? [];
  const distances = venue.location?.distances ?? [];
  const tour = venue.tour ?? { scenes: [], links: [], markers: [] };
  const scenes = tour.scenes ?? [];
  const links = tour.links ?? [];
  const markers = tour.markers ?? [];

  const estimate = venue.estimate ?? { venueHireINR: 0, events: [] };

  return (
    <div className="grid gap-2">
      <Subheading>Capacity</Subheading>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Field id="vf-cap-min" label="Min guests">
          <input
            id="vf-cap-min"
            className={inputClass}
            inputMode="numeric"
            value={venue.capacity.min}
            onChange={(e) =>
              patch({
                capacity: { min: Number(e.target.value) || 0, max: venue.capacity.max },
              })
            }
          />
        </Field>
        <Field id="vf-cap-max" label="Max guests">
          <input
            id="vf-cap-max"
            className={inputClass}
            inputMode="numeric"
            value={venue.capacity.max}
            onChange={(e) =>
              patch({
                capacity: { min: venue.capacity.min, max: Number(e.target.value) || 0 },
              })
            }
          />
        </Field>
      </div>
      <Field id="vf-cap-note" label="Capacity note" hint="Optional line under the planner on your profile.">
        <input
          id="vf-cap-note"
          className={inputClass}
          value={venue.capacityNote ?? ""}
          onChange={(e) => patch({ capacityNote: e.target.value.trim() || undefined })}
        />
      </Field>

      <Subheading>Space names</Subheading>
      <Field id="vf-spaces" label="Spaces" hint="Short names couples see in filters and summaries.">
        <TagListInput
          id="vf-spaces"
          values={venue.spaces}
          onChange={(spaces) => patch({ spaces })}
          placeholder="e.g. Lawn"
        />
      </Field>

      <Subheading>Space details</Subheading>
      <ul className="mt-3 grid gap-4">
        {spaceDetails.map((space, i) => (
          <li key={i} className={cardClass}>
            <input
              className={inputClass}
              value={space.name}
              placeholder="Name"
              onChange={(e) => {
                const next = spaceDetails.map((s, idx) =>
                  idx === i ? { ...s, name: e.target.value } : s,
                );
                patch({ spaceDetails: next });
              }}
            />
            <input
              className={inputClass}
              value={space.kind ?? ""}
              placeholder="Kind (e.g. Outdoor · lawn)"
              onChange={(e) => {
                const next = spaceDetails.map((s, idx) =>
                  idx === i ? { ...s, kind: e.target.value.trim() || undefined } : s,
                );
                patch({ spaceDetails: next });
              }}
            />
            <Field id={`vf-space-setting-${i}`} label="Setting">
              <select
                id={`vf-space-setting-${i}`}
                className={selectClass}
                value={space.setting ?? ""}
                onChange={(e) => {
                  const setting = e.target.value as VenueSpaceDetail["setting"] | "";
                  const next = spaceDetails.map((s, idx) =>
                    idx === i
                      ? { ...s, setting: setting || undefined }
                      : s,
                  );
                  patch({ spaceDetails: next });
                }}
              >
                <option value="">Not set</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="covered">Covered</option>
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["ceremony", "Ceremony"],
                  ["dinner", "Dinner"],
                  ["standing", "Standing"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} id={`vf-space-${key}-${i}`} label={label}>
                  <input
                    id={`vf-space-${key}-${i}`}
                    className={inputClass}
                    inputMode="numeric"
                    value={space[key] ?? ""}
                    onChange={(e) => {
                      const val = numOptional(e.target.value);
                      const next = spaceDetails.map((s, idx) =>
                        idx === i ? { ...s, [key]: val } : s,
                      );
                      patch({ spaceDetails: next });
                    }}
                  />
                </Field>
              ))}
            </div>
            <input
              className={inputClass}
              value={space.area ?? ""}
              placeholder="Area label (optional)"
              onChange={(e) => {
                const next = spaceDetails.map((s, idx) =>
                  idx === i ? { ...s, area: e.target.value.trim() || undefined } : s,
                );
                patch({ spaceDetails: next });
              }}
            />
            <Field id={`vf-space-sqft-${i}`} label="Area (sq ft)">
              <input
                id={`vf-space-sqft-${i}`}
                className={inputClass}
                inputMode="numeric"
                value={space.areaSqFt ?? ""}
                onChange={(e) => {
                  const next = spaceDetails.map((s, idx) =>
                    idx === i ? { ...s, areaSqFt: numOptional(e.target.value) } : s,
                  );
                  patch({ spaceDetails: next });
                }}
              />
            </Field>
            <Field id={`vf-space-best-${i}`} label="Best for">
              <TagListInput
                id={`vf-space-best-${i}`}
                values={space.bestFor ?? []}
                onChange={(bestFor) => {
                  const next = spaceDetails.map((s, idx) =>
                    idx === i ? { ...s, bestFor: bestFor.length ? bestFor : undefined } : s,
                  );
                  patch({ spaceDetails: next });
                }}
                placeholder="Ceremony"
              />
            </Field>
            <Field id={`vf-space-photo-${i}`} label="Card photo">
              <select
                id={`vf-space-photo-${i}`}
                className={selectClass}
                value={space.photoId ?? ""}
                onChange={(e) => {
                  const next = spaceDetails.map((s, idx) =>
                    idx === i ? { ...s, photoId: e.target.value || undefined } : s,
                  );
                  patch({ spaceDetails: next });
                }}
              >
                <option value="">None</option>
                {flatPhotos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id}
                  </option>
                ))}
              </select>
            </Field>
            <Field id={`vf-space-scene-${i}`} label="Tour scene id">
              <input
                id={`vf-space-scene-${i}`}
                className={inputClass}
                value={space.sceneId ?? ""}
                onChange={(e) => {
                  const next = spaceDetails.map((s, idx) =>
                    idx === i ? { ...s, sceneId: e.target.value.trim() || undefined } : s,
                  );
                  patch({ spaceDetails: next });
                }}
              />
            </Field>
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => patch({ spaceDetails: spaceDetails.filter((_, idx) => idx !== i) })}
            >
              Remove space
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={addButtonClass}
        onClick={() =>
          patch({
            spaceDetails: [
              ...spaceDetails,
              { name: "New space", setting: "outdoor" },
            ],
          })
        }
      >
        + Add space detail
      </button>

      <Subheading>Room tiers</Subheading>
      <ul className="mt-3 grid gap-4">
        {roomTiers.map((tier, i) => (
          <li key={i} className={cardClass}>
            <input
              className={inputClass}
              value={tier.name}
              placeholder="Tier name"
              onChange={(e) => {
                const next = roomTiers.map((t, idx) =>
                  idx === i ? { ...t, name: e.target.value } : t,
                );
                patch({ roomTiers: next });
              }}
            />
            <input
              className={inputClass}
              value={tier.countLabel}
              placeholder="Count label (e.g. 12)"
              onChange={(e) => {
                const next = roomTiers.map((t, idx) =>
                  idx === i ? { ...t, countLabel: e.target.value } : t,
                );
                patch({ roomTiers: next });
              }}
            />
            <textarea
              className={inputClass + " resize-y"}
              rows={2}
              value={tier.description ?? ""}
              placeholder="Description"
              onChange={(e) => {
                const next = roomTiers.map((t, idx) =>
                  idx === i ? { ...t, description: e.target.value.trim() || undefined } : t,
                );
                patch({ roomTiers: next });
              }}
            />
            <input
              className={inputClass}
              inputMode="numeric"
              value={tier.rateFromINR ?? ""}
              placeholder="Rate from (INR)"
              onChange={(e) => {
                const next = roomTiers.map((t, idx) =>
                  idx === i ? { ...t, rateFromINR: numOptional(e.target.value) } : t,
                );
                patch({ roomTiers: next });
              }}
            />
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => patch({ roomTiers: roomTiers.filter((_, idx) => idx !== i) })}
            >
              Remove tier
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={addButtonClass}
        onClick={() =>
          patch({
            roomTiers: [...roomTiers, { name: "New tier", countLabel: "" }],
          })
        }
      >
        + Add room tier
      </button>

      <Subheading>Food & catering</Subheading>
      <div className="mt-3 grid gap-4">
        <Field id="vf-catering-mode" label="Catering mode">
          <input
            id="vf-catering-mode"
            className={inputClass}
            value={venue.food?.cateringMode ?? ""}
            onChange={(e) =>
              patch({
                food: {
                  ...venue.food,
                  cateringMode: e.target.value.trim() || undefined,
                },
              })
            }
          />
        </Field>
        <Field id="vf-cuisines" label="Cuisines">
          <TagListInput
            id="vf-cuisines"
            values={venue.food?.cuisines ?? []}
            onChange={(cuisines) =>
              patch({
                food: {
                  ...venue.food,
                  cuisines: cuisines.length ? cuisines : undefined,
                },
              })
            }
            placeholder="Goan"
          />
        </Field>
        <Field id="vf-outside-fee" label="Outside caterer fee (INR per guest)">
          <input
            id="vf-outside-fee"
            className={inputClass}
            inputMode="numeric"
            value={venue.food?.outsideCatererFeeINR ?? ""}
            onChange={(e) =>
              patch({
                food: {
                  ...venue.food,
                  outsideCatererFeeINR: numOptional(e.target.value),
                },
              })
            }
          />
        </Field>
      </div>
      <p className="label mt-6 text-mute">Menus</p>
      <ul className="mt-3 grid gap-4">
        {menus.map((menu, i) => (
          <li key={i} className={cardClass}>
            <input
              className={inputClass}
              value={menu.name}
              placeholder="Menu name"
              onChange={(e) => {
                const next = menus.map((m, idx) =>
                  idx === i ? { ...m, name: e.target.value } : m,
                );
                patch({ food: { ...venue.food, menus: next } });
              }}
            />
            <input
              className={inputClass}
              value={menu.note ?? ""}
              placeholder="Note"
              onChange={(e) => {
                const next = menus.map((m, idx) =>
                  idx === i ? { ...m, note: e.target.value.trim() || undefined } : m,
                );
                patch({ food: { ...venue.food, menus: next } });
              }}
            />
            <input
              className={inputClass}
              inputMode="numeric"
              value={menu.pricePerGuestINR ?? ""}
              placeholder="Price per guest (INR)"
              onChange={(e) => {
                const next = menus.map((m, idx) =>
                  idx === i ? { ...m, pricePerGuestINR: numOptional(e.target.value) } : m,
                );
                patch({ food: { ...venue.food, menus: next } });
              }}
            />
            <input
              className={inputClass}
              inputMode="numeric"
              value={menu.minimumGuests ?? ""}
              placeholder="Minimum guests"
              onChange={(e) => {
                const next = menus.map((m, idx) =>
                  idx === i ? { ...m, minimumGuests: numOptional(e.target.value) } : m,
                );
                patch({ food: { ...venue.food, menus: next } });
              }}
            />
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => {
                const next = menus.filter((_, idx) => idx !== i);
                patch({ food: { ...venue.food, menus: next.length ? next : undefined } });
              }}
            >
              Remove menu
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={addButtonClass}
        onClick={() =>
          patch({
            food: {
              ...venue.food,
              menus: [...menus, { name: "New menu" }],
            },
          })
        }
      >
        + Add menu
      </button>

      <Subheading>Rules</Subheading>
      <ul className="mt-3 grid gap-4">
        {ruleItems.map((rule, i) => (
          <li key={i} className={cardClass}>
            <Field id={`vf-rule-status-${i}`} label="Status">
              <select
                id={`vf-rule-status-${i}`}
                className={selectClass}
                value={rule.status}
                onChange={(e) => {
                  const status = e.target.value as VenueRuleStatus;
                  const next = ruleItems.map((r, idx) => (idx === i ? { ...r, status } : r));
                  patch({ rules: { ...venue.rules, items: next } });
                }}
              >
                <option value="allowed">Allowed</option>
                <option value="conditions">Conditions</option>
                <option value="forbidden">Forbidden</option>
              </select>
            </Field>
            <input
              className={inputClass}
              value={rule.title}
              placeholder="Title"
              onChange={(e) => {
                const next = ruleItems.map((r, idx) =>
                  idx === i ? { ...r, title: e.target.value } : r,
                );
                patch({ rules: { ...venue.rules, items: next } });
              }}
            />
            <textarea
              className={inputClass + " resize-y"}
              rows={2}
              value={rule.detail}
              placeholder="Detail"
              onChange={(e) => {
                const next = ruleItems.map((r, idx) =>
                  idx === i ? { ...r, detail: e.target.value } : r,
                );
                patch({ rules: { ...venue.rules, items: next } });
              }}
            />
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => {
                const next = ruleItems.filter((_, idx) => idx !== i);
                patch({ rules: { ...venue.rules, items: next.length ? next : undefined } });
              }}
            >
              Remove rule
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={addButtonClass}
        onClick={() =>
          patch({
            rules: {
              ...venue.rules,
              items: [...ruleItems, { status: "allowed" as const, title: "", detail: "" }],
            },
          })
        }
      >
        + Add rule
      </button>

      <Subheading>Overview facts</Subheading>
      <ul className="mt-3 grid gap-4">
        {overviewFacts.map((fact, i) => (
          <li key={i} className={cardClass}>
            <input
              className={inputClass}
              value={fact.label}
              placeholder="Label"
              onChange={(e) => {
                const next = overviewFacts.map((f, idx) =>
                  idx === i ? { ...f, label: e.target.value } : f,
                );
                patch({ overviewFacts: next });
              }}
            />
            <input
              className={inputClass}
              value={fact.value}
              placeholder="Value"
              onChange={(e) => {
                const next = overviewFacts.map((f, idx) =>
                  idx === i ? { ...f, value: e.target.value } : f,
                );
                patch({ overviewFacts: next });
              }}
            />
            <input
              className={inputClass}
              value={fact.note ?? ""}
              placeholder="Note (optional)"
              onChange={(e) => {
                const next = overviewFacts.map((f, idx) =>
                  idx === i ? { ...f, note: e.target.value.trim() || undefined } : f,
                );
                patch({ overviewFacts: next });
              }}
            />
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => {
                const next = overviewFacts.filter((_, idx) => idx !== i);
                patch({ overviewFacts: next.length ? next : undefined });
              }}
            >
              Remove fact
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={addButtonClass}
        onClick={() =>
          patch({
            overviewFacts: [...overviewFacts, { label: "", value: "" }],
          })
        }
      >
        + Add overview fact
      </button>

      <Subheading>Estimate calculator</Subheading>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Field id="vf-hire" label="Venue hire (INR)">
          <input
            id="vf-hire"
            className={inputClass}
            inputMode="numeric"
            value={estimate.venueHireINR}
            onChange={(e) =>
              patch({
                estimate: {
                  ...estimate,
                  venueHireINR: Number(e.target.value) || 0,
                },
              })
            }
          />
        </Field>
        <Field id="vf-rooms-pkg" label="Rooms package (INR)">
          <input
            id="vf-rooms-pkg"
            className={inputClass}
            inputMode="numeric"
            value={estimate.roomsPackageINR ?? ""}
            onChange={(e) =>
              patch({
                estimate: {
                  ...estimate,
                  roomsPackageINR: numOptional(e.target.value),
                },
              })
            }
          />
        </Field>
        <Field id="vf-rooms-label" label="Rooms package label" className="sm:col-span-2">
          <input
            id="vf-rooms-label"
            className={inputClass}
            value={estimate.roomsPackageLabel ?? ""}
            onChange={(e) =>
              patch({
                estimate: {
                  ...estimate,
                  roomsPackageLabel: e.target.value.trim() || undefined,
                },
              })
            }
          />
        </Field>
      </div>
      <Field id="vf-estimate-events" label="Events" hint="Chips in the estimate tool.">
        <TagListInput
          id="vf-estimate-events"
          values={estimate.events}
          onChange={(events) => patch({ estimate: { ...estimate, events } })}
          placeholder="Wedding"
        />
      </Field>

      <Subheading>Seasonality</Subheading>
      <div className="mt-3 grid gap-6">
        <Field id="vf-peak" label="Peak months">
          <TagListInput
            id="vf-peak"
            values={venue.peakMonths ?? []}
            onChange={(peakMonths) => patch({ peakMonths: peakMonths.length ? peakMonths : undefined })}
            placeholder="Dec"
          />
        </Field>
        <Field id="vf-value" label="Value months">
          <TagListInput
            id="vf-value"
            values={venue.valueMonths ?? []}
            onChange={(valueMonths) => patch({ valueMonths: valueMonths.length ? valueMonths : undefined })}
            placeholder="Mar"
          />
        </Field>
        <Field id="vf-closed" label="Closed months">
          <TagListInput
            id="vf-closed"
            values={venue.closedMonths ?? []}
            onChange={(closedMonths) => patch({ closedMonths: closedMonths.length ? closedMonths : undefined })}
            placeholder="Jul"
          />
        </Field>
      </div>

      <Subheading>Location</Subheading>
      <div className="mt-3 grid gap-4">
        <Field id="vf-address" label="Address">
          <input
            id="vf-address"
            className={inputClass}
            value={venue.location?.address ?? ""}
            onChange={(e) =>
              patch({
                location: {
                  ...venue.location,
                  address: e.target.value.trim() || undefined,
                },
              })
            }
          />
        </Field>
        <Field id="vf-map" label="Map URL">
          <input
            id="vf-map"
            className={inputClass}
            value={venue.location?.mapUrl ?? ""}
            placeholder="https://"
            onChange={(e) =>
              patch({
                location: {
                  ...venue.location,
                  mapUrl: e.target.value.trim() || undefined,
                },
              })
            }
          />
        </Field>
      </div>
      <p className="label mt-6 text-mute">Distances</p>
      <ul className="mt-3 grid gap-4">
        {distances.map((row, i) => (
          <li key={i} className={cardClass}>
            <input
              className={inputClass}
              value={row.label}
              placeholder="Label"
              onChange={(e) => {
                const next = distances.map((d, idx) =>
                  idx === i ? { ...d, label: e.target.value } : d,
                );
                patch({ location: { ...venue.location, distances: next } });
              }}
            />
            <input
              className={inputClass}
              value={row.value}
              placeholder="Value"
              onChange={(e) => {
                const next = distances.map((d, idx) =>
                  idx === i ? { ...d, value: e.target.value } : d,
                );
                patch({ location: { ...venue.location, distances: next } });
              }}
            />
            <input
              className={inputClass}
              value={row.detail ?? ""}
              placeholder="Detail (optional)"
              onChange={(e) => {
                const next = distances.map((d, idx) =>
                  idx === i ? { ...d, detail: e.target.value.trim() || undefined } : d,
                );
                patch({ location: { ...venue.location, distances: next } });
              }}
            />
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => {
                const next = distances.filter((_, idx) => idx !== i);
                patch({
                  location: {
                    ...venue.location,
                    distances: next.length ? next : undefined,
                  },
                });
              }}
            >
              Remove distance
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={addButtonClass}
        onClick={() =>
          patch({
            location: {
              ...venue.location,
              distances: [...distances, { label: "", value: "" }],
            },
          })
        }
      >
        + Add distance
      </button>

      <Subheading>360° tour</Subheading>
      <p className="mt-2 text-small text-mute">
        Scenes use equirectangular photos from your portfolio. Mark photos as 360° in Photos and videos.
      </p>
      <p className="label mt-6 text-mute">Scenes</p>
      <ul className="mt-3 grid gap-4">
        {scenes.map((scene, i) => (
          <li key={i} className={cardClass}>
            <input
              className={inputClass}
              value={scene.id}
              placeholder="Scene id"
              onChange={(e) => {
                const next = scenes.map((s, idx) =>
                  idx === i ? { ...s, id: e.target.value } : s,
                );
                patch({ tour: { ...tour, scenes: next } });
              }}
            />
            <Field id={`vf-scene-photo-${i}`} label="Equirectangular photo">
              <select
                id={`vf-scene-photo-${i}`}
                className={selectClass}
                value={scene.photoId}
                onChange={(e) => {
                  const next = scenes.map((s, idx) =>
                    idx === i ? { ...s, photoId: e.target.value } : s,
                  );
                  patch({ tour: { ...tour, scenes: next } });
                }}
              >
                {panoPhotos.length === 0 ? (
                  <option value="">No 360° photos yet</option>
                ) : (
                  panoPhotos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id}
                    </option>
                  ))
                )}
              </select>
            </Field>
            <input
              className={inputClass}
              value={scene.name}
              placeholder="Scene name"
              onChange={(e) => {
                const next = scenes.map((s, idx) =>
                  idx === i ? { ...s, name: e.target.value } : s,
                );
                patch({ tour: { ...tour, scenes: next } });
              }}
            />
            <Field id={`vf-scene-yaw-${i}`} label="Start yaw (degrees)">
              <input
                id={`vf-scene-yaw-${i}`}
                className={inputClass}
                inputMode="numeric"
                value={scene.startYaw ?? ""}
                onChange={(e) => {
                  const next = scenes.map((s, idx) =>
                    idx === i ? { ...s, startYaw: numOptional(e.target.value) } : s,
                  );
                  patch({ tour: { ...tour, scenes: next } });
                }}
              />
            </Field>
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => {
                const next = scenes.filter((_, idx) => idx !== i);
                patch({
                  tour: {
                    ...tour,
                    scenes: next,
                  },
                });
              }}
            >
              Remove scene
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={addButtonClass}
        onClick={() => {
          const id = newSceneId();
          const photoId = panoPhotos[0]?.id ?? "";
          patch({
            tour: {
              ...tour,
              scenes: [...scenes, { id, photoId, name: "New scene" }],
            },
          });
        }}
      >
        + Add scene
      </button>

      <p className="label mt-6 text-mute">Links</p>
      <ul className="mt-3 grid gap-4">
        {links.map((link, i) => (
          <li key={i} className={cardClass}>
            <input
              className={inputClass}
              value={link.from}
              placeholder="From scene id"
              onChange={(e) => {
                const next = links.map((l, idx) =>
                  idx === i ? { ...l, from: e.target.value } : l,
                );
                patch({ tour: { ...tour, links: next } });
              }}
            />
            <input
              className={inputClass}
              value={link.to}
              placeholder="To scene id"
              onChange={(e) => {
                const next = links.map((l, idx) =>
                  idx === i ? { ...l, to: e.target.value } : l,
                );
                patch({ tour: { ...tour, links: next } });
              }}
            />
            <Field id={`vf-link-yaw-${i}`} label="Yaw">
              <input
                id={`vf-link-yaw-${i}`}
                className={inputClass}
                inputMode="numeric"
                value={link.yaw}
                onChange={(e) => {
                  const next = links.map((l, idx) =>
                    idx === i ? { ...l, yaw: Number(e.target.value) || 0 } : l,
                  );
                  patch({ tour: { ...tour, links: next } });
                }}
              />
            </Field>
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => {
                const next = links.filter((_, idx) => idx !== i);
                patch({ tour: { ...tour, links: next } });
              }}
            >
              Remove link
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={addButtonClass}
        onClick={() =>
          patch({
            tour: {
              ...tour,
              links: [...links, { from: "", to: "", yaw: 0 }],
            },
          })
        }
      >
        + Add link
      </button>

      <p className="label mt-6 text-mute">Markers</p>
      <ul className="mt-3 grid gap-4">
        {(markers ?? []).map((marker, i) => (
          <li key={i} className={cardClass}>
            <input
              className={inputClass}
              value={marker.scene}
              placeholder="Scene id"
              onChange={(e) => {
                const list = markers ?? [];
                const next = list.map((m, idx) =>
                  idx === i ? { ...m, scene: e.target.value } : m,
                );
                patch({ tour: { ...tour, markers: next } });
              }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id={`vf-marker-yaw-${i}`} label="Yaw">
                <input
                  id={`vf-marker-yaw-${i}`}
                  className={inputClass}
                  inputMode="numeric"
                  value={marker.yaw}
                  onChange={(e) => {
                    const list = markers ?? [];
                    const next = list.map((m, idx) =>
                      idx === i ? { ...m, yaw: Number(e.target.value) || 0 } : m,
                    );
                    patch({ tour: { ...tour, markers: next } });
                  }}
                />
              </Field>
              <Field id={`vf-marker-pitch-${i}`} label="Pitch">
                <input
                  id={`vf-marker-pitch-${i}`}
                  className={inputClass}
                  inputMode="numeric"
                  value={marker.pitch}
                  onChange={(e) => {
                    const list = markers ?? [];
                    const next = list.map((m, idx) =>
                      idx === i ? { ...m, pitch: Number(e.target.value) || 0 } : m,
                    );
                    patch({ tour: { ...tour, markers: next } });
                  }}
                />
              </Field>
            </div>
            <input
              className={inputClass}
              value={marker.label}
              placeholder="Label"
              onChange={(e) => {
                const list = markers ?? [];
                const next = list.map((m, idx) =>
                  idx === i ? { ...m, label: e.target.value } : m,
                );
                patch({ tour: { ...tour, markers: next } });
              }}
            />
            <button
              type="button"
              className={removeButtonClass}
              onClick={() => {
                const list = markers ?? [];
                const next = list.filter((_, idx) => idx !== i);
                patch({ tour: { ...tour, markers: next.length ? next : undefined } });
              }}
            >
              Remove marker
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={addButtonClass}
        onClick={() =>
          patch({
            tour: {
              ...tour,
              markers: [...(markers ?? []), { scene: "", yaw: 0, pitch: 0, label: "" }],
            },
          })
        }
      >
        + Add marker
      </button>
    </div>
  );
}