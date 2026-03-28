import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Decorator } from "@storybook/react-vite";
import Controls from "@/features/timeline/control-bar/Controls";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";
import { useEffect } from "react";
import type { PlayerRef } from "@remotion/player";

type EventName = "play" | "pause" | "ended";

function createMockPlayer({ initiallyPlaying = false } = {}): PlayerRef {
  const listeners = new Map<EventName, Set<() => void>>();
  let playing = initiallyPlaying;

  const emit = (event: EventName) => {
    listeners.get(event)?.forEach((fn) => fn());
  };

  return {
    play: () => {
      playing = true;
      emit("play");
    },
    pause: () => {
      playing = false;
      emit("pause");
    },
    toggle: () => {
      playing ? emit("pause") : emit("play");
      playing = !playing;
    },
    seekTo: () => {},
    getCurrentFrame: () => 0,
    isPlaying: () => playing,
    getContainerNode: () => null,
    isMuted: () => false,
    getVolume: () => 1,
    isFullscreen: () => false,
    requestFullscreen: () => {},
    exitFullscreen: () => {},
    getScale: () => 1,
    addEventListener: (event: EventName, fn: () => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(fn);
    },
    removeEventListener: (event: EventName, fn: () => void) => {
      listeners.get(event)?.delete(fn);
    },
  } as unknown as PlayerRef;
}

const withNoPlayer: Decorator = (Story) => {
  useEffect(() => {
    const { setPlayer } = useRemotionPlayerStore.getState();
    setPlayer(null);
    return () => {
      useRemotionPlayerStore.getState().setPlayer(null);
    };
  }, []);
  return <Story />;
};

const withPlayerPaused: Decorator = (Story) => {
  useEffect(() => {
    const { setPlayer } = useRemotionPlayerStore.getState();
    setPlayer(createMockPlayer());
    return () => {
      useRemotionPlayerStore.getState().setPlayer(null);
    };
  }, []);
  return <Story />;
};

const withPlayerPlaying: Decorator = (Story) => {
  useEffect(() => {
    const { setPlayer } = useRemotionPlayerStore.getState();
    setPlayer(createMockPlayer({ initiallyPlaying: true }));
    return () => {
      useRemotionPlayerStore.getState().setPlayer(null);
    };
  }, []);
  return <Story />;
};

const meta = {
  title: "Timeline/Controls",
  component: Controls,
} satisfies Meta<typeof Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoPlayer: Story = {
  decorators: [withNoPlayer],
};

export const Paused: Story = {
  decorators: [withPlayerPaused],
};

export const Playing: Story = {
  decorators: [withPlayerPlaying],
};
