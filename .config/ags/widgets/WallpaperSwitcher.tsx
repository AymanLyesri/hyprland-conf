import hyprland from "gi://AstalHyprland";
import { bind, exec, execAsync, monitorFile, Variable } from "astal";
import { App, Gdk, Gtk } from "astal/gtk3";
import { notify } from "../utils/notification";
import { focusedWorkspace, globalTransition } from "../variables";
import ToggleButton from "./toggleButton";
import { Button } from "astal/gtk3/widget";
import { getMonitorName } from "../utils/monitor";
import { hideWindow } from "../utils/window";

const Hyprland = hyprland.get_default();

const selectedWorkspace = Variable<number>(0);
const selectedWorkspaceWidget = Variable<Button>(new Button());

const targetTypes = ["workspace", "sddm", "lockscreen"];
const targetType = Variable<string>("workspace");
const wallpaperType = Variable<boolean>(false);

let defaultWallpapers: string[] = [];
let defaultThumbnails: string[] = [];
let customWallpapers: string[] = [];
let customThumbnails: string[] = [];

const allWallpapers = Variable<string[]>([]);
const allThumbnails = Variable<string[]>([]);

const shuffleArraysTogether = (
  arr1: string[],
  arr2: string[]
): [string[], string[]] => {
  const combined = arr1.map((item, index) => ({ item, thumb: arr2[index] }));
  combined.sort(() => Math.random() - 0.5);
  return [combined.map((c) => c.item), combined.map((c) => c.thumb)];
};

const FetchWallpapers = async () => {
  try {
    await execAsync("bash ./scripts/wallpaper-to-thumbnail.sh");

    const [defaultThumbs, customThumbs, defaultWalls, customWalls] =
      await Promise.all([
        execAsync(
          "bash ./scripts/get-wallpapers-thumbnails.sh --defaults"
        ).then(JSON.parse),
        execAsync("bash ./scripts/get-wallpapers-thumbnails.sh --custom").then(
          JSON.parse
        ),
        execAsync("bash ./scripts/get-wallpapers.sh --defaults").then(
          JSON.parse
        ),
        execAsync("bash ./scripts/get-wallpapers.sh --custom").then(JSON.parse),
      ]);

    defaultThumbnails = defaultThumbs;
    customThumbnails = customThumbs;
    defaultWallpapers = defaultWalls;
    customWallpapers = customWalls;

    if (wallpaperType.get()) {
      allWallpapers.set(customWallpapers);
      allThumbnails.set(customThumbnails);
    } else {
      const [shuffledWallpapers, shuffledThumbnails] = shuffleArraysTogether(
        [...defaultWallpapers, ...customWallpapers],
        [...defaultThumbnails, ...customThumbnails]
      );
      allWallpapers.set(shuffledWallpapers);
      allThumbnails.set(shuffledThumbnails);
    }
  } catch (err) {
    notify({ summary: "Error", body: String(err) });
  }
};

FetchWallpapers();

monitorFile("./../wallpapers/custom", FetchWallpapers);
wallpaperType.subscribe(FetchWallpapers);

