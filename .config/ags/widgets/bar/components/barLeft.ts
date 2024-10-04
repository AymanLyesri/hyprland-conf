import { newAppWorkspace } from "variables";

const hyprland = await Service.import("hyprland");

function Workspaces()
{
    let previousId: any = 0

    const workspaceToIcon = ["", "", "", "", "", "", "󰙯", "󰓓", "", "", ""]

    const activeId = hyprland.active.workspace.bind("id");
    const workspaces = Utils.merge([newAppWorkspace.bind(), hyprland.bind("workspaces")], (newWorkspace, workspaces) =>
    {
        return workspaces.sort((a, b) => a.id - b.id) // Sort workspaces by id
            .map(({ id }) =>
            {
                return Widget.Button<any>({
                    on_clicked: () => hyprland.messageAsync(id == -99 ? `dispatch togglespecialworkspace` : `dispatch workspace ${id}`).catch(err => print(err)),
                    child: id < 0 ? Widget.Icon("view-grid-symbolic") : Widget.Label({ class_name: 'icon', label: workspaceToIcon[id] }),
                    class_name: activeId.as((i) =>
                    {
                        let class_name: string = "";

                        // Determine if the current ID is focused
                        const isFocused = i == id;
                        const isPreviousFocused = i == previousId;

                        if (isFocused) {
                            class_name = previousId !== i ? "focused" : "same-focused";
                            previousId = i; // Update previousId only if focused
                        }

                        // Add new-app class if applicable
                        if (newWorkspace == id) {
                            class_name += " new-app";
                        }

                        // Reset newAppWorkspace if needed
                        if (newWorkspace == i) {
                            newAppWorkspace.value = 0;
                        }

                        return class_name;
                    }),

                });
            })
    })

    return Widget.Box({
        class_name: "workspaces",
        spacing: 5,
        children: workspaces,
    });
}

function AppLauncher()
{
    return Widget.ToggleButton({
        child: Widget.Icon("preferences-system-search-symbolic"),
        class_name: "app-search",
        on_toggled: ({ active }) => active ? App.openWindow("app-launcher") : App.closeWindow("app-launcher"),
    });
}

export function Left()
{
    return Widget.Box({
        class_name: "bar-left",
        spacing: 10,
        children: [AppLauncher(), Workspaces()]
    });
}