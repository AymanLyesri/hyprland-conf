export default () => Widget.Box({
    class_name: "calendar",
    hexpand: true,
    child: Widget.Calendar({
        hexpand: true,
        showDayNames: true,
        showDetails: true,
        showHeading: true,
        showWeekNumbers: false,
        // detail_height_rows: 15,
        detail_width_chars: 5,
        detail: (self, y, m, d) =>
        {
            return `<span color="white">${d}</span>`
        },
        onDaySelected: ({ date: [y, m, d] }) =>
        {
            print(`${y}. ${m}. ${d}.`)
        },
    })
}) 