if [ $# -eq 0 ]
then
# return actual device when no parameter is received
    device=$(bluetoothctl info | sed -n 2p | awk '{for(i=2;i<=NF;i++) printf $i" "}')
    if [ ${#device} -eq 0 ]
    then
	echo "No device connected"
    else
	echo $device
    fi
fi
