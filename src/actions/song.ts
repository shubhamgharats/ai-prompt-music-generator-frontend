"use server";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";

export async function setPublishedStatus(
  songId: string,
  published: boolean
) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If not logged in
    if (!session) {
      redirect("/auth/sign-in");
    }

    // Update publish status
    const updatedSong = await db.song.updateMany({
      where: {
        id: songId,
        userId: session.user.id,
      },
      data: {
        published,
      },
    });

    // Revalidate page
    revalidatePath("/create");

    return {
      success: true,
      updatedSong,
    };
  } catch (error) {
    console.error("Error updating publish status:", error);

    return {
      success: false,
      error: "Failed to update publish status",
    };
  }
}

export async function renameSong(
  songId: string,
  newTitle: string
) {
  try {
    // Trim title
    const trimmedTitle = newTitle.trim();

    // Validate title
    if (!trimmedTitle) {
      return {
        success: false,
        error: "Song title cannot be empty",
      };
    }

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Redirect if not authenticated
    if (!session) {
      redirect("/auth/sign-in");
    }

    // Update song title
    const updatedSong = await db.song.updateMany({
      where: {
        id: songId,
        userId: session.user.id,
      },
      data: {
        title: trimmedTitle,
      },
    });

    // Check if song was found
    if (updatedSong.count === 0) {
      return {
        success: false,
        error: "Song not found",
      };
    }

    // Revalidate page
    revalidatePath("/create");

    return {
      success: true,
      message: "Song renamed successfully",
    };
  } catch (error) {
    console.error("Error renaming song:", error);

    return {
      success: false,
      error: "Failed to rename song",
    };
  }
}


export async function toggleLikeSong(songId: string) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Redirect if not authenticated
    if (!session) {
      redirect("/auth/sign-in");
    }

    // Check if like already exists
    const existingLike = await db.like.findUnique({
      where: {
        userId_songId: {
          userId: session.user.id,
          songId,
        },
      },
    });

    // Unlike if already liked
    if (existingLike) {
      await db.like.delete({
        where: {
          userId_songId: {
            userId: session.user.id,
            songId,
          },
        },
      });

      revalidatePath("/");

      return {
        success: true,
        liked: false,
        message: "Song unliked successfully",
      };
    }

    // Like song
    await db.like.create({
      data: {
        userId: session.user.id,
        songId,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      liked: true,
      message: "Song liked successfully",
    };
  } catch (error) {
    console.error("Error toggling like:", error);

    return {
      success: false,
      error: "Failed to toggle like",
    };
  }
}