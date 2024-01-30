# Description

This is my daily driver config that i use in both my laptop and desktop, for coding, gaming, browsing the web etc. With dvorak in mind.

I am constantly adding new features and improvement.

So be sure to gimme ur feedback ♡

# Design Philosophy

- More productivity
- More responsiveness
- More animations
- More wallpapers
- More colors

# Features

- dynamic wallpapers based on workspaces `hyprpaper + custom scripts`
- dynamic color theme `pyWal`
- dynamic eww
  - color themes `pyWal`
  - dark/light modes `custom scripts`
  - bandwidth speed `custom scripts`
  - media player `custom scripts`
- dynamic window border `pywal + custom scripts`
- dynamic sensitivity based on machine type (laptop/desktop) `custom scripts`
- high quality wallpapers that Quentin Tarantino would love :) `mainly from danbooru`

> [!important]  
> ⊽ MORE INFO DOWN BELOW ⊽

# NEW VERSION

![image](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/f8de7f60-575e-4ab3-a03f-59d54879f4f5)

![image](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/322d1923-e9ff-4512-95d8-b94bda55eb4e)

![image](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/5fc94244-3853-47ea-a82f-fe69b75c0689)

old look

![image](https://github.com/AymanLyesri/hyprland-conf/assets/80812811/b6f06611-716f-411b-bd89-d6a3f0c8f8b5)

# To Do

- list needed packages for easy download `WIP`
- improve more! polish more! `INDEFINITELY`

# Package list and how it works

it was generated using `pacman -Qqen > pkglist.txt`.
I removed some redundant packages

_*To install*_

> [!warning]  
> certain packages could be missing or added unnecessarily

```
cd pacman
pacman -S - < pkglist.txt
```

# Tips

- all the key binds are stored in `configs/keybinds.conf`
- to change wallpaper configuration just go to the desired workspace and change it, it will save automatically.
- A lot of other application's config file needs to be linked to there appropriate locations using `ln`, be sure to read its [documentation](https://man7.org/linux/man-pages/man1/ln.1.html)

# Lil things to know about

- I am using dvorak so things may not work smoothly for u qwerty users.

- I've rebinded all the num-pad button to work as number buttons using `evremap`, my laptop keyboard is broken :/
