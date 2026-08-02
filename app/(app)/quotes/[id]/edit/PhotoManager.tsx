"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { useUploadThing } from "@/lib/uploadthing";
import { addPhoto, deletePhoto } from "@/app/actions/photos";
import { buttonClass } from "@/lib/ui";
import { TrashIcon } from "@/app/components/icons";

type Photo = { id: string; url: string; caption: string | null };

const MAX_PHOTOS = 6;

export function PhotoManager({ quoteId, photos }: { quoteId: string; photos: Photo[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const { startUpload, isUploading } = useUploadThing("quotePhoto", {
    onClientUploadComplete: (res) => {
      startTransition(async () => {
        for (const file of res) {
          await addPhoto(quoteId, file.ufsUrl);
        }
      });
    },
    onUploadError: (error) => alert(error.message),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.currentTarget.files ?? []);
    e.currentTarget.value = "";
    if (files.length === 0) return;
    if (photos.length + files.length > MAX_PHOTOS) {
      alert(`Maximum ${MAX_PHOTOS} photos per quote`);
      return;
    }
    void startUpload(files, { quoteId });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">Photos</span>
        <span className="type-num text-xs text-ink-muted">
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative rounded-xl overflow-hidden aspect-square bg-surface-sunk border border-line"
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? "Job photo"}
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deletePhoto(photo.id);
                  })
                }
                aria-label="Remove photo"
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-ink/70 text-paper flex items-center justify-center hover:bg-ink disabled:opacity-50"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={isUploading || photos.length >= MAX_PHOTOS}
        onClick={() => fileInputRef.current?.click()}
        className={buttonClass({ variant: "dashed", block: true })}
      >
        {isUploading ? "Uploading…" : "+ Add photo"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFileChange}
      />
    </div>
  );
}
