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

- dynamic wallpapers based on workspaces: [hyprpaper](https://github.com/hyprwm/hyprpaper) `+ custom scripts`
- screenshot all active workspaces into one image: `custom scripts`
- dynamic color theme: [pyWal](https://github.com/dylanaraps/pywal)
- dynamic eww
  - color themes: [pyWal](https://github.com/dylanaraps/pywal)
  - dark/light modes: `custom scripts`
  - bandwidth speed: `custom scripts`
  - media player: `custom scripts`
  - essential stuff
- dynamic window border: [pyWal](https://github.com/dylanaraps/pywal) `+ custom scripts`
- dynamic configuration based on machine type (laptop/desktop)
  - blur: `custom scripts`
  - sensitivity: `custom scripts`
  - gaps: `custom scripts`
  - border size: `custom scripts`
- dynamic and customizable shaders: `saturation & retro`
- high quality wallpapers that Quentin Tarantino would love :) mainly from [danboruu](https://danbooru.donmai.us) and sometimes [yandere](https://yande.re)

> [!important]  
> ⊽ MORE INFO DOWN BELOW ⊽

# NEW VERSION

![gif](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGZzN3pnajVmZHVxMWJweDVjN3J2enlocW91ODRhZ3N6NGpjdW83dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nM9nOv0R2cn3xLqY7U/giphy-downsized-large.gif)

![1](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/f8de7f60-575e-4ab3-a03f-59d54879f4f5)

![basic work](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/9d9c5c32-5f4c-47e3-b1eb-c0d861425ad9)

![spotify](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/5fc94244-3853-47ea-a82f-fe69b75c0689)

old look

![old](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/b6f06611-716f-411b-bd89-d6a3f0c8f8b5)

# Current Workflow

| W1  | W2                                                    | W3  | w4                                   | W5                                           | W6                              | W7                                                                     | W8  | W9  | W10   |
| --- | ----------------------------------------------------- | --- | ------------------------------------ | -------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------- | --- | --- | ----- |
| --- | [Firefox](https://www.mozilla.org/en-US/firefox/new/) | --- | [Spotify](https://open.spotify.com/) | [Btop](https://github.com/aristocratos/btop) | [Discord](https://discord.com/) | [Steam](https://store.steampowered.com/)/[Lutris](https://lutris.net/) | --- | --- | Games |

- W`id`: workspace with corresponded id
- `---`: anything goes here

# To Do

- list essential packages for easy download `WIP`
- improve more! polish more! `INDEFINITELY`
- list all key-binds with ez readability `WIP`

# [KeyBinds](https://github.com/AymanLyesri/hyprland-conf/blob/master/.config/hypr/configs/keybinds.conf)

# Package list and how it works

it was generated using `pacman -Qqen > .config/hypr/pacman/pkglist.txt`.
I removed some redundant packages

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

- all the key binds are stored in `configs/keybinds.conf`
- to change wallpaper configuration just go to the desired workspace and change it, it will save automatically.
- Some config files needs to be linked to there appropriate locations using `ln`, be sure to read its [documentation](https://man7.org/linux/man-pages/man1/ln.1.html)

# Lil things to know about

- I am using dvorak so things may not work smoothly for u qwerty users.

- I've rebinded all the num-pad button to work as number buttons using [evremap](https://github.com/wez/evremap), my laptop keyboard is broken :/
