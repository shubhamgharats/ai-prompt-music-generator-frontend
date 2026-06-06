"use client";

import type { Track } from "./track-list";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type RenameResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export function RenameDialog({
  track,
  onClose,
  onRename,
}: {
  track: Track;
  onClose: () => void;
  onRename: (
    trackId: string,
    newTitle: string
  ) => Promise<RenameResponse>;
}) {
  const [title, setTitle] = useState(
    track.title ?? ""
  );

  const [isLoading, setIsLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    try {
      setIsLoading(true);

      const result = await onRename(
        track.id,
        trimmedTitle
      );

      if (result.success) {
        onClose();
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error(
        "Failed to rename song:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Rename Song
            </DialogTitle>

            <DialogDescription>
              Enter a new name for your song.
              Click save when you are done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="name"
                className="text-right"
              >
                Title
              </Label>

              <Input
                id="name"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="col-span-3"
                placeholder="Enter song title"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={
                isLoading || !title.trim()
              }
            >
              {isLoading
                ? "Saving..."
                : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}