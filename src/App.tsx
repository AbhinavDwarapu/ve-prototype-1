import "./App.css";
import PlayerPage from "./features/player";
import Timeline from "./features/timeline";

function App() {
  return (
    <main className="flex flex-col items-center justify-center w-full h-screen p-2">
      <PlayerPage />
      <Timeline />
    </main>
  );
}

export default App;
