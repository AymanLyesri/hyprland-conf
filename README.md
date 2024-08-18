# Description

This is my daily driver config that i use in both my laptop and desktop, for coding, gaming, browsing the web etc. With dvorak in mind.

I am constantly adding new features and improvement.

So be sure to gimme ur feedback ♡ (anything u could think of)

# Design Philosophy

- More productivity
- More responsiveness
- More [Wallpapers](https://github.com/AymanLyesri/hyprland-conf/tree/master/wallpapers)
- More animations
- More colors

# Features

- dynamic wallpapers based on workspaces: `custom scripts` & [hyprpaper](https://github.com/hyprwm/hyprpaper)
- screenshot all active workspaces into one image: `custom script`
- dynamic color theme: `custom scripts` & [pyWal](https://github.com/dylanaraps/pywal)
- dynamic Ags widgets `eww no longer used`
  - main bar
  - wallpaper switcher for each workspace `custom scripts`
  - notifications
  - media player
  - color themes: [pyWal](https://github.com/dylanaraps/pywal)
  - dark/light modes: `custom scripts`
  - bandwidth speed: `custom scripts`
  - etc
- dynamic window border: `custom scripts` & [pyWal](https://github.com/dylanaraps/pywal)
- dynamic configuration based on machine type (laptop/desktop)
  - blur: `custom scripts`
  - sensitivity: `custom scripts`
  - gaps: `custom scripts`
  - border size: `custom scripts`
- customizable shaders: `saturation & retro`
- high quality wallpapers that Quentin Tarantino would love :) mainly from [danboruu](https://danbooru.donmai.us) and sometimes [yandere](https://yande.re) & [gelboruu](https://gelbooru.com).

# Current Workflow

> [!important]  
> ⊽ SCREENSHOTS DOWN BELLOW ⊽

| W1  | W2                                                  | W3  | w4                                                  | W5                                           | W6                                                  | W7                                                                            | W8  | W9  | W10   |
| --- | --------------------------------------------------- | --- | --------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | ----- |
| --- | [Firefox](https://wiki.archlinux.org/title/firefox) | --- | [Spotify](https://wiki.archlinux.org/title/spotify) | [Btop](https://github.com/aristocratos/btop) | [Discord](https://wiki.archlinux.org/title/Discord) | [Steam](https://wiki.archlinux.org/title/steam)/[Lutris](https://lutris.net/) | --- | --- | Games |

- W`id`: workspace with corresponded id.
- `---`: anything goes here.
- `name`: `name` will open automatically in the appropriate workspace

# To Do

- add tutorial for each part of the dot-files `WIP`
- list essential packages for easy download `WIP`
- list all key-binds with ez readability `WIP`
- improve more! polish more! `INDEFINITELY`

# [KeyBinds](https://github.com/AymanLyesri/hyprland-conf/blob/master/.config/hypr/configs/keybinds.conf)

# Package list and how it works

**To generate**

```bash
cd $HOME
pacman -Qqen > .config/hypr/pacman/pkglist.txt
# I removed some redundant packages.
```

**To install**

> [!warning]  
> Certain packages need to be installed through a Pacman wrapper E.g. [yay](https://github.com/Jguer/yay)

> [!warning]
> Certain packages could be missing or added unnecessarily

```bash
cd $HOME
pacman -S - < .config/hypr/pacman/pkglist.txt
```

# Tips

- when installing the config for the first time its recommended that u reboot the machine.

```bash
reboot # This will reboot the system without a warning
```

- to change wallpaper configuration just go to the desired workspace and change it using appropriate `keybind`, it will save automatically.

# Lil things to know about

- I am using dvorak so things may not work smoothly for u qwerty users.

- I've rebinded all the num-pad button to work as number buttons using [evremap](https://github.com/wez/evremap), my laptop keyboard is broken :/

- I've included my personal mobile wallpapers that i use on my android phone with the help of [Wallpaper Changer](https://play.google.com/store/apps/details?id=de.j4velin.wallpaperChanger&pcampaignid=web_share)

# Wallpaper Switcher
![image](https://github.com/user-attachments/assets/13c6efe9-255b-4a00-9436-c73547f7528e)
![image](https://github.com/user-attachments/assets/2d8b33ce-28fa-44c0-a9d7-5aaa12bc686a)

# Screenshot all workspaces "OLD"

![1710006927_grim_result](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/c84884a7-ce5b-4363-a2fb-8a6ccebc05c5)
