import { Subprocess } from "types/@girs/gio-2.0/gio-2.0.cjs"

const update = (action, database) => Utils.subprocess(
    // command to run, in an array just like execAsync
    ['bash', '-c', `${App.configDir}/scripts/update.sh ${action} ${database}`],

    // callback when the program outputs something to stdout
    (output) =>
    {

        // Bottom.pack_end(Widget.Spinner({
        //     hexpand: true,
        //     hpack: "end",
        // }), false, false, 0);

        Bottom.children[0].label = output;
        Bottom.children[1].child = Widget.Spinner({
            hexpand: true,
            hpack: "end",
        });
    },

    // callback on error
    (err) => Utils.notify(err),

    // optional widget parameter
    // if the widget is destroyed the subprocess is forced to quit
    Bottom,
)

var updateSubprocess: Subprocess


export default () =>
{
    const Top = Widget.Box({
        hexpand: true,
        children: [
            Widget.Label({ label: "Update" }),
            Widget.Box({
                hexpand: true,
                hpack: "end",
                children: [
                    Widget.Button({
                        label: "repo",
                        on_clicked: () => updateSubprocess = update("--update", "repo"),
                    }),
                    Widget.Button({
                        label: "system",
                        on_clicked: () => updateSubprocess = update("--update", "system"),
                    }),
                    Widget.Button({
                        label: "cancel",
                        on_clicked: () =>
                        {
                            updateSubprocess.force_exit();
                            Bottom.children[0].label = "No updates running";
                            Bottom.children[1].child.destroy();
                        },
                    }),
                ]
            }),
        ]
    })

    const Bottom = Widget.Box({
        visible: true,
        hexpand: true,
        children: [
            Widget.Label({ label: "No updates running" }),
            Widget.Box({
                hexpand: true,
                hpack: "end",
                visible: false,

            }),
        ],
    })

    return Widget.Box({
        class_name: "update-widget",
        vertical: true,
        children: [
            Top,
            Bottom,
        ]
    })
}