# Description

This is my daily driver configuration that I use on both my laptop and desktop for coding, gaming, trading, browsing the web, etc., with Dvorak in mind. I am constantly adding new features and improvements.

I use Arch BTW.. :)

Feel free to share your feedback ♡ (anything you can think of) !

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
- **Global Theme switcher (Light/Dark)**: Custom scripts
- **Ags widgets** ~~(Eww replaced)~~:
  - Color scheme based on current wallpaper
  - Main bar
    - Dark/light modes
    - Bandwidth speed monitor
  - Application launcher ~~(Rofi replaced)~~
    - App loading progress bar
  - Wallpaper switcher for each workspace
  - Media player
  - Right panel:
    - Waifu display
    - System resource monitor
    - Notification history - filter
- ~~**Dynamic window borders**: Custom scripts & PyWal~~
- **Machine-based configuration** (laptop/desktop):
  - Blur
  - Mouse sensitivity
  - Gaps
  - ~~Border size~~
- **Customizable shaders**: Includes saturation & retro effects
- **High-quality wallpapers** from [Danbooru](https://danbooru.donmai.us), [Yandere](https://yande.re), and [Gelbooru](https://gelbooru.com)

# Current Workflow

> **Important:** Screenshots below ⊽

| W1  | W2                                                  | W3  | W4                                                  | W5                                           | W6                                                  | W7                                                                            | W8  | W9  | W10   |
| --- | --------------------------------------------------- | --- | --------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | ----- |
| --- | [Firefox](https://wiki.archlinux.org/title/firefox) | --- | [Spotify](https://wiki.archlinux.org/title/spotify) | [Btop](https://github.com/aristocratos/btop) | [Discord](https://wiki.archlinux.org/title/Discord) | [Steam](https://wiki.archlinux.org/title/steam)/[Lutris](https://lutris.net/) | --- | --- | Games |

- **W`id`**: Workspace with corresponding ID.
- **`---`**: Placeholder, any app can go here.
- **`name`**: Application that opens automatically in its designated workspace.

# To-Do List

- Add tutorials for each part of the dot-files **(WIP)**
- List essential packages for easy download **(WIP)**
- Provide an easy-to-read list of keybinds **(WIP)**
- Continuous improvements and polishing **(INDEFINITELY)**

# [KeyBinds](https://github.com/AymanLyesri/hyprland-conf/blob/master/.config/hypr/configs/keybinds.conf)

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

# [Package List](https://github.com/AymanLyesri/hyprland-conf/blob/master/.config/hypr/pacman/pkglist.txt) and Installation

**To install packages:**

> **Warning:** Certain packages need to be installed through a Pacman wrapper, e.g., [yay](https://github.com/Jguer/yay).
> Some packages may be missing or added unnecessarily.

```bash
cd $HOME
pacman -S - < .config/hypr/pacman/pkglist.txt
#OR
yay -S - < .config/hypr/pacman/pkglist.txt
```

**To generate a package list:** `optional`

```bash
cd $HOME
pacman -Qqen > .config/hypr/pacman/pkglist.txt
#OR
yay -Qqen > .config/hypr/pacman/pkglist.txt
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

<details>
  <summary>SCREENSHOTS</summary>
  <img src="https://github.com/user-attachments/assets/52d5ea0c-fd64-4890-8bcb-b4832819ce2a" alt="Right Panel">
</details>

### Media Player

<details>
  <summary>SCREENSHOTS</summary>
  <img src="https://github.com/user-attachments/assets/1c56869d-8b83-457a-8f28-b6006ae83fdb" alt="Media Player">
</details>

### Application Launcher

<details>
  <summary>SCREENSHOTS</summary>
  <img src="https://github.com/user-attachments/assets/79077273-04d2-4871-a5a1-078de8f2a83e" alt="Application Launcher 1">
  <img src="https://github.com/user-attachments/assets/6f76124c-5361-420f-a7e0-3ae73aa2e297" alt="Application Launcher 2">
</details>

### Wallpaper Switcher

<details>
  <summary>SCREENSHOTS</summary>
  <img src="https://github.com/user-attachments/assets/b3f411f5-14ab-4304-ae95-9c2e93b7f886" alt="Wallpaper Switcher">
</details>

### Theme Switching

<details>
  <summary>SCREENSHOTS</summary>
  <img src="https://github.com/user-attachments/assets/f3321fb4-9992-4133-b860-c2e7b8f246d6" alt="Theme Switching 1">
  <img src="https://github.com/user-attachments/assets/87da3faa-fbc4-47d8-9901-354e54f5452e" alt="Theme Switching 2">
</details>

### Screenshot of All Workspaces

<details>
  <summary>SCREENSHOTS</summary>
  <img src="https://github.com/user-attachments/assets/3166118e-3023-4434-985b-23ae02b8aed2" alt="All Workspaces">
</details>

### Screenshot of All Workspaces ("Old")

<details>
  <summary>SCREENSHOTS</summary>
  <img src="https://github.com/AymanLyesri/hyprland-conf/assets/80812811/c84884a7-ce5b-4363-a2fb-8a6ccebc05c5" alt="Old Workspaces">
</details>
