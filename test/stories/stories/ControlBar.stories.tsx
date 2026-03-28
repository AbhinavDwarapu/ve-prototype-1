import type { Meta, StoryObj } from "@storybook/react-vite";
import ControlBar from "@/features/timeline/control-bar/_ControlBar";

const meta = {
  title: "Timeline/ControlBar",
  component: ControlBar,
} satisfies Meta<typeof ControlBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
