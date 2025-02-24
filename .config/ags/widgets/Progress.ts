import { asyncSleep } from "utils/time";
import { globalMargin } from "variables";


const INTERVAL = 10;
const INCREMENT = 0.069;

const progressIncrement = Variable(INCREMENT)
const progressValue = Variable(0)

const levelBar = Widget.LevelBar({
    class_name: "progress-bar",
    max_value: 100,
    widthRequest: 333,
    value: progressValue.bind(),
})

async function RunningProgress()
{
    progressValue.value = 0;
    progressIncrement.value = INCREMENT;

    while (progressValue.value <= 100) {
        progressValue.value += progressIncrement.value;
        await asyncSleep(INTERVAL); // Wait for 2 seconds before continuing
    }
    App.closeWindow("progress");
}

export function openProgress()
{
    App.openWindow("progress");
    RunningProgress();
}

export function closeProgress()
{
    progressIncrement.value = 1; // to speed up the progress bar
}

const Spinner = Widget.Spinner()

export default () =>
{
    return Widget.Window({
        name: `progress`,
        anchor: ["bottom"],
        margins: [0, 0],
        visible: false,
        child: Widget.Box({
            class_name: "progress-widget",
            child: levelBar,
        }),
    })
}
