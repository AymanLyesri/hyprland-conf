#!/usr/bin/env bash

iDIR="$HOME/.config/hypr/mako/icons"

# Get brightness
get_backlight() {
	LIGHT=$(printf "%.0f\n" $(brightnessctl -d '*::kbd_backlight' i))
	echo "${LIGHT}%"
}

# Get icons
get_icon() {
	backlight="$(brightnessctl -d '*::kbd_backlight' g)"
	current="${backlight%%%}"
	if [[ ("$current" -ge "0") && ("$current" -le "1") ]]; then
		icon="$iDIR/brightness-20.png"
	elif [[ ("$current" -ge "1") && ("$current" -le "2") ]]; then
		icon="$iDIR/brightness-60.png"
	elif [[ ("$current" -ge "2") && ("$current" -le "3") ]]; then
		icon="$iDIR/brightness-100.png"
	fi
}

# Notify
notify_user() {
	notify-send -h string:x-canonical-private-synchronous:sys-notify -u low -i "$icon" "Keyboard Brightness : $(brightnessctl -d '*::kbd_backlight' g)"
}

# Increase brightness
inc_backlight() {
	brightnessctl -d *::kbd_backlight set 33%+ && get_icon && notify_user
}

# Decrease brightness
dec_backlight() {
	brightnessctl -d *::kbd_backlight set 33%- && get_icon && notify_user
}

# Execute accordingly
if [[ "$1" == "--get" ]]; then
	brightnessctl -d '*::kbd_backlight' g
elif [[ "$1" == "--inc" ]]; then
	inc_backlight
elif [[ "$1" == "--dec" ]]; then
	dec_backlight
else
	get_backlight
fi
