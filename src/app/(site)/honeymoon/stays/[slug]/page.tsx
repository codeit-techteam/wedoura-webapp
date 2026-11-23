import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/styles/honeymoon.css";
import { StayBooking } from "@/components/honeymoon/StayBooking";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Photo } from "@/components/media/Photo";
import { PhotoGrid } from "@/components/media/PhotoGrid";
import { FilmYouTube } from "@/components/profile/FilmYouTube";
import { StickySubnav, type SubnavSection } from "@/components/profile/StickySubnav";
import { JsonLd } from "@/components/seo/JsonLd";
import { SaveButton } from "@/components/ui/SaveButton";
import type { Photo as PhotoType } from "@/data/types";
import { getStay, listStays } from "@/lib/api";
import { formatINR, formatPrice } from "@/lib/format";
import { vendorSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const stays = await listStays();
  return stays.map((stay) => ({ slug: stay.slug }));
}

export async function generateMetadata({ params }: PageProps<"/honeymoon/stays/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const stay = await getStay(slug);
  if (!stay) return { title: "Honeymoon stay", robots: { index: false, follow: false } };
  return pageMeta({
    title: `${stay.name} — honeymoon stay`,
    description: stay.tagline || `${stay.name} — honeymoon stay.`,
    path: `/honeymoon/stays/${stay.slug}`,
    image: stay.cover?.src ?? stay.cardPhotos[0]?.src,
  });
}

