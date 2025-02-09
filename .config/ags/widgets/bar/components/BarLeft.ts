import { newAppWorkspace, settingsVisibility, userPanelVisibility } from "variables";

const hyprland = await Service.import("hyprland");
function Workspaces()
{
    let previousWorkspace: number = 0; // Variable to store the previous workspace ID

    // Icons for workspaces
    const workspaceToIcon = ["󰻃", "", "", "", "", "", "󰙯", "󰓓", "", "", ""];
    const emptyIcon = ""; // Icon for empty workspaces
    const extraWorkspaceIcon = ""; // Icon for workspaces beyond the maximum limit
    const maxWorkspaces = 10; // Maximum number of workspaces to display with custom icons

    // Merge data sources: new app workspace, active workspaces, and current workspace ID
    const workspaces = Utils.merge(
        [newAppWorkspace.bind(), hyprland.bind("workspaces"), hyprland.active.workspace.bind("id")],
        (newWorkspace, workspaces, currentWorkspace) =>
        {
            // Get the IDs of active workspaces
            const workspaceIds = workspaces.map((w) => w.id);
            // Determine the total number of workspaces, ensuring it accounts for more than the maximum limit
            const totalWorkspaces = Math.max(...workspaceIds, maxWorkspaces);
            // Create an array representing all workspace slots from 1 to totalWorkspaces
            const allWorkspaces = Array.from({ length: totalWorkspaces }, (_, i) => i + 1);

            let inActiveGroup = false; // Flag to track if we're in an active group of workspaces
            let previousWorkspace_ = currentWorkspace; // Store the current workspace ID for comparison

            // Map each workspace slot to a button widget
            const results = allWorkspaces.map((id) =>
            {
                const isActive = workspaceIds.includes(id); // Check if the workspace is active
                const icon = id > maxWorkspaces ? extraWorkspaceIcon : (isActive ? workspaceToIcon[id] : emptyIcon); // Determine the icon for the workspace
                const isFocused = currentWorkspace == id; // Check if the workspace is currently focused

                let class_names: string[] = ["button"]; // Default class names for the workspace button

                // Handle focused workspace
                if (isFocused) {
                    if (previousWorkspace !== currentWorkspace) {
                        // Workspace has changed, mark it as `focused`
                        class_names.push("focused");
                    } else {
                        // Same workspace remains focused, mark it as `same-focused`
                        class_names.push("same-focused");
                    }
                    // Update the previous workspace ID
                    previousWorkspace_ = currentWorkspace;
                } else {
                    // Add `unfocused` class if the workspace was previously focused
                    if (id == previousWorkspace) {
                        class_names.push("unfocused");
                    }
                }

                // Handle active groups of workspaces
                if (isActive) {
                    if (!inActiveGroup) {
                        if (workspaceIds.includes(id + 1)) {
                            class_names.push("first"); // First workspace in an active group
                            inActiveGroup = true; // Set the flag to indicate we're in an active group
                        } else {
                            class_names.push("only"); // Only workspace in an active group
                        }
                    } else {
                        if (workspaceIds.includes(id + 1)) {
                            class_names.push("between"); // Workspace between two active workspaces
                        } else {
                            class_names.push("last"); // Last workspace in an active group
                            inActiveGroup = false; // Reset the flag
                        }
                    }
                } else {
                    class_names.push("inactive"); // Workspace is inactive
                }

                // Add `new-app` class if a new app has been added to this workspace
                if (newWorkspace == id) {
                    class_names.push("new-app");
                }

                // Reset newAppWorkspace if the new app is added to the current workspace
                if (newWorkspace == currentWorkspace) {
                    newAppWorkspace.value = 0;
                }

                // Create a button widget for the workspace
                return Widget.Button({
                    on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`).catch((err) => print(err)), // Switch to this workspace on click
                    child: Widget.Label({ class_name: "icon", label: icon }), // Display the workspace icon
                    class_names: class_names, // Apply the computed class names
                });
            });

            // Add a special button for the special workspace (e.g., togglespecialworkspace)
            results.unshift(Widget.Button({
                class_name: "special",
                on_clicked: () => hyprland.messageAsync(`dispatch togglespecialworkspace`).catch((err) => print(err)),
                child: Widget.Label({
                    label: workspaceToIcon[0], // Use the first icon for the special workspace
                }),
            }));

            // Update the previous workspace ID for the next iteration
            previousWorkspace = previousWorkspace_;
            return results;
        }
    );

    // Return a box containing all workspace buttons
    return Widget.Box({
        class_name: "workspaces",
        children: workspaces,
    });
}

function AppLauncher()
{
    return Widget.ToggleButton({
        child: Widget.Label(""),
        class_name: "app-search",
        on_toggled: ({ active }) => active ? App.openWindow("app-launcher") : App.closeWindow("app-launcher"),
    });
}

function OverView()
{
    return Widget.Button({
        child: Widget.Label("󱗼"),
        class_name: "overview",
        on_clicked: () => hyprland.sendMessage("dispatch hyprexpo:expo").catch((err) => print(err)),
    });
}

function Settings()
{
    return Widget.ToggleButton({
        child: Widget.Label(""),
        class_name: "settings",
        on_toggled: ({ active }) => settingsVisibility.value = active,
    }).hook(settingsVisibility, (self) => self.active = settingsVisibility.value, "changed");
}

function UserPanel()
{
    return Widget.ToggleButton({
        child: Widget.Label(""),
        class_name: "user-panel",
        on_toggled: ({ active }) => userPanelVisibility.value = active,
    }).hook(userPanelVisibility, (self) => self.active = userPanelVisibility.value, "changed");
}

const Actions = () =>
{

    return Widget.Box({
        class_name: "actions",
        children: [UserPanel(), Settings(), AppLauncher()]
    })
}

export default () =>
{
    return Widget.Box({
        class_name: "bar-left",
        spacing: 5,
        children: [Actions(), OverView(), Workspaces()]
    });
}