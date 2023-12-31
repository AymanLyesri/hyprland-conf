#! /bin/bash
# requires eww, playerctl, bc, curl

EWW='eww --config /home/ayman/.config/hypr/eww'

isPlayerActive() {
    status=$(playerctl status --no-messages)
    [[ -z "$status" ]] && echo 0 || echo "$([[ "$status" = "Paused" ]] && echo 1 || echo 2)"
}

getMusicArtist() {
    echo $(playerctl metadata --format '{{artist}}')
}

getMusicTitle() {
    echo $(playerctl metadata --format '{{title}}')
}

getMusicDuration() {
    dur=$(playerctl metadata mpris:length)
    echo "$(expr $dur / 1000000)"
}

getMusicPosition() {
    pos=$(playerctl position)
    echo "${pos%%.*}"
}

getMusicProgress() {
    playerStatus=$(playerctl -l --no-messages)
    if [ "${playerStatus:0:7}" == "firefox" ]; then
        echo 0
    fi
    pos=$(getMusicPosition)
    dur=$(getMusicDuration)
    dur=$(echo "$dur / 100" | bc -l)
    echo "$pos / $dur" | bc -l
}

getMusicArt() {

    media="$HOME/.config/hypr/eww/bar/media"

    playerStatus=$(playerctl -l --no-messages)

    # Firefox
    if [ "${playerStatus:0:7}" == "firefox" ]; then
        path="$HOME/.mozilla/firefox/firefox-mpris/"
        image="$(ls $path)"
        echo "$path$image"
        return
    fi

    # Spotify
    if [ "$playerStatus" == "spotify" ]; then
        art_url=$(playerctl metadata mpris:artUrl)
        og_url=$(${EWW} get music_art_URL)
        if [ "$og_url" != "$art_url" ]; then #check if the same image as previous one
            curl $art_url >$media/spotify.jpg
            ${EWW} update music_art_URL=$art_url
        fi
        echo "$media/spotify.jpg"
        return
    fi
}

getMusicPlayerIcon() {
    playerStatus=$(playerctl -l --no-messages)
    icon="󰎆"
    # Firefox
    if [ "${playerStatus:0:7}" == "firefox" ]; then
        icon="󰈹"
    # Spotify
    elif [ "$playerStatus" == "spotify" ]; then
        icon=""
    fi
    echo $icon
}

getMusicPlayerColor() {
    playerStatus=$(playerctl -l --no-messages)
    color=''
    # Firefox
    if [ "${playerStatus:0:7}" == "firefox" ]; then
        color="rgb(255, 150, 50)"
    # Spotify
    elif [ "$playerStatus" == "spotify" ]; then
        color="rgb(0, 200, 100)"
    fi
    echo $color
}

noPlayerMode() {
    ${EWW} update music_art="$(getMusicArt)"
    ${EWW} update player_active=false
}

playerMode() {
    ${EWW} update player_active=$1
    ${EWW} update music_art="$(getMusicArt)"
    ${EWW} update music_icon="$(getMusicPlayerIcon)"
    ${EWW} update music_title="$(getMusicTitle)"
    ${EWW} update music_title_color="$(getMusicPlayerColor)"
    ${EWW} update music_artist="$(getMusicArtist)"
    ${EWW} update music_prog="$(getMusicProgress)"
}

update() {
    playerState=$(isPlayerActive)
    if [[ $playerState != 0 ]]; then
        playerMode $playerState
    else
        noPlayerMode
    fi
}

togglePlay() {
    playerctl play-pause
    ${EWW} update player_active=$(isPlayerActive)
}

previousTrack() {
    playerctl previous
    playerMode 2
}

nextTrack() {
    playerctl next
    playerMode 2
}

setProgress() {
    newPos=$1
    dur=$(getMusicDuration)
    dur=$(echo "$dur / 100" | bc -l)
    newPos=$(echo "$newPos * $dur" | bc -l && echo -n "%")
    playerctl position $newPos
}

case "$1" in
"--update")
    update
    ;;
"--play-pause")
    togglePlay
    ;;
"--previous")
    previousTrack
    ;;
"--next")
    nextTrack
    ;;
"--set-pos")
    setProgress $2
    ;;
"--is-active")
    isPlayerActive
    ;;
"--art")
    getMusicArt
    ;;
esac
