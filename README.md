# Description

This is my daily driver configuration that I use on both my laptop and desktop for coding, gaming, trading, browsing the web, etc., with Dvorak in mind. I am constantly adding new features and improvements.

I use Arch BTW.. :)

> **Feel free to open an issue ♡ (anything you can think of)!**

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
    - App launcher
    - Arithmetics
    - Url forwarding to default browser
  - Wallpaper switcher for each workspace
  - Media player
  - Right panel
    - Waifu display
    - System resource monitor
    - Notification history - filter
- **Machine-based configuration** (laptop/desktop):
  - Blur
  - Mouse sensitivity
  - Gaps
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

- **Users: Any suggestions or issues?**
- Make sure the dot files work for every machine not just mine **(WIP)**
- Add tutorials for each part of the dot-files **(WIP)**
- Continuous improvements and polishing **(INDEFINITELY)**

# [KeyBinds](https://github.com/AymanLyesri/hyprland-conf/blob/master/.config/hypr/configs/keybinds.conf)

# Installation Guide

### Step 1: Clone the Repository

> **Notice:** Repo has been Cleaned up from 2Gb to 90Mb, sorry for the inconvenience.

> Clone latest commit (less download size)

```bash
git clone --depth 1 https://github.com/AymanLyesri/hyprland-conf.git
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

> **Warning:** [Yay](https://github.com/Jguer/yay) need to be installed for this to work properly.

> Some packages may be missing or added unnecessarily.

```bash
#For installing and updating essential packages (default:yay)
bash $HOME/.config/hypr/pacman/update.sh [yay,paru...]
```

**To generate a package list:** `optional`

```bash
cd $HOME
pacman -Qqen > $HOME/.config/hypr/pacman/pkglist.txt
#OR
yay -Qqen > $HOME/.config/hypr/pacman/pkglist.txt
```

# Tips

- Most functionalities have associated [keybinds](https://github.com/AymanLyesri/hyprland-conf/blob/master/.config/hypr/configs/keybinds.conf). Check them out!
- When adding new wallpapers, be sure to run wallpaper reducer script to reduce there sizes.

> **Important:** If you encountered any problem even if its small, be sure to open an issue am happy to help :)

# Additional Notes

- I use **Dvorak**, so QWERTY users might face some issues.

# Visuals

### Application Launcher

<details>
  <summary>SCREENSHOTS</summary>

#### Apps

![1727169030_grim](https://github.com/user-attachments/assets/1de43c71-da3c-495c-885f-0b5b0f2f73a2)

#### Emojis

![1727198590_grim](https://github.com/user-attachments/assets/09c48f18-1d7f-499e-be24-efb836cc7821)

#### Arithmetics

![1727169606_grim](https://github.com/user-attachments/assets/e4610919-ab8b-44fb-8349-3ce124974281)

#### URLs

![1727169383_grim](https://github.com/user-attachments/assets/6d3ffd8e-8693-4e04-952e-a6d54d707c77)

</details>

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

### Wallpaper Switcher

<details>
  <summary>SCREENSHOTS</summary>

![1727169881_grim](https://github.com/user-attachments/assets/821dc6b8-386c-4fb2-9223-05f44e0ba046)

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
