import { readJSONFile, writeJSONFile } from "./json";

const optionsPath = App.configDir + "/assets/options/options.json";

// Options are stored in a json file, containing all the options, check if it exists, if not, create it
const options = Variable<Options>({
  "waifu": {
    "input_history": "",
    "visibility": true
  },
  "rightPanel": {
    "exclusivity": true,
    "width": 300,
    "visibility": true,
    "widgets": []
  }
});


// Options are stored in a json file, containing all the options, check if it exists, if not, create it
if (Object.keys(readJSONFile(optionsPath)).length !== 0) {
  options.value = readJSONFile(optionsPath);
} else {
  writeJSONFile(optionsPath, options.value);
}

// When the options change, write them to the json file
options.connect('changed', ({ value }) =>
{
  writeJSONFile(optionsPath, value);
});


export function setOption(key: string, value: any): any
{
  let o = options.value;
  key.split('.').reduce((o, k, i, arr) =>
    o[k] = (i === arr.length - 1 ? value : o[k] || {}), o);
  options.setValue(o);
}

export function getOption(key: string): any
{
  return key.split('.').reduce((o, k) => o?.[k], options.value);
}
