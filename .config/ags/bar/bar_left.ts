const hyprland = await Service.import("hyprland");

function Workspaces()
{
    let previousId: any = 0

    const workspaceToIcon = ["", "", "", "", "", "", "󰙯", "󰓓", "󰲯", "󰲰", ""]

    const activeId = hyprland.active.workspace.bind("id");
    const workspaces = hyprland.bind("workspaces").as((ws) =>
        ws
            .sort((a, b) => a.id - b.id) // Sort workspaces by id
            .map(({ id }) =>
            {
                return Widget.Button<any>({
                    on_clicked: () => hyprland.messageAsync(id == -99 ? `dispatch togglespecialworkspace` : `dispatch workspace ${id}`),
                    child: id == -99 ? Widget.Icon({ icon: "view-grid-symbolic" }) : Widget.Label(workspaceToIcon[id]),
                    class_name: activeId.as((i) =>
                    {
                        let class_name: string = `${i != previousId && i == id ? "focused" : i == previousId && i == id ? "same-focused" : ""}`
                        if (i == id) previousId = i;
                        return class_name
                    })
                });
            })
    );

    return Widget.Box({
        class_name: "workspaces",
        spacing: 5,
        children: workspaces,
    });
}

function truncateWithEllipsis(str, limit)
{
    return str.length > limit ? str.slice(0, limit - 2) + ".." : str;
}

function ClientTitle()
{
    return Widget.Label({
        class_name: "client-title",
        css: hyprland.active.client.bind("title").as(title => title.length > 0 ? "opacity: 1" : "opacity: 0"),
        // visible: hyprland.active.client.bind("title").as(title => title.length > 0),
        label: hyprland.active.client.bind("title").as(title => truncateWithEllipsis(title, 25)),
    });
}

// layout of the bar
export function Left()
{
    return Widget.Box({
        class_name: "bar_left",
        spacing: 8,
        children: [Workspaces(), ClientTitle()],
    });
}