"use client";

import { PhotoPicker } from "@/components/studio/PhotoPicker";
import { StudioDrawer } from "@/components/studio/StudioDrawer";
import type { Photo } from "@/data/types";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  photos: Photo[];
  selectedIds: string[];
  onToggle: (photo: Photo) => void;
  max?: number;
  label: string;
};

/** PhotoPicker in a drawer with an explicit Done action. */
export function PhotoPickerModal({ open, onClose, title, photos, selectedIds, onToggle, max, label }: Props) {
  return (
    <StudioDrawer
      title={title}
      open={open}
      onClose={onClose}
      footer={
        <button type="button" className="studio-btn" onClick={onClose}>
          Done
        </button>
      }
    >
      <PhotoPicker photos={photos} selectedIds={selectedIds} onToggle={onToggle} max={max} label={label} />
    </StudioDrawer>
  );
}