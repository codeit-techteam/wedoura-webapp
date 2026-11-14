import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { ImageReveal } from "@/components/motion/ImageReveal";
import type { BlogPost } from "@/data/types";

const monthYear = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

type Props = {
  post: BlogPost;
  sizes?: string;
  delay?: number;
};

/** The one article card: large image, date · category, serif title. */
export function ArticleCard({ post, sizes = "(min-width: 48rem) 33vw, 100vw", delay = 0 }: Props) {
  return (
    <Link href={`/blogs/${post.slug}`} className="group block">
      <ImageReveal delay={delay}>
        <div className="relative aspect-4/3 overflow-hidden bg-ivory">
          <Photo
            photo={post.cover}
            mode="cover"
            sizes={sizes}
            className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
          />
        </div>
      </ImageReveal>
      <p className="mt-4 text-small text-mute">
        {monthYear.format(new Date(post.date))} · {post.category}
      </p>
      <h3 className="mt-1 font-serif text-h3 leading-snug">{post.title}</h3>
    </Link>
  );
}
