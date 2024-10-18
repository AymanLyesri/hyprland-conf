import { newAppWorkspace } from "variables";

const hyprland = await Service.import("hyprland");

function Workspaces()
{
    let previousWorkspace: number = 0; // Variable to store the previous workspace ID

    // Add the "." icon for empty workspaces
    const workspaceToIcon = ["", "", "", "", "", "", "󰙯", "󰓓", "", "", ""];
    const emptyIcon = ""; // Icon for empty workspaces
    const extraWorkspaceIcon = ""; // Icon for workspaces after 10
    const maxWorkspaces = 10; // Set the maximum number of workspaces

    const workspaces = Utils.merge(
        [newAppWorkspace.bind(), hyprland.bind("workspaces"), hyprland.active.workspace.bind("id")],
        (newWorkspace, workspaces, currentWorkspace) =>
        {
            // Get the IDs of active workspaces and fill in empty slots
            const workspaceIds = workspaces.map((w) => w.id);
            const totalWorkspaces = Math.max(...workspaceIds, maxWorkspaces); // Get the total number of workspaces, accounting for more than 10
            const allWorkspaces = Array.from({ length: totalWorkspaces }, (_, i) => i + 1); // Create all workspace slots from 1 to totalWorkspaces

            let inActiveGroup = false; // Flag to track if we're in an active group
            let previousWorkspace_ = currentWorkspace; // Store the previous workspace ID

            const results = allWorkspaces.map((id) =>
            {
                const isActive = workspaceIds.includes(id); // Check if this workspace ID is active
                const icon = id > maxWorkspaces ? extraWorkspaceIcon : (isActive ? workspaceToIcon[id] : emptyIcon); // Icon for extra workspaces beyond 10
                const isFocused = currentWorkspace == id; // Determine if the current ID is focused

                let class_names: string[] = ["button"]; // Default class names

                if (isFocused) {
                    if (previousWorkspace !== currentWorkspace) {
                        // Workspace has changed, so mark it as `focused`
                        class_names.push("focused");
                    } else {
                        // Same workspace remains focused, mark as `same-focused`
                        class_names.push("same-focused");
                    }
                    // Update the `previousWorkspace` to reflect the current one
                    previousWorkspace_ = currentWorkspace;
                } else {
                    // Add the `unfocused` class if the workspace was previously focused
                    if (id == previousWorkspace) {
                        class_names.push("unfocused");
                    }
                }

                // Handle active groups
                if (isActive) {
                    if (!inActiveGroup) {
                        if (workspaceIds.includes(id + 1)) {
                            class_names.push("first");
                            inActiveGroup = true; // Set the flag to indicate we're in an active group
                        } else {
                            class_names.push("only");
                        }
                    } else {
                        if (workspaceIds.includes(id + 1)) {
                            class_names.push("between");
                        } else {
                            class_names.push("last");
                            inActiveGroup = false;
                        }
                    }
                } else {
                    class_names.push("inactive");
                }

                // Add new-app class if applicable
                if (newWorkspace == id) {
                    class_names.push("new-app");
                }

                // Reset newAppWorkspace if needed
                if (newWorkspace == currentWorkspace) {
                    newAppWorkspace.value = 0;
                }

                return Widget.Button({
                    on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`).catch((err) => print(err)),
                    child: Widget.Label({ class_name: "icon", label: icon }), // Show icon for workspace
                    class_names: class_names,
                });
            });

            results.unshift(Widget.Button({
                class_name: "special",
                on_clicked: () => hyprland.messageAsync(`dispatch togglespecialworkspace`).catch((err) => print(err)),
                child: Widget.Label({
                    label: workspaceToIcon[0],
                }),
            }));

            previousWorkspace = previousWorkspace_;
            return results;
        }
    );

    return Widget.Box({
        class_name: "workspaces",
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