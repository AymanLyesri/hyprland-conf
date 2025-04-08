import { execAsync } from "astal";
import { globalTheme } from "../variables";

export const getGlobalTheme = async () => execAsync([
    "bash",
    "-c",
    "$HOME/.config/hypr/theme/scripts/system-theme.sh get",
]).then((theme) => globalTheme.set(theme.includes("light")));

export const switchGlobalTheme = async () => execAsync([
    "bash",
    "-c",
    "$HOME/.config/hypr/theme/scripts/set-global-theme.sh switch",
]).then(() => globalTheme.set(!globalTheme.get()))
    .catch(() => globalTheme.set(false))

export const setGlobalTheme = async (theme: string) => execAsync([
    "bash",
    "-c",
    `$HOME/.config/hypr/theme/scripts/set-global-theme.sh switch ${theme}`,
]).then(() => globalTheme.set(theme.includes("light")))
    .catch(() => globalTheme.set(false))