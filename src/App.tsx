import FileFolderSidebar from "./features/file-folder";
import PlayerPage from "./features/player";
import SettingsPanel from "./features/settings";
import Timeline from "./features/timeline";

function App() {
  return (
    <main className="relative flex h-screen w-full flex-col items-center overflow-hidden bg-[radial-gradient(circle_at_top,oklch(0.28_0.055_292/0.34),transparent_34rem),linear-gradient(180deg,var(--editor-app),oklch(0.12_0.022_284))] p-2 text-foreground">
      <FileFolderSidebar />
      <SettingsPanel />
      <PlayerPage />
      <Timeline />
    </main>
  );
}

export default App;
