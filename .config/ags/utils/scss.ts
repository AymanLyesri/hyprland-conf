// target css file
const css = `/tmp/tmp-style.css`

export const getCssPath = () => css

export function refreshCss()
{
    // main scss file
    const scss = `${App.configDir}/scss/style.scss`
    Utils.exec(`sassc ${scss} ${css}`)
    App.resetCss()
    App.applyCss(css)
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