function Wallpapers(monitor: string) {
  const getAllWallpapers = () => (
    <scrollable
      className="all-wallpapers-scrollable"
      hscrollbarPolicy={Gtk.PolicyType.ALWAYS}
      vscrollbarPolicy={Gtk.PolicyType.NEVER}
      hexpand={true}
      vexpand={true}
      child={
        <box className="all-wallpapers" spacing={5}>
          {bind(
            Variable.derive(
              [bind(allWallpapers), bind(allThumbnails)],
              (allWallpapers, allThumbnails) =>
                allWallpapers.map((wallpaper, key) => (
                  <button
                    className="wallpaper"
                    css={`
                      background-image: url("${allThumbnails[key]}");
                    `}
                    onClicked={() => {
                      const target = targetType.get();
                      const command = {
                        sddm: `pkexec sh -c 'sed -i "s|^background=.*|background=\"${wallpaper}\"|" /usr/share/sddm/themes/where_is_my_sddm_theme/theme.conf'`,
                        lockscreen: `bash -c "cp ${wallpaper} $HOME/.config/wallpapers/lockscreen/wallpaper"`,
                        workspace: `bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspace.get()} ${wallpaper} ${monitor}"`,
                      }[target];

                      execAsync(command!)
                        .then(() => {
                          if (target === "workspace") {
                            selectedWorkspaceWidget.get().css = `background-image: url('${wallpaper}');`;
                          }
                          notify({
                            summary: target,
                            body: `${target} wallpaper changed successfully!`,
                          });
                        })
                        .catch(notify);
                      // hideWindow(`wallpaper-switcher-${monitor}`);
                    }}
                  />
                ))
            )
          )}
        </box>
      }
    />
  );

  const getWallpapers = () => {
    const activeId = focusedWorkspace.as((workspace) => workspace.id || 1);
    const wallpapers: string[] = JSON.parse(
      exec(`bash ./scripts/get-wallpapers.sh --current ${monitor}`) || "[]"
    );

    return wallpapers.map((wallpaper, key) => (
      <button
        valign={Gtk.Align.CENTER}
        css={`
          background-image: url("${wallpaper}");
        `}
        className={activeId.as((i) => {
          selectedWorkspace.set(i);
          targetType.set("workspace");
          return i === key + 1
            ? "workspace-wallpaper focused"
            : "workspace-wallpaper";
        })}
        label={`${key + 1}`}
        onClicked={(self) => {
          targetType.set("workspace");
          bottomRevealer.reveal_child = true;
          selectedWorkspace.set(key + 1);
          selectedWorkspaceWidget.set(self);
        }}
        setup={(self) => {
          activeId.as((i) => {
            if (i === key + 1) {
              selectedWorkspace.set(key + 1);
              selectedWorkspaceWidget.set(self);
            }
          });
        }}
      />
    ));
  };

  const reset = (
    <button
      valign={Gtk.Align.CENTER}
      className="reload-wallpapers"
      label="󰑐"
      onClicked={() => {
        execAsync('bash -c "$HOME/.config/hypr/hyprpaper/reload.sh"')
          .finally(FetchWallpapers)
          .catch(notify);
      }}
    />
  );

  const top = (
    <box hexpand={true} vexpand={true} halign={Gtk.Align.CENTER} spacing={10}>
      {[...getWallpapers(), reset]}
    </box>
  );

  const random = (
    <button
      valign={Gtk.Align.CENTER}
      className="random-wallpaper"
      label=""
      onClicked={() => {
        const randomWallpaper =
          allWallpapers.get()[
            Math.floor(Math.random() * allWallpapers.get().length)
          ];
        execAsync(
          `bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspace.get()} ${randomWallpaper} ${monitor}"`
        )
          .then(() => {
            const newWallpaper = JSON.parse(
              exec(`bash ./scripts/get-wallpapers.sh --current ${monitor}`)
            )[selectedWorkspace.get() - 1];
            selectedWorkspaceWidget.get().css = `background-image: url('${newWallpaper}');`;
          })
          .catch(notify);
      }}
    />
  );

  const custom = (
    <ToggleButton
      valign={Gtk.Align.CENTER}
      className="custom-wallpaper"
      label="all"
      onToggled={(self, on) => {
        wallpaperType.set(on);
        self.label = on ? "custom" : "all";
      }}
    />
  );

  const revealButton = (
    <ToggleButton
      className="bottom-revealer-button"
      label=""
      onToggled={(self, on) => {
        bottomRevealer.reveal_child = on;
        self.label = on ? "" : "";
      }}
    />
  );

  const targets = (
    <box className="targets" hexpand={true} halign={Gtk.Align.CENTER}>
      {targetTypes.map((type) => (
        <ToggleButton
          valign={Gtk.Align.CENTER}
          className={type}
          label={type}
          state={bind(targetType).as((t) => t === type)}
          onToggled={(self, on) => {
            targetType.set(type);
          }}
        />
      ))}
    </box>
  );

  const selectedWorkspaceLabel = (
    <label
      className="button selected-workspace"
      label={bind(
        Variable.derive(
          [bind(selectedWorkspace), bind(targetType)],
          (workspace, targetType) =>
            `Wallpaper -> ${targetType} ${
              targetType === "workspace" ? workspace : ""
            }`
        )
      )}
    />
  );

  const actions = (
    <box
      className="actions"
      hexpand={true}
      halign={Gtk.Align.CENTER}
      spacing={10}>
      {targets}
      {selectedWorkspaceLabel}
      {revealButton}
      {custom}
      {random}
    </box>
  );

  const bottomRevealer = (
    <revealer
      visible={true}
      reveal_child={false}
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transition_duration={globalTransition}
      child={<box vertical={true} child={getAllWallpapers()}></box>}
    />
  );

  const bottom = (
    <box hexpand={true} vexpand={true} child={bottomRevealer}></box>
  );

  return (
    <box className="wallpaper-switcher" vertical={true} spacing={20}>
      {top}
      {actions}
      {bottom}
    </box>
  );
}

export default (monitor: Gdk.Monitor) => {
  const monitorName = getMonitorName(monitor.get_display(), monitor)!;
  return (
    <window
      gdkmonitor={monitor}
      namespace="wallpaper-switcher"
      name={`wallpaper-switcher-${monitorName}`}
      application={App}
      visible={false}
      child={Wallpapers(monitorName)}
    />
  );
};
