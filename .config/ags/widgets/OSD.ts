import { globalMargin } from "variables"
import brightness from "services/brightness";
const audio = await Service.import("audio")

const DELAY = 2500



function OnScreenProgress(vertical: boolean)
{

    const osdSlider = (initialValue, onChange) =>
    {
        const indicator = Widget.Label("");

        const Slider = Widget.Slider({
            vertical: true,
            inverted: true,
            class_name: "slider",
            draw_value: false,
            height_request: 100,
            value: initialValue,  // Initialize the slider to the current value
            on_change: ({ value }) =>
            {
                onChange(value);  // Call the provided callback to update the external value
            },
        });

        const revealer = Widget.Revealer({
            transition: "slide_left",
            child: Slider,
        });

        const eventBox = Widget.EventBox({
            on_hover_lost: () => revealer.reveal_child = false,
            child: revealer,
        });
        return eventBox;
    };

    // Usage for VolumeSlider
    const VolumeSlider = osdSlider(audio.speaker.volume, (value) =>
    {
        audio.speaker.volume = value;  // Update the volume directly
    });

    // Usage for BrightnessSlider
    const BrightnessSlider = osdSlider(brightness.screen_value, (value) =>
    {
        brightness.screen_value = value;  // Update the brightness directly
    });


    let debounceTimer: any;

    function show(osdSlider: any, value: number, icon: string)
    {
        console.log("showing");
        osdSlider.child.reveal_child = true;
        osdSlider.child.child.set_value(value);

        // Clear the existing debounce timer to reset it
        if (debounceTimer !== null) {
            clearTimeout(debounceTimer);
        }

        // Set a new debounce timer
        debounceTimer = setTimeout(() =>
        {
            if (!osdSlider.isHovered()) {
                osdSlider.child.reveal_child = false;
            }
            debounceTimer = null;  // Reset the debounce timer variable
        }, DELAY);
    }


    const icons = {
        75: "",
        50: "",
        25: "",
        0: "",
    };

    function getIcon()
    {
        if (audio.speaker.is_muted) {
            return icons[0]; // Return mute icon
        }

        const volumeLevel: number = [75, 50, 25, 0].find(
            (threshold) => threshold <= audio.speaker.volume * 100
        ) ?? 0;  // If find() returns undefined, default to 0

        return icons[volumeLevel];
    }

    return Widget.Box({
        children: [VolumeSlider]
    })
        .hook(brightness, () => show(BrightnessSlider, 10, ""), "notify::screen")
        .hook(brightness, () => show(BrightnessSlider, 10, ""), "notify::kbd")
        .hook(audio.speaker, () => show(VolumeSlider, audio.speaker.volume, getIcon()), "notify::volume")

}

function MicrophoneMute()
{
    const icon = Widget.Icon({
        class_name: "microphone",
    })

    const revealer = Widget.Revealer({
        transition: "slide_up",
        child: icon,
    })

    let count = 0
    let mute = audio.microphone.stream?.is_muted ?? false

    return revealer.hook(audio.microphone, () => Utils.idle(() =>
    {
        if (mute !== audio.microphone.stream?.is_muted) {
            mute = audio.microphone.stream!.is_muted
            icon.icon = ""
            revealer.reveal_child = true
            count++

            Utils.timeout(DELAY, () =>
            {
                count--
                if (count === 0)
                    revealer.reveal_child = false
            })
        }
    }))
}

export default () => Widget.Window({
    name: `OSD`,
    class_name: "indicator",
    layer: "overlay",
    margins: [globalMargin, globalMargin],

    anchor: ["right"],
    child: Widget.Box({
        class_name: "osd",
        expand: true,
        children:
            [Widget.Box({
                hpack: "center",
                vpack: "center",
                child: OnScreenProgress(true),
            }),
            ]

    }),
})