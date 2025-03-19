import { execAsync } from "astal";
import { readJSONFile, writeJSONFile } from "./json";
import { globalSettings } from "../variables";
import { Settings } from "../interfaces/settings.interface";

export const settingsPath = "./assets/settings/settings.json";

export const defaultSettings: Settings = {
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
  globalOpacity: { name: "Global Opacity", value: 0.9, type: "float", min: 0, max: 1 },
  globalIconSize: { name: "Global Icon Size", value: 10, type: "int", min: 5, max: 20 },
  bar: {
    visibility: true,
    lock: true,
    orientation: true
  },
  waifu: {
    input_history: "",
    visibility: true,
    current: {
      id: 0,
      preview: "",
      width: 0,
      height: 0,
      api: {
        name: "Danbooru",
        value: "danbooru",
        idSearchUrl: "https://danbooru.donmai.us/posts/",
      },
    },
    api: {
      name: "Danbooru",
      value: "danbooru",
      idSearchUrl: "https://danbooru.donmai.us/posts/",
    },
    favorites: [],
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

function deepMerge(target: any, source: any): any
{
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      // Check if both values are objects and not arrays
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
        targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        // Recursively merge objects if types match
        target[key] = deepMerge(targetValue, sourceValue);
      } else if (typeof sourceValue === typeof targetValue || targetValue === undefined) {
        // Assign source value if types match or if target doesn't have the key
        target[key] = sourceValue;
      }
      // If types don't match, prioritize the target's type by skipping the assignment
    }
  }
  return target;
}

// Settings are stored in a json file, containing all the settings, check if it exists, if not, create it
export function autoCreateSettings()
{
  if (Object.keys(readJSONFile(settingsPath)).length !== 0) {
    globalSettings.set(deepMerge(defaultSettings, readJSONFile(settingsPath)))
  } else {
    writeJSONFile(settingsPath, globalSettings.get());
  }
}

export function setSetting(key: string, value: any): any
{
  let o: any = globalSettings.get();
  key.split('.').reduce((o, k, i, arr) =>
    o[k] = (i === arr.length - 1 ? value : o[k] || {}), o);

  globalSettings.set({ ...o });
}

export function getSetting(key: string): any // returns the value of the key in the settings
{
  return key.split('.').reduce((o: any, k) => o?.[k], globalSettings.get());
}

export function exportSettings()
{
  execAsync(`bash -c 'cat ${settingsPath} | wl-copy'`)
}



