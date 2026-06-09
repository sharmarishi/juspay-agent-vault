import React, { useState } from "react";
import { LandingPage } from "./components/chrome/LandingPage";
import { SettingsModal } from "./components/settings/SettingsModal";

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <LandingPage onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

export default App;
