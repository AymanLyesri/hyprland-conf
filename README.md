# Description

This is my daily driver configuration that I use on both my laptop and desktop for coding, gaming, browsing the web, etc., with Dvorak in mind. I am constantly adding new features and improvements.

Feel free to share your feedback ♡ (anything you can think of)!

# Design Philosophy

- Enhanced productivity
- Faster responsiveness
- [Wallpapers galore](https://github.com/AymanLyesri/hyprland-conf/tree/master/wallpapers)
- Smooth animations
- Vibrant color schemes

# Features

- **Dynamic wallpapers** based on workspaces: Custom scripts & [Hyprpaper](https://github.com/hyprwm/hyprpaper)
- **Screenshot all active workspaces** into one image: Custom script
- **Dynamic color themes**: Custom scripts & [PyWal](https://github.com/dylanaraps/pywal)
- **Dynamic Ags widgets** (Eww replaced):
  - Dynamic color schemes (using PyWal)
  - Main bar
    - Dark/light modes
    - Bandwidth speed monitor
  - Application launcher (replacing Rofi)
  - Wallpaper switcher for each workspace
  - Right panel:
    - Waifu display
    - System resources monitor
    - Notification filter
    - Media player
- **Dynamic window borders**: Custom scripts & PyWal
- **Machine-based configuration** (laptop/desktop):
  - Blur
  - Mouse sensitivity
  - Gaps
  - Border size
- **Customizable shaders**: Includes saturation & retro effects
- **High-quality wallpapers** from [Danbooru](https://danbooru.donmai.us), [Yandere](https://yande.re), and [Gelbooru](https://gelbooru.com)

# Current Workflow

> **Important:** Screenshots below ⊽

| W1  | W2                                                  | W3  | W4                                                  | W5                                           | W6                                                  | W7                                                                            | W8  | W9  | W10   |
| --- | --------------------------------------------------- | --- | --------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | ----- |
| --- | [Firefox](https://wiki.archlinux.org/title/firefox) | --- | [Spotify](https://wiki.archlinux.org/title/spotify) | [Btop](https://github.com/aristocratos/btop) | [Discord](https://wiki.archlinux.org/title/Discord) | [Steam](https://wiki.archlinux.org/title/steam)/[Lutris](https://lutris.net/) | --- | --- | Games |

- **W`id`**: Workspace with corresponding ID.
- **`---`**: Placeholder, any app can go here.
- **`name`**: Application that opens automatically in the workspace.

# To-Do List

- Add tutorials for each part of the dot-files **(WIP)**
- List essential packages for easy download **(WIP)**
- Provide an easy-to-read list of keybinds **(WIP)**
- Continuous improvements and polishing **(INDEFINITELY)**

# [KeyBinds](https://github.com/AymanLyesri/hyprland-conf/blob/master/.config/hypr/configs/keybinds.conf)

# Package List and Installation

**To generate a package list:**

```bash
cd $HOME
pacman -Qqen > .config/hypr/pacman/pkglist.txt
```

**To install packages:**

> **Warning:** Certain packages need to be installed through a Pacman wrapper, e.g., [yay](https://github.com/Jguer/yay).
> Some packages may be missing or added unnecessarily.

```bash
cd $HOME
pacman -S - < .config/hypr/pacman/pkglist.txt
```

# Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/AymanLyesri/hyprland-conf.git
```

### Step 2: Move the Repository to Your Home Directory

```bash
mv <repository_folder>/* $HOME/
```

### Step 3: Reboot Your System

```bash
sudo reboot
```

# Tips

- Most functionalities have associated [keybinds](https://github.com/AymanLyesri/hyprland-conf/blob/master/.config/hypr/configs/keybinds.conf). Check them out!
- After the initial installation, a reboot is recommended.

```bash
reboot # This will reboot the system without a warning
```

# Additional Notes

- I use **Dvorak**, so QWERTY users might face some issues.
- The **numpad** buttons are remapped as number keys using [evremap](https://github.com/wez/evremap) due to a broken laptop keyboard.
- I’ve included my personal **mobile wallpapers**, which I use on Android with [Wallpaper Changer](https://play.google.com/store/apps/details?id=de.j4velin.wallpaperChanger).

# Visuals

### Right Panel

![image](https://github.com/user-attachments/assets/7341b1d0-2b16-4d18-a6ee-39ba013911ec)

### Media Player

![image](https://github.com/user-attachments/assets/1c56869d-8b83-457a-8f28-b6006ae83fdb)

### Application Launcher

![image](https://github.com/user-attachments/assets/79077273-04d2-4871-a5a1-078de8f2a83e)
![image](https://github.com/user-attachments/assets/6f76124c-5361-420f-a7e0-3ae73aa2e297)

### Wallpaper Switcher

![image](https://github.com/user-attachments/assets/b3f411f5-14ab-4304-ae95-9c2e93b7f886)

### Screenshot of All Workspaces ("New")

![1724004552_grim_result](https://github.com/user-attachments/assets/3166118e-3023-4434-985b-23ae02b8aed2)

### Screenshot of All Workspaces ("Old")

![1710006927_grim_result](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/c84884a7-ce5b-4363-a2fb-8a6ccebc05c5)

```

```
