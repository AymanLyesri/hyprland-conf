import { globalOpacity } from "variables"

// target css file
const tmpCss = `/tmp/tmp-style.css`
const tmpScss = `/tmp/tmp-style.scss`
const scss_dir = `${App.configDir}/scss`

const walColors = `${App.configDir}/../../.cache/wal/colors.scss`
const defaultColors = `${App.configDir}/scss/defaultColors.scss`

export const getCssPath = () => tmpCss

export function refreshCss()
{
    // main scss file
    const scss = `${App.configDir}/scss/style.scss`

    Utils.execAsync(`bash -c "echo '$OPACITY: ${globalOpacity.value};' | cat - ${defaultColors} ${walColors} ${scss} > ${tmpScss} && sassc ${tmpScss} ${tmpCss} -I ${scss_dir}"`)
        .then((response) => { if (response != "") Utils.notify(response) })
        .finally(() =>
        {
            App.resetCss()
            App.applyCss(tmpCss)
        })
        .catch(err => Utils.notify(err))
}

Utils.monitorFile(
    // directory that contains the scss files
    `${App.configDir}/scss`,
    () => refreshCss()
)

Utils.monitorFile(
    // directory that contains pywal colors
    `${App.configDir}/../../.cache/wal/colors.scss`,
    () => refreshCss()
)
