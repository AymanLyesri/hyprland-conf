import { exec, execAsync } from "astal"
import { notify } from "./notification"


export function getDominantColor(imagePath: string)
{

    return exec(`bash ./scripts/get-image-color.sh ${imagePath}`)

}

export function previewFloatImage(imagePath: string)
{
    execAsync(`swayimg -w 690,690 --class 'previewImage' ${imagePath}`)
        .catch(err => notify({ summary: 'Error', body: err }))
}