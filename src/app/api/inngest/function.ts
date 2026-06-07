import { inngest } from "~/inngest/client";
import { db } from "~/server/db";

type GenerateSongEvent = {
  songId: string;
  userId: string;
};

type RequestBody = {
  guidance_scale?: number;
  infer_step?: number;
  audio_duration?: number;
  full_described_song?: string;
  prompt?: string;
  lyrics?: string;
  described_lyrics?: string;
  instrumental?: boolean;
};

type ModalResponse = {
  s3_key: string;
  cover_image_s3_key: string;
  categories: string[];
};

export const generateSong = inngest.createFunction(
  {
    id: "generate-song",
    triggers: [{ event: "generate-song-event" }],
    concurrency: {
      limit: 1,
      key: "event.data.userId",
    },

    onFailure: async ({ event }) => {
      const data = event.data as Partial<GenerateSongEvent> | undefined;
      const songId = data?.songId;

      if (!songId) return;

      await db.song.update({
        where: { id: songId },
        data: { status: "failed" },
      });
    },
  },

  async ({ event, step }) => {
    const { songId, userId } = event.data as GenerateSongEvent;

    const { credits, endpoint, body } = await step.run(
      "check-credits",
      async () => {
        const song = await db.song.findUniqueOrThrow({
          where: { id: songId },
          select: {
            user: {
              select: {
                id: true,
                credits: true,
              },
            },
            prompt: true,
            lyrics: true,
            describedLyrics: true,
            fullDescribedSong: true,
            instrumental: true,
            guidanceScale: true,
            inferStep: true,
            audioDuration: true,
          },
        });

        const commonParams: RequestBody = {
          guidance_scale: song.guidanceScale ?? undefined,
          infer_step: song.inferStep ?? undefined,
          audio_duration: song.audioDuration ?? undefined,
          instrumental: song.instrumental ?? undefined,
        };

        let endpoint: string | null = null;
        let body: RequestBody = {};

        if (song.fullDescribedSong) {
          endpoint = process.env.GENERATE_FROM_DESCRIPTION ?? null;
          body = {
            full_described_song: song.fullDescribedSong,
            ...commonParams,
          };
        } else if (song.lyrics && song.prompt) {
          endpoint = process.env.GENERATE_WITH_LYRICS ?? null;
          body = {
            lyrics: song.lyrics,
            prompt: song.prompt,
            ...commonParams,
          };
        } else if (song.describedLyrics && song.prompt) {
          endpoint = process.env.GENERATE_FROM_DESCRIBED_LYRICS ?? null;
          body = {
            described_lyrics: song.describedLyrics,
            prompt: song.prompt,
            ...commonParams,
          };
        }

        if (!endpoint) {
          throw new Error(
            "No valid generation mode found or missing env endpoints"
          );
        }

        return {
          credits: song.user.credits,
          endpoint,
          body,
        };
      }
    );

    if (credits <= 0) {
      await step.run("set-status-no-credits", async () => {
        return db.song.update({
          where: { id: songId },
          data: { status: "no_credits" },
        });
      });
      return;
    }

    await step.run("set-status-processing", async () => {
      return db.song.update({
        where: { id: songId },
        data: { status: "processing" },
      });
    });

    const response = await step.fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": process.env.MODAL_KEY ?? "",
        "Modal-Secret": process.env.MODAL_SECRET ?? "",
      },
    });

    await step.run("update-song-result", async () => {
      let responseData: ModalResponse | null = null;

      if (response.ok) {
        try {
          responseData = (await response.json()) as ModalResponse;
        } catch {
          responseData = null;
        }
      }

      await db.song.update({
        where: { id: songId },
        data: {
          s3Key: responseData?.s3_key,
          thumbnailS3Key: responseData?.cover_image_s3_key,
          status: response.ok ? "processed" : "failed",
        },
      });

      if (responseData?.categories?.length) {
        await db.song.update({
          where: { id: songId },
          data: {
            categories: {
              connectOrCreate: responseData.categories.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          },
        });
      }
    });

    await step.run("deduct-credits", async () => {
      if (!response.ok) return;

      return db.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: 1 },
        },
      });
    });
  }
);