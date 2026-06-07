"use server";

import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { getPresignedUrl } from "~/actions/generation";
import { TrackList } from "./track-list";

export default async function TrackListFetcher() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const songs = await db.song.findMany({
    where: { userId: session.user.id },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const songsWithThumbnails = await Promise.all(
    songs.map(async (song) => {
      const rawKey =
        song.thumbnailS3Key
          ?.split(".amazonaws.com/")
          .pop() ?? null;

      let thumbnailUrl: string | null = null;

      if (song.thumbnailS3Key && rawKey) {
        thumbnailUrl = await getPresignedUrl(rawKey);
      }

      // normalize status safely
      const normalizedStatus = song.status
        ? song.status.toLowerCase().replace(/_/g, " ").trim()
        : null;

      return {
        id: song.id,
        title: song.title,
        createdAt: song.createdAt,
        instrumental: song.instrumental,
        prompt: song.prompt,
        lyrics: song.lyrics,
        describedLyrics: song.describedLyrics,
        fullDescribedSong: song.fullDescribedSong,
        thumbnailUrl,
        playUrl: null,
        status: normalizedStatus,
        createdByUserName: song.user?.name,
        published: song.published,
      };
    })
  );

  return <TrackList tracks={songsWithThumbnails} />;
}