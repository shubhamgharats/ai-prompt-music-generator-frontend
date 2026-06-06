"use client";

import {
  Music,
  Pause,
  Play,
  Volume2,
  MoreHorizontal,
  Download,
} from "lucide-react";

import { useEffect, useRef, useState, useCallback } from "react";

import { usePlayerStore } from "~/stores/use-player-store";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "~/components/ui/slider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function SoundBar() {
  const { track } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0]! / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !track?.url) return;

    setCurrentTime(0);
    setDuration(0);

    audio.src = track.url;
    audio.load();

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.error("Playback failed:", error);
        setIsPlaying(false);
      }
    };

    void playAudio();
  }, [track]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !track?.url) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error("Audio toggle failed:", error);
    }
  }, [track]);

  const handleSeek = useCallback((value: number[]) => {
    const audio = audioRef.current;

    if (!audio || value[0] === undefined) return;

    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "00:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!track) return null;

  return (
    <div className="px-4 pb-2">
      <Card className="bg-background/60 relative w-full shrink-0 border-t px-4 py-0 pb-4 backdrop-blur">
        <div className="space-y-2 p-3">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                {track.artwork ? (
                  <img
                    src={track.artwork}
                    alt={track.title ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Music className="text-white" />
                )}
              </div>

              <div className="max-w-24 min-w-0 flex-1 md:max-w-full">
                <div className="truncate text-sm font-medium">
                  {track.title}
                </div>

                <p className="text-muted-foreground truncate text-xs">
                  {track.createdByUsername}
                </p>
              </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <Volume2 className="h-4 w-4" />

                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  step={1}
                  max={100}
                  min={0}
                  className="w-20"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => {
                      if (!track.url) return;

                      window.open(track.url, "_blank");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-10 text-right text-[10px]">
              {formatTime(currentTime)}
            </span>

            <Slider
              className="flex-1"
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
            />

            <span className="text-muted-foreground w-10 text-right text-[10px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <audio ref={audioRef} preload="metadata" />
      </Card>
    </div>
  );
}
