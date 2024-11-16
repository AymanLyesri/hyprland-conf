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

const CircularProgress = (value: any, class_name, icon: string = '') => Widget.CircularProgress({
    class_name: "circular-progress " + class_name,
    rounded: true,
    startAt: 0.75,
    css: `color: ${getTemperatureColor(value)}`,
    value: value.bind(),
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
        child: CircularProgress(cpuTemperature, `cpu`, "󰔄")
    })

    const ramTempDisplay = Widget.Box({
        class_name: "temp",
        hpack: "end",
        child: CircularProgress(ramTemperature, `ram`, "󰔄")
    })

    const Resource = (name: string, value: any, icon: string, temp: any = null) => Widget.Box({
        class_names: ["resource", name],
        hexpand: true,
        children: value.bind().as(value => [Widget.Label({ label: icon }), horizontalProgress(value, name), temp])
    })

    const resources = Widget.Box({
        hexpand: true,
        vertical: true,
        spacing: 10,
        children: [
            Resource("cpu", cpu, "", cpuTempDisplay),
            Resource("ram", ram, "", ramTempDisplay),
            Resource("disk", disk, ""),
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