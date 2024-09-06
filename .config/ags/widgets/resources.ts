const divide = ([total, free]) => free / total

function getTemperatureColor(value: number): string
{
    // Clamp the value between 0 and 1
    const clampedValue = Math.min(Math.max(value, 0), 1);

    // Cold (blue) to hot (red) gradient
    const red = Math.floor(clampedValue * 255);
    const green = Math.floor((1 - clampedValue) * 255);
    const blue = Math.floor((1 - clampedValue) * 255);

    return `rgb(${red}, ${green}, ${blue})`;
}

const CircularProgress = (binding, class_name) => Widget.CircularProgress({
    class_name: "circular-progress " + class_name,
    rounded: true,
    startAt: 0.75,
    css: binding.bind().as(value => `color: ${getTemperatureColor(value)}`),
    value: binding.bind()
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


const cpuProgress = Widget.Box({
    hexpand: true,
    hpack: "center",
    children: [Widget.Label({ label: "CPU" }),
    CircularProgress(cpu, "cpu")]
})

const ramProgress = Widget.Box({
    hexpand: true,
    hpack: "center",
    children: [Widget.Label({ label: "RAM" }),
    CircularProgress(ram, "ram")]
})

const diskProgress = Widget.Box({
    hexpand: true,
    hpack: "center",
    children: [Widget.Label({ label: "Disk" }),
    CircularProgress(disk, "disk")]
})

export function Resources()
{
    return Widget.Box({
        class_name: "resources",
        hexpand: true,
        children: [
            cpuProgress,
            ramProgress,
            diskProgress
        ],
    })
}