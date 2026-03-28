import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Decorator } from "@storybook/react-vite";
import Controls from "@/features/timeline/control-bar/Controls";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";
import { useEffect } from "react";
import type { PlayerRef } from "@remotion/player";

function createMockPlayer(overrides: Partial<PlayerRef> = {}): PlayerRef {
  return {
    play: () => {},
    pause: () => {},
    toggle: () => {},
    seekTo: () => {},
    getCurrentFrame: () => 0,
    isPlaying: () => false,
    getContainerNode: () => null,
    isMuted: () => false,
    getVolume: () => 1,
    isFullscreen: () => false,
    requestFullscreen: () => {},
    exitFullscreen: () => {},
    getScale: () => 1,
    addEventListener: () => {},
    removeEventListener: () => {},
    ...overrides,
  } as unknown as PlayerRef;
}

const withNoPlayer: Decorator = (Story) => {
  useEffect(() => {
    useRemotionPlayerStore.setState({ player: null, isPlaying: false });
  }, []);
  return <Story />;
};

const withPlayerPaused: Decorator = (Story) => {
  useEffect(() => {
    useRemotionPlayerStore.setState({
      player: createMockPlayer(),
      isPlaying: false,
    });
    return () => {
      useRemotionPlayerStore.setState({ player: null, isPlaying: false });
    };
  }, []);
  return <Story />;
};

const withPlayerPlaying: Decorator = (Story) => {
  useEffect(() => {
    useRemotionPlayerStore.setState({
      player: createMockPlayer({ isPlaying: () => true }),
      isPlaying: true,
    });
    return () => {
      useRemotionPlayerStore.setState({ player: null, isPlaying: false });
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
