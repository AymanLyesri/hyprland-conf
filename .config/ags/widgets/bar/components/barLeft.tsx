import { App } from "astal/gtk3";
import {
  focusedWorkspace,
  newAppWorkspace,
  settingsVisibility,
  userPanelVisibility,
} from "../../../variables";

import hyprland from "gi://AstalHyprland";
import { bind, Variable } from "astal";
import ToggleButton from "../../toggleButton";
const Hyprland = hyprland.get_default();

function Workspaces() {
  let previousWorkspace: number = 0; // Variable to store the previous workspace ID

  // Add the "." icon for empty workspaces
  const workspaceToIcon = [
    "󰻃",
    "",
    "",
    "",
    "",
    "",
    "󰙯",
    "󰓓",
    "",
    "",
    "",
  ];
  const emptyIcon = ""; // Icon for empty workspaces
  const extraWorkspaceIcon = ""; // Icon for workspaces beyond the maximum limit
  const maxWorkspaces = 10; // Maximum number of workspaces to display with custom icons

  const workspaces = Variable.derive(
    [
      // bind(newAppWorkspace, "value"),
      bind(Hyprland, "workspaces"),
      focusedWorkspace.as((workspace) => workspace.id),
    ],
    (workspaces, currentWorkspace) => {
      print("workspaces", workspaces.length);
      print("currentWorkspace", currentWorkspace);
      // Get the IDs of active workspaces and fill in empty slots
      const workspaceIds = workspaces.map((w) => w.id);
      const totalWorkspaces = Math.max(...workspaceIds, maxWorkspaces); // Get the total number of workspaces, accounting for more than 10
      const allWorkspaces = Array.from(
        { length: totalWorkspaces },
        (_, i) => i + 1
      ); // Create all workspace slots from 1 to totalWorkspaces

      let inActiveGroup = false; // Flag to track if we're in an active group
      let previousWorkspace_ = currentWorkspace; // Store the previous workspace ID

      const results = allWorkspaces.map((id) => {
        const isActive = workspaceIds.includes(id); // Check if this workspace ID is active
        const icon =
          id > maxWorkspaces
            ? extraWorkspaceIcon
            : isActive
            ? workspaceToIcon[id]
            : emptyIcon; // Icon for extra workspaces beyond 10
        const isFocused = currentWorkspace == id; // Determine if the current ID is focused

        let class_names: string[] = ["button"]; // Default class names

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

        return (
          <button
            className={class_names.join(" ")}
            label={icon}
            onClicked={() => {
              print(`dispatch workspace ${id}`);
              Hyprland.message_async(`dispatch workspace ${id}`, (res) =>
                print(res)
              );
            }}
          />
        );
      });

      results.unshift(
        <button
          className="special"
          label={workspaceToIcon[0]}
          onClicked={
            () =>
              Hyprland.message_async(`dispatch togglespecialworkspace`, (res) =>
                print(res)
              )
            // .catch((err) => print(err))
          }
        />
      );

      previousWorkspace = previousWorkspace_;
      return results;
    }
  );

  return <box className="workspaces">{bind(workspaces)}</box>;
}

function AppLauncher() {
  return (
    <ToggleButton
      className="app-search"
      label=""
      onToggled={(self, on) => App.toggle_window("app-launcher")}
    />
  );
}

function OverView() {
  return (
    <button
      className="overview"
      label="󱗼"
      onClicked={() =>
        Hyprland.message_async("dispatch hyprexpo:expo toggle", (res) =>
          print(res)
        )
      }
    />
  );
}

function Settings() {
  return (
    <ToggleButton
      className="settings"
      label=""
      onToggled={(self, on) => settingsVisibility.set(on)}
    />
  );
}

function UserPanel() {
  return (
    <ToggleButton
      className="user-panel"
      label=""
      onToggled={(self, on) => userPanelVisibility.set(on)}
    />
  );
}

const Actions = () => {
  return (
    <box className="actions">
      <UserPanel />
      <Settings />
      <AppLauncher />
    </box>
  );
};

export default () => {
  return (
    <box className="bar-left" spacing={5}>
      <Actions />
      <OverView />
      <Workspaces />
    </box>
  );
};
