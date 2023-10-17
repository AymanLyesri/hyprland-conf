if [ $# -eq 0 ]
then
    echo ""
else
    swaymsg exec systemctl poweroff
fi
