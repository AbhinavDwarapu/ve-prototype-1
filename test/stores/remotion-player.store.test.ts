import { describe, it, beforeEach, expect, vi } from "vitest";
import type { PlayerRef } from "@remotion/player";
import { useRemotionPlayerStore } from "../../src/stores/remotion-player/store";
import {
  selectIsPlaying,
  selectPause,
  selectPlay,
  selectPlayer,
  selectSeekTo,
  selectSetPlayer,
} from "../../src/stores/remotion-player/selectors";

type PlaybackEvent = "play" | "pause" | "ended";

class MockPlayer {
  private listeners: Record<PlaybackEvent, Set<() => void>> = {
    play: new Set(),
    pause: new Set(),
    ended: new Set(),
  };

  private playing = false;

  setPlaying(value: boolean) {
    this.playing = value;
  }

  emit(event: PlaybackEvent) {
    for (const callback of this.listeners[event]) {
      callback();
    }
  }

  play = vi.fn(() => {
    this.playing = true;
    this.emit("play");
  });

  pause = vi.fn(() => {
    this.playing = false;
    this.emit("pause");
  });

  seekTo = vi.fn((_frame: number) => {
    // No-op for tests.
  });

  isPlaying = vi.fn(() => this.playing);

  addEventListener = vi.fn((event: PlaybackEvent, callback: () => void) => {
    this.listeners[event].add(callback);
  });

  removeEventListener = vi.fn((event: PlaybackEvent, callback: () => void) => {
    this.listeners[event].delete(callback);
  });
}

const asPlayerRef = (mock: MockPlayer): PlayerRef =>
  mock as unknown as PlayerRef;

describe("Remotion player store", () => {
  beforeEach(() => {
    useRemotionPlayerStore.setState({
      player: null,
      isPlaying: false,
    });
  });

  it("initializes with no player and not playing", () => {
    const state = useRemotionPlayerStore.getState();
    expect(state.player).toBeNull();
    expect(state.isPlaying).toBe(false);
  });

  it("sets player, subscribes to playback events, and syncs initial playback state", () => {
    const player = new MockPlayer();
    player.setPlaying(true);

    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(player));

    const state = useRemotionPlayerStore.getState();
    expect(state.player).toBe(player);
    expect(state.isPlaying).toBe(true);
    expect(player.addEventListener).toHaveBeenCalledTimes(3);
    expect(player.addEventListener).toHaveBeenCalledWith(
      "play",
      expect.any(Function),
    );
    expect(player.addEventListener).toHaveBeenCalledWith(
      "pause",
      expect.any(Function),
    );
    expect(player.addEventListener).toHaveBeenCalledWith(
      "ended",
      expect.any(Function),
    );
  });

  it("delegates play, pause, and seekTo to player instance", () => {
    const player = new MockPlayer();
    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(player));

    const state = useRemotionPlayerStore.getState();
    state.play();
    state.pause();
    state.seekTo(42);

    expect(player.play).toHaveBeenCalledTimes(1);
    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.seekTo).toHaveBeenCalledWith(42);
  });

  it("keeps action methods as safe no-ops when no player is set", () => {
    const state = useRemotionPlayerStore.getState();
    expect(() => state.play()).not.toThrow();
    expect(() => state.pause()).not.toThrow();
    expect(() => state.seekTo(12)).not.toThrow();
  });

  it("updates isPlaying when playback events are emitted", () => {
    const player = new MockPlayer();
    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(player));

    player.setPlaying(true);
    player.emit("play");
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(true);

    player.setPlaying(false);
    player.emit("pause");
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(false);

    player.setPlaying(false);
    player.emit("ended");
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(false);
  });

  it("detaches listeners from previous player when player is replaced", () => {
    const firstPlayer = new MockPlayer();
    const secondPlayer = new MockPlayer();
    secondPlayer.setPlaying(false);

    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(firstPlayer));
    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(secondPlayer));

    firstPlayer.setPlaying(true);
    firstPlayer.emit("play");
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(false);

    secondPlayer.setPlaying(true);
    secondPlayer.emit("play");
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(true);

    expect(firstPlayer.removeEventListener).toHaveBeenCalledTimes(3);
  });

  it("clears state and detaches listeners when player is unset", () => {
    const player = new MockPlayer();
    player.setPlaying(true);

    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(player));
    useRemotionPlayerStore.getState().setPlayer(null);

    const state = useRemotionPlayerStore.getState();
    expect(state.player).toBeNull();
    expect(state.isPlaying).toBe(false);

    player.setPlaying(true);
    player.emit("play");
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(false);
    expect(player.removeEventListener).toHaveBeenCalledTimes(3);
  });

  it("does not duplicate listeners when the same player is set twice", () => {
    const player = new MockPlayer();
    const ref = asPlayerRef(player);

    useRemotionPlayerStore.getState().setPlayer(ref);
    useRemotionPlayerStore.getState().setPlayer(ref);

    expect(player.addEventListener).toHaveBeenCalledTimes(6);
    expect(player.removeEventListener).toHaveBeenCalledTimes(3);

    player.setPlaying(true);
    player.emit("play");
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(true);
  });

  it("does not emit an intermediate state where player is set but isPlaying is stale", () => {
    const player = new MockPlayer();
    player.setPlaying(true);

    const states: Array<{ player: unknown; isPlaying: boolean }> = [];
    const unsub = useRemotionPlayerStore.subscribe((state) => {
      states.push({ player: state.player, isPlaying: state.isPlaying });
    });

    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(player));
    unsub();

    expect(states).toHaveLength(1);
    expect(states[0]!.isPlaying).toBe(true);
  });

  it("handles setting player to null when already null", () => {
    useRemotionPlayerStore.getState().setPlayer(null);
    const state = useRemotionPlayerStore.getState();
    expect(state.player).toBeNull();
    expect(state.isPlaying).toBe(false);
  });

  it("only the latest player's events affect state after rapid swaps", () => {
    const a = new MockPlayer();
    const b = new MockPlayer();
    const c = new MockPlayer();

    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(a));
    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(b));
    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(c));

    a.setPlaying(true);
    a.emit("play");
    b.setPlaying(true);
    b.emit("play");
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(false);

    c.setPlaying(true);
    c.emit("play");
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(true);

    expect(a.removeEventListener).toHaveBeenCalledTimes(3);
    expect(b.removeEventListener).toHaveBeenCalledTimes(3);
  });

  it("calling play while already playing keeps isPlaying true", () => {
    const player = new MockPlayer();
    useRemotionPlayerStore.getState().setPlayer(asPlayerRef(player));

    useRemotionPlayerStore.getState().play();
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(true);

    useRemotionPlayerStore.getState().play();
    expect(useRemotionPlayerStore.getState().isPlaying).toBe(true);
    expect(player.play).toHaveBeenCalledTimes(2);
  });

  it("selectors return current values and bound actions", () => {
    const state = useRemotionPlayerStore.getState();

    expect(selectPlayer(state)).toBeNull();
    expect(selectIsPlaying(state)).toBe(false);
    expect(selectSetPlayer(state)).toBe(state.setPlayer);
    expect(selectPlay(state)).toBe(state.play);
    expect(selectPause(state)).toBe(state.pause);
    expect(selectSeekTo(state)).toBe(state.seekTo);
  });
});
