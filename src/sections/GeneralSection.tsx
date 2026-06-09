import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Callout } from "../components/primitives/Callout";
import { SettingRow } from "../components/primitives/SettingRow";
import { Dropdown } from "../components/primitives/Dropdown";
import { Toggle } from "../components/primitives/Toggle";

export function GeneralSection() {
  const [dictation, setDictation] = useState(true);

  return (
    <div>
      <Callout
        icon={<ShieldCheck size={24} />}
        title="Secure your account"
        description="Add multi-factor authentication (MFA), like a text message or authenticator app, to help protect your account when logging in."
        actionLabel="Set up MFA"
        onDismiss={() => {}}
      />

      <div className="mt-2">
        <SettingRow label="Appearance" control={<Dropdown value="System" />} />
        <SettingRow label="Contrast" control={<Dropdown value="System" />} />
        <SettingRow label="Accent color" control={<Dropdown value="Default" />} />
        <SettingRow label="Language" control={<Dropdown value="Auto-detect" />} />
        <SettingRow
          label="Enable Dictation"
          sublabel="Use dictation in the chat composer."
          control={<Toggle checked={dictation} onChange={setDictation} />}
        />
        <SettingRow
          label="Spoken language"
          control={<Dropdown value="Auto-detect" />}
        />
      </div>
    </div>
  );
}
