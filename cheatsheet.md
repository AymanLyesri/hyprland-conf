# Welcome to my Hyprland help, and tips and tricks #
# If you have questions, or need help you can open issue on my github
# Or you can reach me in or join on Discord that I admin
# Discord linkhttps://discord.gg/rxHczMSyjn   or you can message me directly on my discord JaKooLit#2819
# Github page: https://github.com/JaKooLit

  Super = Windows Key

# common operations
  Super          h        *keyhint* (THIS DOCUMENT)
  Super          Return   *term* (`foot`)
  Super          q        *quit* (kill focused window)
  Super   Shift  q        *quit* (kill focused window)
  Super          d        *show app menu* (`wofi small`)
  Super   Shift  d        *show app menu* (`wofi large`)

# wallpaper / styling stuff
  Super           w       *wallpaper shuffle* (right click on wallpaper   waybar module)
  Super   Shift   w       *waybar style-change* (middle click on wallpaper   waybar module)
  Super   Ctrl    w       *wallpaper switcher* (click on wallpaper waybar    module)
  Super   Alt     w       *Layout switcher* (right-click on menu (penguin) module) (default, plasma, gnome, dual)
  right click on update   waybar module  *wallpaper cycle using swaybg* (no animations)
  To change permanently the wallpaper edit the file in *~/.config/hypr/configs/exec.conf*
  for the wallpaper styles and configurations, you can watch my video about it *https://youtu.be/6ZGzOjMJBe4*
  scripts for wallpaper stuff are located in *~/.config/hypr/scripts* file names `changeWallpaper` `changeWallpaper2` `wallpaper-switcher` `waybar-style-change` (last one for waybar)

# Monitor, executables, keybindings, window rules
  files are located in *~/.config/hypr/configs*

# screenshot
  Super PrintSrc(button)       *full screenshot*
  Super Shift PrintSrc(button) *active window screenshot*         
  Super CTRL SHIFT PrintSrc    *full screenshot + timer (5s)*

# applications shortcuts
  Super   T		  *file manager* (`thunar`) - if installed

  Keybindings file is located here *~/.config/hypr/configs/keybinds.conf*
  
# container layout
 
  Super   Shift   Space       *toggle tiling/floating mode*
  Super   left mouse button   *move window*
  Super   right mouse button  *resize window* (note only in float mode)


# workspaces
  Super         1 .. 0    *switch to workspace 1 .. 10*
  Super  Shift  1 .. 0    *move container to workspace 1 .. 10*
  Super   Tab             *cycle through workspaces*

# waybar customizations
  - if you want 12h format instead of 24H format, edit the ~/.config/hypr/waybar/modules look for clock. delete the // and add // or delete the previous one
  - CPU Temperature:
    - a.) to change from deg C to deg F , edit the ~/.config/hypr/waybar/modules look for "temperature". Change the format to "format": "{temperatureF}°F {icon}",
    - b.) to fix the temperature if not showing correctly, comment "thermal zone": 0 by putting // before. Delete the // on the "hwmon path". Refresh waybar by pressing CTRL SHIFT w. If still not showing correctly, navigate to /sys/class/hwmon/ and open each hwmon. Look for k10temp for amd. Not sure about intel cpu. and edit accordingly the hwmon path in the "temperature" waybar module. use this function to easily identify the hwmon path. Thanks to @jqtmviyu
    ``` for i in /sys/class/hwmon/hwmon*/temp*_input; do echo "$(<$(dirname $i)/name): $(cat ${i%_*}_label 2>/dev/null || echo $(basename ${i%_*})) $(readlink -f $i)"; done ```
    
# Hyprland configurations
  - *Hyprland* configuration files are in `~/.config/hypr/`
  - files located in this folder can be edited using editor of your choice.

# notes for nvidia gpu users
  - Do note that you need to enable or disable some items in exec.conf file located in `~/.config/hypr/configs/exec.conf`
  
  - a guide on wiki - https://wiki.hyprland.org/Nvidia/


# other notes
  - *Multimedia keys* - may not work for every keyboard may need to hold down the function (`fn`) key
  - Follow the wiki - https://wiki.hyprland.org/
  - Follow the github - https://github.com/hyprwm/Hyprland



TO CLOSE THIS DOCUMENT - Super q or Super Shift q
