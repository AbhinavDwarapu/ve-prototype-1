import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PlayerRef } from "@remotion/player";
import { useRef } from "react";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from "storybook/test";

import ControlBar from "../../src/features/timeline/components/control-bar";
import { useRemotionPlayerStore } from "../../src/stores/remotion-player/store";

type PlaybackEvent = "play" | "pause" | "ended" | "frameupdate";

/**
 * Minimal stand-in for Remotion's {@link PlayerRef}. Only implements the
 * surface the control bar + `useCurrentPlayerFrame` actually touch.
 */
class MockPlayer {
  private listeners: Record<PlaybackEvent, Set<() => void>> = {
    play: new Set(),
    pause: new Set(),
    ended: new Set(),
    frameupdate: new Set(),
  };
  private _playing = false;
  private _frame = 0;

  private emit(event: PlaybackEvent) {
    for (const cb of this.listeners[event]) cb();
  }

  setPlaying(value: boolean) {
    this._playing = value;
    this.emit(value ? "play" : "pause");
  }

  setCurrentFrame(frame: number) {
    this._frame = frame;
    this.emit("frameupdate");
  }

  play = fn(() => {
    this._playing = true;
    this.emit("play");
  }).mockName("player.play");

  pause = fn(() => {
    this._playing = false;
    this.emit("pause");
  }).mockName("player.pause");

  seekTo = fn((frame: number) => {
    this._frame = frame;
    this.emit("frameupdate");
  }).mockName("player.seekTo");

  getCurrentFrame = fn(() => this._frame);
  isPlaying = fn(() => this._playing);

  addEventListener = fn((event: PlaybackEvent, cb: () => void) => {
    this.listeners[event].add(cb);
  });

  removeEventListener = fn((event: PlaybackEvent, cb: () => void) => {
    this.listeners[event].delete(cb);
  });
}

// Stories share the mock via a module-scoped variable that `beforeEach`
// resets before every play function runs.
let mockPlayer: MockPlayer;

function ControlBarHarness() {
  const initRef = useRef(false);
  if (!initRef.current) {
    initRef.current = true;
    useRemotionPlayerStore
      .getState()
      .setPlayer(mockPlayer as unknown as PlayerRef);
  }
  return (
    <div className="w-full max-w-[640px] mx-auto">
      <ControlBar />
    </div>
  );
}

const meta: Meta<typeof ControlBarHarness> = {
  title: "Timeline/ControlBar",
  component: ControlBarHarness,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div
        style={{
          background: "#0a0a0a",
          padding: 32,
          minHeight: 200,
          boxSizing: "border-box",
        }}
      >
        <Story />
      </div>
    ),
  ],
  beforeEach: () => {
    mockPlayer = new MockPlayer();
    return () => {
      useRemotionPlayerStore.getState().setPlayer(null);
    };
  },
};

export default meta;
type Story = StoryObj<typeof ControlBarHarness>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("00:00 / 01:00")).toBeInTheDocument();
    await expect(canvas.getByText("0 / 3600")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Play" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Fast forward" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Fast backward" }),
    ).toBeInTheDocument();
  },
};

export const ShowsPauseIconWhilePlaying: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mockPlayer.setPlaying(true);

    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Pause" }),
      ).toBeInTheDocument(),
    );
    await expect(
      canvas.queryByRole("button", { name: "Play" }),
    ).not.toBeInTheDocument();
  },
};

export const ReflectsPlayerFrame: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mockPlayer.setCurrentFrame(120);

    await waitFor(() => {
      expect(canvas.getByText("00:02 / 01:00")).toBeInTheDocument();
      expect(canvas.getByText("120 / 3600")).toBeInTheDocument();
    });
  },
};

export const TogglePlayPause: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Play" }));
    await expect(mockPlayer.play).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Pause" }),
      ).toBeInTheDocument(),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Pause" }));
    await expect(mockPlayer.pause).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Play" }),
      ).toBeInTheDocument(),
    );
  },
};

export const TapFastForwardSkipsFiveSeconds: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Fast forward" }),
    );

    // 5 seconds at 60fps = 300 frames. Starting from frame 0.
    await waitFor(() =>
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(300),
    );
    // A tap should seek exactly once.
    await expect(mockPlayer.seekTo).toHaveBeenCalledTimes(1);
  },
};

export const TapRewindClampsAtStart: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Starting at frame 100, rewinding by 5s (300 frames) should clamp to 0.
    mockPlayer.setCurrentFrame(100);
    await waitFor(() =>
      expect(canvas.getByText("100 / 3600")).toBeInTheDocument(),
    );
    mockPlayer.seekTo.mockClear();

    await userEvent.click(
      canvas.getByRole("button", { name: "Fast backward" }),
    );

    await waitFor(() => expect(mockPlayer.seekTo).toHaveBeenCalledWith(0));
    await expect(mockPlayer.seekTo).toHaveBeenCalledTimes(1);
  },
};

export const HoldForwardScrubs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ff = canvas.getByRole("button", { name: "Fast forward" });

    fireEvent.pointerDown(ff, { button: 0, pointerId: 1 });
    // Hold past the 250ms tap threshold so the scrub loop kicks in.
    await new Promise((resolve) => setTimeout(resolve, 500));
    fireEvent.pointerUp(ff, { pointerId: 1 });

    // Hold pauses the player and emits many seek calls — not just one tap-skip.
    await expect(mockPlayer.pause).toHaveBeenCalled();
    expect(mockPlayer.seekTo.mock.calls.length).toBeGreaterThan(1);

    // The exact-300 tap target must NOT appear, because this was a scrub.
    const hadTapSkip = mockPlayer.seekTo.mock.calls.some(
      ([frame]) => frame === 300,
    );
    expect(hadTapSkip).toBe(false);

    // All scrub targets stay within the valid range.
    for (const [frame] of mockPlayer.seekTo.mock.calls) {
      expect(frame).toBeGreaterThanOrEqual(0);
      expect(frame).toBeLessThanOrEqual(3599);
    }
  },
};

export const HoldBackwardClampsAtZero: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rw = canvas.getByRole("button", { name: "Fast backward" });

    fireEvent.pointerDown(rw, { button: 0, pointerId: 2 });
    await new Promise((resolve) => setTimeout(resolve, 400));
    fireEvent.pointerUp(rw, { pointerId: 2 });

    // Starting at frame 0, every scrub call should clamp to 0.
    expect(mockPlayer.seekTo.mock.calls.length).toBeGreaterThan(0);
    for (const [frame] of mockPlayer.seekTo.mock.calls) {
      expect(frame).toBe(0);
    }
  },
};
