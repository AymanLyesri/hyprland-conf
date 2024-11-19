import { execAsync, Variable } from "../../../../../usr/share/astal/gjs";
import { readJSONFile, writeJSONFile } from "./json";

const settingsPath = "./assets/settings/settings.json";

const defaultSettings: Settings = {
  hyprsunset: {
    kelvin: 6500
  },
  hyprland: {
    decoration: {
      rounding: { value: 15, min: 0, max: 50, type: "int" },
      active_opacity: { value: 0.8, min: 0, max: 1, type: "float" },
      inactive_opacity: { value: 0.5, min: 0, max: 1, type: "float" },
      blur: {
        enabled: { value: true, type: "bool", min: 0, max: 1 },
        size: { value: 3, type: "int", min: 0, max: 10 },
        passes: { value: 3, type: "int", min: 0, max: 10 }
      }
    },
  },
  notifications: {
    dnd: false
  },
  globalOpacity: 0.8,
  bar: {
    lock: true
  },
  waifu: {
    input_history: "",
    visibility: true,
    current: "",
    favorites: [{
      id: "",
      preview: "",
    }],
  },
  rightPanel: {
    exclusivity: true,
    lock: true,
    width: 300,
    visibility: true,
    widgets: []
  },
  quickLauncher: {
    apps: [
      { name: "Browser", app_name: "zen-browser", exec: "zen-browser", icon: "" },
      { name: "Terminal", app_name: "kitty", exec: "kitty", icon: "" },
      { name: "Files", app_name: "thunar", exec: "thunar", icon: "" },
      { name: "Calculator", app_name: "kitty", exec: "kitty bc", icon: "" },
      { name: "Text Editor", app_name: "code", exec: "code", icon: "" },
    ]
  }
}

// Settings are stored in a json file, containing all the settings, check if it exists, if not, create it
export const globalSettings = Variable<Settings>(defaultSettings);

function deepMerge(target: any, source: any): any
{
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // Recursively merge objects
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      // Directly copy primitive values and arrays
      target[key] = source[key];
    }
  }
  return target;
}


// Settings are stored in a json file, containing all the settings, check if it exists, if not, create it
if (Object.keys(readJSONFile(settingsPath)).length !== 0) {
  globalSettings.set(deepMerge(defaultSettings, readJSONFile(settingsPath)))
} else {
  writeJSONFile(settingsPath, globalSettings.get());
}

// When the settings change, write them to the json file
// globalSettings.watch('changed', ({ self }) =>
// {
//   writeJSONFile(settingsPath, value);
// });


export function setSetting(key: string, value: any): any
{
  let o: any = globalSettings.get();
  key.split('.').reduce((o, k, i, arr) =>
    o[k] = (i === arr.length - 1 ? value : o[k] || {}), o);
  globalSettings.set(o);
}

export function getSetting(key: string): any
{
  return key.split('.').reduce((o: any, k) => o?.[k], globalSettings.get());
}

export function exportSettings()
{
  execAsync(`bash -c 'cat ${settingsPath} | wl-copy'`)
}
