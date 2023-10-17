if [ $# -eq 0 ]
then
    echo ""
else
    swaymsg exec blueman-manager
fi
