const hyprland = await Service.import("hyprland");

function Workspaces()
{
    const activeId = hyprland.active.workspace.bind("id");
    const workspaces = hyprland.bind("workspaces").as((ws) =>
        ws
            .sort((a, b) => a.id - b.id) // Sort workspaces by id
            .map(({ id }) =>
            {
                return Widget.Button<any>({
                    on_clicked: () => hyprland.messageAsync(id == -99 ? `dispatch togglespecialworkspace` : `dispatch workspace ${id}`),
                    child: id == -99 ? Widget.Icon({ icon: "view-grid-symbolic" }) : Widget.Label(`${id}`),
                    class_name: activeId.as((i) => `${i === id ? "focused" : ""}`),
                });
            })
    );

    return Widget.Box({
        class_name: "workspaces",
        spacing: 5,
        children: workspaces,
    });
}

function ClientTitle()
{
    return Widget.Label({
        class_name: "client-title",
        label: hyprland.active.client.bind("title"),
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