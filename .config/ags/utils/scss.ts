
import { exec } from "astal"
import { monitorFile } from "astal/file"
import { App } from "astal/gtk3"
import { globalIconSize, globalOpacity } from "../variables"

// target css file
const tmpCss = `/tmp/tmp-style.css`
const tmpScss = `/tmp/tmp-style.scss`
const scss_dir = `./scss`

const walColors = `./../../.cache/wal/colors.scss`
const defaultColors = `./scss/defaultColors.scss`

export const getCssPath = () =>
{
    refreshCss()
    return tmpCss
}

export function refreshCss()
{
    const scss = `./scss/style.scss`

    const response = exec(`bash -c "echo '$OPACITY: ${globalOpacity.get().value};$ICON-SIZE:${globalIconSize.get().value}px;' | cat - ${defaultColors} ${walColors} ${scss} > ${tmpScss} && sassc ${tmpScss} ${tmpCss} -I ${scss_dir}"`)

    App.reset_css()
    App.apply_css(tmpCss)
}

monitorFile(
    // directory that contains the scss files
    `./scss`,
    () => refreshCss()
)

monitorFile(
    // directory that contains pywal colors
    `./../../.cache/wal/colors.scss`,
    () => refreshCss()
)
