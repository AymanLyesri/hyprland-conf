import { readJSONFile, writeJSONFile } from "./json";

const settingsPath = App.configDir + "/assets/settings/settings.json";

const defaultSettings: Settings = {
  hyprland: {
    decoration: {
      active_opacity: 0.5,
      inactive_opacity: 0.1,
    }
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
  globalSettings.value = deepMerge(defaultSettings, readJSONFile(settingsPath));
} else {
  writeJSONFile(settingsPath, globalSettings.value);
}

// When the settings change, write them to the json file
globalSettings.connect('changed', ({ value }) =>
{
  print("globalsetting changed");
  writeJSONFile(settingsPath, value);
});


export function setSetting(key: string, value: any): any
{
  let o = globalSettings.value;
  key.split('.').reduce((o, k, i, arr) =>
    o[k] = (i === arr.length - 1 ? value : o[k] || {}), o);
  globalSettings.setValue(o);
}

export function getSetting(key: string): any
{
  return key.split('.').reduce((o, k) => o?.[k], globalSettings.value);
}

export function exportSettings()
{
  Utils.execAsync(`bash -c 'cat ${settingsPath} | wl-copy'`)
}