export default async function HoneymoonStayPage({ params }: PageProps<"/honeymoon/stays/[slug]">) {
  const { slug } = await params;
  const stay = await getStay(slug);
  if (!stay || stay.travel?.kind !== "hotel") notFound();

  const hotel = stay.travel;
  const hero = stay.cover ?? stay.portfolio[0];
  const byId = new Map(stay.portfolio.map((p) => [p.id, p]));
  const roomPhotos: Record<string, PhotoType> = {};
  for (const room of hotel.rooms) {
    const photo = room.photoId ? byId.get(room.photoId) : undefined;
    if (room.photoId && photo) roomPhotos[room.photoId] = photo;
  }
  const usedIds = new Set([hero?.id, ...Object.keys(roomPhotos)]);
  const extraPhotos = stay.portfolio.filter((p) => !usedIds.has(p.id) && p.projection !== "equirectangular");
  const bleed = extraPhotos[0];
  const dinePhoto = extraPhotos[1];
  const duskPhotos = extraPhotos.slice(2, 4);
  const gallery = stay.portfolio.filter((p) => p.projection !== "equirectangular");
  const moments = stay.experiences ?? [];
  const films = stay.films.filter((f) => Boolean(f.youtubeUrl || f.previewSrc || f.fullSrc));

  const glance: { label: string; value: string }[] = [
    { label: "Place", value: stay.cityName },
    { label: "Property", value: hotel.propertyType },
    hotel.rooms.length > 0 && { label: "Rooms", value: `${hotel.rooms.length} room types` },
    hotel.mealPlans?.length && { label: "Meals", value: hotel.mealPlans.join(" · ") },
    hotel.honeymoonTouches?.length && { label: "For couples", value: hotel.honeymoonTouches.join(" · ") },
  ].filter(Boolean) as { label: string; value: string }[];

  const sections: SubnavSection[] = [
    { id: "overview", label: "Overview" },
    hotel.rooms.length > 0 && { id: "rooms", label: "Rooms" },
    moments.length > 0 && { id: "moments", label: "Moments" },
    hotel.dining?.length && { id: "dining", label: "Dining" },
    gallery.length > 0 && { id: "gallery", label: "Gallery" },
    films.length > 0 && { id: "films", label: "Films" },
    hotel.gettingThere?.length && { id: "reach", label: "Getting there" },
    { id: "enquire", label: "Request to book" },
  ].filter(Boolean) as SubnavSection[];

  return (
    <main className="hm hm-stay pb-section-sm">
      <JsonLd schema={vendorSchema(stay)} />

      {hero && (
        <div className="hhero">
          <Photo photo={hero} mode="cover" sizes="100vw" priority />
        </div>
      )}

      <header className="hname">
        <span className="cap gold">Honeymoon stay · {hotel.propertyType}</span>
        <h1>{stay.name}</h1>
        <p className="lead">{stay.tagline}</p>
        <div className="hfacts">
          <span>
            <b>{stay.cityName}</b>
          </span>
          {hotel.starRating !== undefined && (
            <span>
              <b>{hotel.starRating}-star</b> property
            </span>
          )}
          {stay.startingPriceINR !== undefined && (
            <span>
              From <b>{formatPrice(stay.startingPriceINR, stay.priceUnit)}</b>
            </span>
          )}
        </div>
        <div className="hbtns">
          <a className="btn" href="#enquire">
            Request to book
          </a>
          <SaveButton slug={stay.slug} name={stay.name} tone="ink" withLabel />
        </div>
      </header>

      <StickySubnav sections={sections} />

      {/* Overview */}
      <section className="sec ov" id="overview">
        <div>
          <span className="cap gold">The place</span>
          {hotel.overviewHeadline && <h2>{hotel.overviewHeadline}</h2>}
          <div className="body">
            {stay.about.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </div>
        {glance.length > 0 && (
          <dl className="glance">
            {glance.map((g) => (
              <div key={g.label}>
                <dt>{g.label}</dt>
                <dd>{g.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Full-bleed photograph */}
      {bleed && (
        <div className="bleed">
          <Photo photo={bleed} mode="cover" sizes="100vw" />
        </div>
      )}

      {/* Rooms */}
      {hotel.rooms.length > 0 && (
        <section className="sec" id="rooms">
          <div className="hd">
            <div>
              <span className="cap gold">Where you wake up</span>
              <h2>
                The <em>rooms</em>
              </h2>
            </div>
          </div>
          <div className="rooms">
            {hotel.rooms.map((room) => {
              const photo = room.photoId ? roomPhotos[room.photoId] : undefined;
              return (
                <article className="room" key={room.name}>
                  {photo && (
                    <div className="im zoom">
                      <Photo photo={photo} mode="cover" sizes="(min-width: 64rem) 30vw, 92vw" />
                    </div>
                  )}
                  <div className="t">
                    {(room.size || room.view) && (
                      <span className="cap">{[room.size, room.view].filter(Boolean).join(" · ")}</span>
                    )}
                    <h3>{room.name}</h3>
                    {room.description && <p>{room.description}</p>}
                    {room.rateFromINR !== undefined && (
                      <div className="rp">
                        <span>
                          From <b>{formatINR(room.rateFromINR)}</b> a night
                        </span>
                        <a className="lnk" href="#enquire">
                          Request
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Moments */}
      {moments.length > 0 && (
        <section className="sec" id="moments">
          <div className="hd">
            <div>
              <span className="cap gold">Only here</span>
              <h2>
                Moments <em>for two</em>
              </h2>
              <p>Add any of these when you request to book; the hotel sets them up before you arrive.</p>
            </div>
          </div>
          <div className="xps">
            {moments.map((xp) => (
              <article className="xcard" key={xp.slug}>
                <h3>{xp.name}</h3>
                <p>{xp.description}</p>
                <span className="xpr">{xp.priceFromINR ? `From ${formatINR(xp.priceFromINR)}` : "Included with the stay"}</span>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Dining */}
      {hotel.dining && hotel.dining.length > 0 && (
        <section className="dine" id="dining">
          {dinePhoto && (
            <div className="im">
              <Photo photo={dinePhoto} mode="cover" sizes="(min-width: 64rem) 56vw, 100vw" />
            </div>
          )}
          <div className="tx">
            <span className="cap gold">The table</span>
            <h2>
              Dinner, <em>slowly</em>
            </h2>
            {hotel.dining.map((venue) => (
              <div className="venue" key={venue.name}>
                <h3>{venue.name}</h3>
                {venue.description && <p>{venue.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Evening band */}
      {hotel.eveningNote && (
        <section className="dusk" aria-label="Evenings">
          <div className="hd">
            <div>
              <span className="cap gold">After dark</span>
              <h2>
                The <em>evenings</em>
              </h2>
              <p>{hotel.eveningNote}</p>
            </div>
          </div>
          {duskPhotos.length > 0 && (
            <div className="row">
              {duskPhotos.map((p) => (
                <div className="im" key={p.id}>
                  <Photo photo={p} mode="cover" sizes="(min-width: 64rem) 50vw, 100vw" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="sec" id="gallery">
          <div className="hd">
            <div>
              <span className="cap gold">Around the estate</span>
              <h2>
                The <em>gallery</em>
              </h2>
            </div>
          </div>
          <div className="itin">
            <PhotoGrid photos={gallery} initialCount={6} />
          </div>
        </section>
      )}

      {/* Films */}
      {films.length > 0 && (
        <section className="sec" id="films">
          <div className="hd">
            <div>
              <span className="cap gold">See it move</span>
              <h2>
                Films &amp; <em>shorts</em>
              </h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {films.map((film) =>
              film.youtubeUrl ? (
                <FilmYouTube
                  key={film.id}
                  film={film}
                  sizes="(min-width: 64rem) 40vw, (min-width: 48rem) 50vw, 100vw"
                />
              ) : (
                <FilmPreview
                  key={film.id}
                  film={film}
                  sizes="(min-width: 64rem) 40vw, (min-width: 48rem) 50vw, 100vw"
                />
              ),
            )}
          </div>
        </section>
      )}

      {/* Getting there */}
      {hotel.gettingThere && hotel.gettingThere.length > 0 && (
        <section className="sec" id="reach" aria-label="Getting there">
          <div className="hd">
            <div>
              <span className="cap gold">Getting there</span>
              <h2>
                The way <em>up</em>
              </h2>
            </div>
          </div>
          <div className="reach">
            {hotel.gettingThere.map((g) => (
              <div key={g.label}>
                <b>{g.value}</b>
                <h3>{g.label}</h3>
                {g.detail && <p>{g.detail}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Policies as good-to-know */}
      {hotel.policies && hotel.policies.length > 0 && (
        <section className="sec know" aria-label="Good to know">
          <div className="hd">
            <div>
              <span className="cap gold">Before you book</span>
              <h2>
                Good to <em>know</em>
              </h2>
            </div>
          </div>
          <ul>
            {hotel.policies.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Request to book */}
      <StayBooking
        slug={stay.slug}
        name={stay.name}
        cityName={stay.cityName}
        cover={hero}
        rooms={hotel.rooms}
        roomPhotos={roomPhotos}
        moments={moments}
      />
    </main>
  );
}
