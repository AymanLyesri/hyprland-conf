# Description

This is my daily driver config that i use in both my laptop and desktop, for coding, gaming, browsing the web etc. With dvorak in mind.

I am constantly adding new features and improvement.

So be sure to gimme ur feedback ♡ (anything u could think of)

# Design Philosophy

- More productivity
- More responsiveness
- More wallpapers
- More animations
- More colors

# Features

- dynamic wallpapers based on workspaces: `custom scripts` & [hyprpaper](https://github.com/hyprwm/hyprpaper)
- screenshot all active workspaces into one image: `custom scripts`
- dynamic color theme: `custom scripts` & [pyWal](https://github.com/dylanaraps/pywal)
- dynamic eww
  - color themes: [pyWal](https://github.com/dylanaraps/pywal)
  - dark/light modes: `custom scripts`
  - bandwidth speed: `custom scripts`
  - media player: `custom scripts`
  - etc
- dynamic window border: `custom scripts` & [pyWal](https://github.com/dylanaraps/pywal)
- dynamic configuration based on machine type (laptop/desktop)
  - blur: `custom scripts`
  - sensitivity: `custom scripts`
  - gaps: `custom scripts`
  - border size: `custom scripts`
- dynamic and customizable shaders: `saturation & retro`
- high quality wallpapers that Quentin Tarantino would love :) mainly from [danboruu](https://danbooru.donmai.us) and sometimes [yandere](https://yande.re).

# Current Workflow

> [!important]  
> ⊽ SCREENSHOTS DOWN BELLOW ⊽

| W1  | W2                                                  | W3  | w4                                                  | W5                                           | W6                                                  | W7                                                                            | W8  | W9  | W10   |
| --- | --------------------------------------------------- | --- | --------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | ----- |
| --- | [Firefox](https://wiki.archlinux.org/title/firefox) | --- | [Spotify](https://wiki.archlinux.org/title/spotify) | [Btop](https://github.com/aristocratos/btop) | [Discord](https://wiki.archlinux.org/title/Discord) | [Steam](https://wiki.archlinux.org/title/steam)/[Lutris](https://lutris.net/) | --- | --- | Games |

- W`id`: workspace with corresponded id.
- `---`: anything goes here.

# To Do

-
- list essential packages for easy download `WIP`
- list all key-binds with ez readability `WIP`
- improve more! polish more! `INDEFINITELY`

# [KeyBinds](https://github.com/AymanLyesri/hyprland-conf/blob/master/.config/hypr/configs/keybinds.conf)

# Package list and how it works

it was generated using `pacman -Qqen > .config/hypr/pacman/pkglist.txt`

I removed some redundant packages.

_*To install*_

> [!warning]  
> Certain packages need to be installed through a Pacman wrapper E.g. [yay](https://github.com/Jguer/yay)

> [!warning]
> Certain packages could be missing or added unnecessarily

```
cd $HOME
pacman -S - < .config/hypr/pacman/pkglist.txt
```

# Tips

- when installing the config for the first time its recommended that u reboot the machine.
- to change wallpaper configuration just go to the desired workspace and change it, it will save automatically.
- Some config files needs to be linked to there appropriate locations using `ln`, be sure to read its [documentation](https://man7.org/linux/man-pages/man1/ln.1.html).

# Lil things to know about

- I am using dvorak so things may not work smoothly for u qwerty users.

- I've rebinded all the num-pad button to work as number buttons using [evremap](https://github.com/wez/evremap), my laptop keyboard is broken :/

- I've included my personal mobile wallpapers that i use on my android phone with the help of [Wallpaper Changer](https://play.google.com/store/apps/details?id=de.j4velin.wallpaperChanger&pcampaignid=web_share)

# Screenshot all workspaces

![1710006927_grim_result](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/c84884a7-ce5b-4363-a2fb-8a6ccebc05c5)
