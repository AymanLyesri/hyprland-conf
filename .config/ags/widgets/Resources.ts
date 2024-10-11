const divide = ([total, free]) => free / total

function getTemperatureColor(value: number): string
{
    // Clamp the value between 0 and 1
    const clampedValue = Math.min(Math.max(value, 0), 1);

    // Cold (blue) to hot (red) gradient
    const red = Math.floor(clampedValue * 200);
    const green = Math.floor((1 - clampedValue) * 255);
    const blue = Math.floor((1 - clampedValue) * 255);

    return `rgb(${red}, ${green}, ${blue})`;
}

const CircularProgress = (value: number, class_name, icon: string = '') => Widget.CircularProgress({
    class_name: "circular-progress " + class_name,
    rounded: true,
    startAt: 0.75,
    css: `color: ${getTemperatureColor(value)}`,
    value: value,
    child: Widget.Label({ label: icon })
})

const horizontalProgress = (value: number, class_name) => Widget.LevelBar({
    vpack: "center",
    class_name: "progress-bar " + class_name,
    hexpand: true,
    value: value,
    css: `
    .filled{
        background: ${getTemperatureColor(value)};
        box-shadow: 0px 0px 5px 0px ${getTemperatureColor(value)};
    }
    `,
})

const cpu = Variable(0, {
    poll: [2000, 'top -b -n 1', out =>
        divide([100, parseFloat(out.split('\n')
            .find(line => line.includes('Cpu(s)'))?.split(/\s+/)[1]?.replace(',', '.') || '0')])
    ],
});
const ram = Variable(0, {
    poll: [2000, 'free', out =>
    {
        const memLine = out.split('\n').find(line => line.includes('Mem:'))?.split(/\s+/).slice(1, 3) || ['0', '1'];
        return divide([parseInt(memLine[0]), parseInt(memLine[1])]);
    }],
});
const disk = Variable(0, {
    poll: [2000, 'df -h /', out =>
    {
        const diskLine = out.split('\n').find(line => line.includes('/'))?.split(/\s+/).slice(1, 3) || ['0', '1'];
        return divide([parseInt(diskLine[0]), parseInt(diskLine[1])]);
    }],
});

const cpuTemperature = Variable<number>(0, {
    poll: [2000, ["bash", "-c", "sensors | grep 'Tctl' | awk '{print $2}' | tr -d '+°C'"], out => Number(out) / 100],
})

const ramTemperature = Variable<number>(0, {
    poll: [2000, ["bash", "-c", "sensors | grep 'mem' | awk '{print $2}' | tr -d '+°C'"], out => Number(out) / 100],
})

export function Resources()
{

    const cpuTempDisplay = Widget.Box({
        class_name: "temp",
        hpack: "end",
        child: cpuTemperature.bind().as(temp => CircularProgress(temp, `cpu`, "󰔄"))
    })

    const ramTempDisplay = Widget.Box({
        class_name: "temp",
        hpack: "end",
        child: ramTemperature.bind().as(temp => CircularProgress(temp, `ram`, "󰔄"))
    })

    const cpuResource = Widget.Box({
        class_name: "resource cpu",
        hexpand: true,
        children: cpu.bind().as(value => [Widget.Label({ label: "" }), horizontalProgress(value, "cpu"), cpuTempDisplay])
    })

    const ramResource = Widget.Box({
        class_name: "resource ram",
        hexpand: true,
        children: ram.bind().as(value => [Widget.Label({ label: "" }), horizontalProgress(value, "ram"), ramTempDisplay])
    })

    const diskResource = Widget.Box({
        class_name: "resource disk",
        hexpand: true,
        children: disk.bind().as(value => [Widget.Label({ label: "" }), horizontalProgress(value, "disk")])
    })

    const resources = Widget.Box({
        hexpand: true,
        vertical: true,
        spacing: 5,
        children: [
            cpuResource,
            ramResource,
            diskResource,
        ]
    })


    return Widget.Box({
        class_name: "resources",
        hexpand: true,
        vertical: true,
        children: [
            resources,
            // temperatures
        ],
    })
}