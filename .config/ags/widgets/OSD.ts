import { globalMargin } from "variables"
import brightness from "services/brightness";
const audio = await Service.import("audio")

const DELAY = 1500

function OnScreenProgress(vertical: boolean)
{

    const osdSlider = (initialValue, onChange) =>
    {
        const indicator = Widget.Label({
            visible: false,
        });

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
            child: Widget.Box({
                vertical: true,
                children: [Slider, indicator],
            })
        });

        const eventBox = Widget.EventBox({
            attribute: {
                debounceTimer: null,
                setValue: (value) => Slider.value = value,
                setIndicator: (text) => indicator.label = text,
                show: () => revealer.reveal_child = true,
                hide: () => revealer.reveal_child = false,
            },
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

    const MicrophoneSlider = osdSlider(audio.microphone.volume, (value) =>
    {
        audio.microphone.volume = value;  // Update the volume directly
    });

    // Usage for BrightnessSlider
    const BrightnessSlider = osdSlider(brightness.screen_value, (value) =>
    {
        brightness.screen_value = value;  // Update the brightness directly
    });


    function show(osdSlider: any, value: number, icon: string)
    {
        osdSlider.attribute.show();
        osdSlider.attribute.setValue(value);
        osdSlider.attribute.setIndicator(icon);

        // Clear the existing debounce timer to reset it
        if (osdSlider.attribute.debounceTimer !== null) {
            clearTimeout(osdSlider.attribute.debounceTimer);
        }

        // Set a new debounce timer
        osdSlider.attribute.debounceTimer = setTimeout(() =>
        {
            if (!osdSlider.isHovered()) {
                osdSlider.attribute.hide();
            }
            osdSlider.attribute.debounceTimer = null;  // Reset the debounce timer variable
        }, DELAY);
    }

    function getBrightnessIcon(v)
    {
        switch (true) {
            case v > 0.75:
                return "󰃠";
            case v > 0.5:
                return "󰃟";
            case v > 0:
                return "󰃞";
            default:
                return "󰃞";
        }
    }

    function getVolumeIcon(v)
    {
        switch (true) {
            case v > 0.75:
                return "";
            case v > 0.5:
                return "";
            case v > 0.25:
                return "";
            default:
                return "";
        }
    }

    return Widget.Box({
        children: [VolumeSlider, MicrophoneSlider, BrightnessSlider],
    })
        .hook(brightness, () => show(BrightnessSlider, brightness.screen_value, getBrightnessIcon(brightness.screen_value)), "notify::screen-value")
        .hook(audio.speaker, () => show(VolumeSlider, audio.speaker.volume, getVolumeIcon(audio.speaker.volume)), "notify::volume")
        .hook(audio.microphone, () => show(MicrophoneSlider, audio.microphone.volume, ""), "notify::volume")

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
    name: `osd`,
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