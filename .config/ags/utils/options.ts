import { readJSONFile, writeJSONFile } from "./json";

const optionsPath = App.configDir + "/assets/options/options.json";

function createEmptyObject<T>(): Partial<Record<keyof T, any>>
{
  return {} as Partial<Record<keyof T, any>>;
}


const options = Variable<Options>(createEmptyObject<Options>() as any);

// Options are stored in a json file, containing all the options, check if it exists, if not, create it
if (readJSONFile(optionsPath)) {
  options.value = readJSONFile(optionsPath);
} else {
  writeJSONFile(optionsPath, options.value);
}

options.connect('changed', ({ value }) =>
{
  // print('options changed', value.waifu.input_history);
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
