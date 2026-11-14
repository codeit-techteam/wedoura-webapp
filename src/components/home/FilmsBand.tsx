import { FilmPreview } from "@/components/media/FilmPreview";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import type { Film } from "@/data/types";

type Props = { films: Film[] };

/**
 * The one dark section on the page: film previews in a row that play muted
 * while in view, each opening a full-screen player.
 */
export function FilmsBand({ films }: Props) {
  return (
    <section className="bg-ink py-section text-white" aria-label="Wedding films">
      <Container width="wide">
        <Reveal className="max-w-2xl">
          <h2 className="font-serif text-h2 leading-tight text-balance">
            A few seconds of a film says more than any album.
          </h2>
          <p className="mt-4 max-w-prose text-body text-white/70">
            Previews play quietly as you scroll. When one catches you, watch the whole film.
          </p>
        </Reveal>
        <div className="-mx-gutter mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-gutter pb-2 md:mx-0 md:px-0">
          {films.map((film, i) => (
            <Reveal key={film.id} delay={i * 0.08} className="w-11/12 shrink-0 snap-start md:w-7/12 xl:w-5/12">
              <FilmPreview film={film} sizes="(min-width: 48rem) 55vw, 92vw" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
