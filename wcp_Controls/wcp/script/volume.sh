if [ $# -eq 0 ]
then
# return actual volume when no parameter is received
    echo $(pamixer --get-volume)
else
# set first parameter as volume if there is parameter
    res=$(pactl set-sink-volume @DEFAULT_SINK@ $1%)
fi
