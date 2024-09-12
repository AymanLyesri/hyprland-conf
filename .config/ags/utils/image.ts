
export function getDominantColor(imagePath: string)
{
    // return Utils.execAsync(['bash', '-c', `magick ${imagePath} -resize 1x1 txt:- | grep -oP '#\w+'`])
    //     .then((output) =>
    //     {
    //         print("output : ", output)
    //         return output.trim()
    //     }).catch(err => { print("err", err); return "" });
    // print("imagePath : ", imagePath)
    return Utils.exec(`${App.configDir}/scripts/get-image-color.sh ${imagePath}`)
    // return color
}
