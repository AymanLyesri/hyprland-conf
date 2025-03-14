import { App, Astal, Gtk } from "astal/gtk3";
import hyprland from "gi://AstalHyprland";
import { globalMargin, globalSettings, settingsVisibility } from "../variables";
import { bind, execAsync } from "astal";
import { getSetting, setSetting } from "../utils/settings";
import { notify } from "../utils/notification";
import { HyprlandSetting } from "../interfaces/settings.interface";
import { hideWindow } from "../utils/window";
const Hyprland = hyprland.get_default();

const hyprCustomDir: string = "$HOME/.config/hypr/configs/custom/";

function buildConfigString(keys: string[], value: any): string {
  if (keys.length === 1) return `${keys[0]}=${value}`;

  const currentKey = keys[0];
  const nestedConfig = buildConfigString(keys.slice(1), value);
  return `${currentKey} {\n\t${nestedConfig.replace(/\n/g, "\n\t")}\n}`;
}

const Setting = (keys: string, setting: HyprlandSetting) => {
  const keyArray = keys.split(".");
  const lastKey = keyArray.at(-1);
  if (!lastKey) return;

  const title = (
    <label
      halign={Gtk.Align.START}
      label={lastKey.charAt(0).toUpperCase() + lastKey.slice(1)}
    />
  );

  const sliderWidget = () => {
    const infoLabel = (
      <label
        hexpand={true}
        xalign={1}
        label={`${Math.round(
          (setting.value / (setting.max - setting.min)) * 100
        )}%`}
      />
    );

    const setValue = ({ value }: { value: number }) => {
      infoLabel.label = `${Math.round(value * 100)}%`;
      switch (setting.type) {
        case "int":
          value = Math.round(value * (setting.max - setting.min));
          break;
        case "float":
          value = parseFloat(value.toFixed(2)) * (setting.max - setting.min);
          break;
        default:
          break;
      }

      setSetting(keys + ".value", value);
      const configString = buildConfigString(keyArray.slice(1), value);
      execAsync(
        `bash -c "echo -e '${configString}' >${
          hyprCustomDir + keyArray.at(-2) + "." + keyArray.at(-1)
        }.conf"`
      ).catch((err) => notify(err));
    };

    const slider_ = (
      <slider
        halign={Gtk.Align.END}
        step={0.01}
        width_request={169}
        className="slider"
        value={bind(globalSettings).as(
          (s) => getSetting(keys + ".value") / (setting.max - setting.min)
        )}
        onValueChanged={setValue}
      />
    );

    return (
      <box hexpand={true} halign={Gtk.Align.END} spacing={5}>
        {slider_}
        {infoLabel}
      </box>
    );
  };

  const switchWidget = () => {
    const infoLabel = (
      <label
        hexpand={true}
        xalign={1}
        label={bind(globalSettings).as((s) =>
          getSetting(keys + ".value") ? "On" : "Off"
        )}
      />
    );

    const switch_ = (
      <switch
        active={getSetting(keys + ".value")}
        onButtonPressEvent={({ active }) => {
          active = !active;
          // notify({ summary: "thuneu", body: active });
          setSetting(keys + ".value", active);
          const configString = buildConfigString(keyArray.slice(1), active);
          execAsync(
            `bash -c "echo -e '${configString}' >${
              hyprCustomDir + keyArray.at(-2) + "." + keyArray.at(-1)
            }.conf"`
          ).catch((err) => notify(err));
        }}
      />
    );

    return (
      <box hexpand={true} halign={Gtk.Align.END} spacing={5}>
        {switch_}
        {infoLabel}
      </box>
    );
  };

  return (
    <box className="setting">
      {title}
      {setting.type === "bool" ? switchWidget() : sliderWidget()}
    </box>
  );
};

interface NestedSettings {
  [key: string]: HyprlandSetting | NestedSettings;
}

const Settings = () => {
  const settings: any[] = [];

  const Category = (title: string) => <label label={title} />;

  const processSetting = (
    key: string,
    value: NestedSettings | HyprlandSetting
  ) => {
    if (typeof value === "object" && value !== null) {
      // Add a category label for the current key
      settings.push(Category(key));

      // Iterate over the entries of the current value
      Object.entries(value).forEach(([childKey, childValue]) => {
        if (typeof childValue === "object" && childValue !== null) {
          const firstKey = Object.keys(childValue)[0];

          // Check if the childValue has nested settings
          if (
            firstKey &&
            typeof childValue[firstKey] === "object" &&
            childValue[firstKey] !== null
          ) {
            // Recursively process nested settings
            processSetting(`${key}.${childKey}`, childValue as NestedSettings);
          } else {
            // If no nested settings, treat it as a HyprlandSetting
            settings.push(
              Setting(
                `hyprland.${key}.${childKey}`,
                childValue as HyprlandSetting
              )
            );
          }
        }
      });
    }
  };

  Object.entries(globalSettings.get().hyprland).forEach(([key, value]) => {
    processSetting(key, value);
  });

  return (
    <box vertical={true} spacing={5} className="settings">
      {settings}
    </box>
  );
};

const windowActions = (
  <box hexpand={true} className="window-actions">
    <box
      hexpand={true}
      halign={Gtk.Align.START}
      child={
        <button
          halign={Gtk.Align.END}
          label=""
          onClicked={() => {
            settingsVisibility.set(false);
            hideWindow("settings");
          }}
        />
      }></box>
    <button label="󰑐" onClicked={() => execAsync(`bash -c "hyprctl reload"`)} />
  </box>
);

const Display = (
  <box vertical={true} className="settings-widget">
    {windowActions}
    <Settings />
  </box>
);

export default () => {
  return (
    <window
      name="settings"
      namespace="settings"
      application={App}
      className=""
      anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT}
      visible={bind(settingsVisibility)}
      margin={globalMargin}
      child={Display}></window>
  );
};
