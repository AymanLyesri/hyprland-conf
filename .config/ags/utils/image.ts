import { exec } from "../../../../../usr/share/astal/gjs";

export function getDominantColor(imagePath: string)
{
    // return Utils.execAsync(['bash', '-c', `magick ${imagePath} -resize 1x1 txt:- | grep -oP '#\w+'`])
    //     .then((output) =>
    //     {
    //         print("output : ", output)
    //         return output.trim()
    //     }).catch(err => { print("err", err); return "" });
    // print("imagePath : ", imagePath)
    // return "black"
    return exec(`bash ./scripts/get-image-color.sh ${imagePath}`)
    // return color
}

export function previewFloatImage(imagePath: string)
{
    Utils.execAsync(`swayimg -w 690,690 --class 'previewImage' ${imagePath}`)
        .catch(err => Utils.notify({ summary: 'Error', body: err }))
}