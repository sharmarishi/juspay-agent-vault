import React from "react";
import { ChatGptBackground } from "./components/chrome/ChatGptBackground";
import { SettingsModal } from "./components/settings/SettingsModal";

function App() {
  return (
    <>
      <ChatGptBackground />
      <SettingsModal />
    </>
  );
}

export default App;
