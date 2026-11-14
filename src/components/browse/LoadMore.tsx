"use client";

import { Button } from "@/components/ui/Button";

type Props = {
  shown: number;
  total: number;
  onMore: () => void;
  noun?: string;
};

/** Count plus a load-more button; hides itself when everything is shown. */
export function LoadMore({ shown, total, onMore, noun = "results" }: Props) {
  if (total <= shown) return null;
  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <p className="text-small text-mute">
        Showing {shown} of {total} {noun}
      </p>
      <Button variant="outline" onClick={onMore}>
        Show more
      </Button>
    </div>
  );
}
