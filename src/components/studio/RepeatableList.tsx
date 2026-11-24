"use client";

import { useRef, useState, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { moveItem } from "@/components/studio/screen";

export type RepeatableRow<T> = {
  id: string;
  item: T;
};

type Props<T> = {
  items: T[];
  getId: (item: T, index: number) => string;
  onReorder: (next: T[]) => void;
  onDelete: (index: number) => void;
  /** Restore a deleted item after undo. */
  onUndoDelete?: (item: T, index: number) => void;
  renderRow: (item: T, index: number) => ReactNode;
  onEdit?: (item: T, index: number) => void;
  addLabel: string;
  onAdd: () => void;
  limit?: number;
  emptyTitle?: string;
};

/**
 * Compact rows with drag reorder, optional edit, delete with brief undo,
 * and a clear add button. Limits are shown when set.
 */
export function RepeatableList<T>({
  items,
  getId,
  onReorder,
  onDelete,
  onUndoDelete,
  renderRow,
  onEdit,
  addLabel,
  onAdd,
  limit,
  emptyTitle,
}: Props<T>) {
  const dragFrom = useRef<number | null>(null);
  const [undo, setUndo] = useState<{ item: T; index: number } | null>(null);
  const undoTimer = useRef<number | null>(null);

  function removeAt(index: number) {
    const item = items[index];
    onDelete(index);
    if (onUndoDelete) {
      setUndo({ item, index });
      if (undoTimer.current != null) window.clearTimeout(undoTimer.current);
      undoTimer.current = window.setTimeout(() => setUndo(null), 5000);
    }
  }

  function undoDelete() {
    if (!undo || !onUndoDelete) return;
    onUndoDelete(undo.item, undo.index);
    setUndo(null);
    if (undoTimer.current != null) window.clearTimeout(undoTimer.current);
  }

  const atLimit = limit != null && items.length >= limit;

  return (
    <div>
      {limit != null ? (
        <p className="mb-3 text-[length:var(--text-dash-help)] text-mute">
          {items.length} of {limit}
        </p>
      ) : null}

      {items.length === 0 && emptyTitle ? (
        <p className="mb-4 border border-dashed border-line px-4 py-8 text-center text-[length:var(--text-dash-body)] text-mute">
          {emptyTitle}
        </p>
      ) : null}

      <ul className="grid gap-2">
        {items.map((item, index) => {
          const id = getId(item, index);
          return (
            <li
              key={id}
              draggable
              onDragStart={() => {
                dragFrom.current = index;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = dragFrom.current;
                dragFrom.current = null;
                if (from == null || from === index) return;
                onReorder(moveItem(items, from, index));
              }}
              className="flex items-stretch gap-2 border border-line bg-white"
            >
              <button
                type="button"
                className="tap flex w-10 shrink-0 cursor-grab items-center justify-center text-mute hover:text-ink active:cursor-grabbing"
                aria-label={`Drag to reorder row ${index + 1}`}
                tabIndex={-1}
              >
                <GripVertical className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <div className="min-w-0 flex-1 py-3 pr-2">{renderRow(item, index)}</div>
              <div className="flex shrink-0 flex-col justify-center gap-1 border-l border-line px-2 py-2">
                {onEdit ? (
                  <button type="button" className="studio-top-link text-left" onClick={() => onEdit(item, index)}>
                    Edit
                  </button>
                ) : null}
                <button type="button" className="studio-top-link text-left text-mute" onClick={() => removeAt(index)}>
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          className={cn("studio-btn", atLimit && "opacity-40")}
          disabled={atLimit}
          onClick={onAdd}
        >
          {addLabel}
        </button>
        {undo ? (
          <p className="text-[length:var(--text-dash-help)] text-mute" role="status">
            Removed.{" "}
            <button type="button" className="border-b border-gold text-ink" onClick={undoDelete}>
              Undo
            </button>
          </p>
        ) : null}
      </div>
    </div>
  );
}
