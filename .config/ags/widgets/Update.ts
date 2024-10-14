import { Subprocess } from "types/@girs/gio-2.0/gio-2.0.cjs"
import { timeout } from "types/utils/timeout";

const maxLabelLength = 50;

const password = Variable("password");

export default () =>
{
    const update = (action, database) => Utils.subprocess(
        // command to run, in an array just like execAsync
        ['bash', '-c', `${App.configDir}/scripts/update.sh "${action}" "${database}" "${password.value}"`],

        // callback when the program outputs something to stdout
        (output) =>
        {
            if (info.label.length + output.length + 1 > maxLabelLength) {
                info.label = info.label.substring(0, maxLabelLength - output.length - 1); // Adjust for new length
            }
            info.label += "\n" + output;

            spinner.child = Widget.Spinner({
                hexpand: true,
                hpack: "end",
            });
        },

        // callback on error
        (err) =>
        {
            // if (err != '' || !err.includes("signal") || !err.includes("password for")) Utils.notify("Error", err)
        },
    )

    // const update = (action, database) => Utils.exec(
    //     ["bash", "-c", `${App.configDir}/scripts/update.sh "${action}" "${database}" "${password.value}"`]
    // )

    var updateSubprocess: Subprocess

    const Password = Widget.Entry({
        placeholder_text: "Password",
        visibility: false,
        hexpand: true,
        on_change: ({ text }) =>
        {
            if (!text) return;
            password.value = text
        },
    })

    const Top = (label, action, database) => Widget.Box({
        hexpand: true,
        children: [
            Widget.Label({ label: label }),
            Widget.Box({
                hexpand: true,
                hpack: "end",
                children: [
                    Widget.Button({
                        label: "update",
                        on_clicked: () =>
                        {
                            info.label = "";
                            updateSubprocess = update(action, database);
                        },
                    }),
                    Widget.Button({
                        label: "cancel",
                        on_clicked: () =>
                        {

                            updateSubprocess.force_exit();

                            updateSubprocess.wait_async(null, () =>
                            {
                                setTimeout(() =>
                                {
                                    info.label = "No updates running";
                                    spinner.child.destroy();
                                }, 1000);
                            });

                        },
                    }),
                ]
            }),
        ]
    })

    const info = Widget.Label({
        label: "No updates running",
        // truncate: "end",
        max_width_chars: 50,
        wrap: true,
    })

    const spinner = Widget.Box({
        hexpand: true,
        hpack: "end",
        visible: false,

    })

    const Bottom = Widget.Box({
        visible: true,
        hexpand: true,
        children: [
            info,
            spinner
        ],
    })

    const Pacman = Widget.Box({
        class_name: "pacman",
        vertical: true,
        spacing: 5,
        children: [
            Top("Pacman", "--update", "system"),
            Bottom,
        ]
    })

    return Widget.Box({
        class_name: "update-widget",
        vertical: true,
        spacing: 10,
        children: [
            // Password,
            Pacman,
        ]
    })
}