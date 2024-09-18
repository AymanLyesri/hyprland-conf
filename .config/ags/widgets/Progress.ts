

const INTERVAL = 10;
const INCREMENT = 0.069;

const progressIncrement = Variable(INCREMENT)
const progressValue = Variable(0)

function sleep()
{
    return new Promise(resolve => setTimeout(resolve, INTERVAL));
}

const levelBar = Widget.LevelBar({
    class_name: "progress-bar",
    max_value: 100,
    widthRequest: 690,
    value: progressValue.bind(),
    setup: async (self) =>
    {
        while (true) {
            progressValue.value += progressIncrement.value;
            await sleep(); // Wait for 2 seconds before continuing
            if (progressValue.value >= 100) {
                App.closeWindow("progress");
            }
        }
    }
})

export function openProgress()
{
    progressValue.value = 0;
    progressIncrement.value = INCREMENT;
    App.openWindow("progress");
}

export function closeProgress()
{
    progressIncrement.value = 1;
}

export default () =>
{
    return Widget.Window({
        name: `progress`,
        anchor: ["bottom", "right"],
        margins: [10, 10],
        visible: false,
        child: Widget.Box({
            class_name: "progress-widget",
            children: [levelBar],
        }),
    })
}
