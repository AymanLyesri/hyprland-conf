export async function hyprctl(command, options = "")
{
    return Utils.execAsync(`hyprctl dispatch exec "[float;${options}] ${command}"`).catch(err => print(err))
}