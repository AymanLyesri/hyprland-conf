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

let defaultWallpapers: string[];
let defaultThumbnails: string[];

let customWallpapers: string[];
let customThumbnails: string[];

const allWallpapers = Variable<string[]>([]);
const allThumbnails = Variable<string[]>([]);

const shuffleArraysTogether = (
  arr1: string[],
  arr2: string[]
): [string[], string[]] => {
  const length = Math.min(arr1.length, arr2.length); // Ensures equal length

  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    // Swap in both arrays
    [arr1[i], arr1[j]] = [arr1[j], arr1[i]];
    [arr2[i], arr2[j]] = [arr2[j], arr2[i]];
  }

  return [arr1, arr2];
};

const FetchWallpapers = async () => {
  Promise.all([
    execAsync(`bash ./scripts/wallpaper-to-thumbnail.sh`).then(() => {
      defaultThumbnails = JSON.parse(
        exec(`bash ./scripts/get-wallpapers-thumbnails.sh --defaults`)
      );
      customThumbnails = JSON.parse(
        exec(`bash ./scripts/get-wallpapers-thumbnails.sh --custom`)
      );
    }),
    execAsync(`bash ./scripts/get-wallpapers.sh --defaults`)
      .then((wallpapers) => {
        defaultWallpapers = JSON.parse(wallpapers);
      })
      .catch((err) => notify(err)),
    execAsync(`bash ./scripts/get-wallpapers.sh --custom`)
      .then((wallpapers) => {
        customWallpapers = JSON.parse(wallpapers);
      })
      .catch((err) => notify(err)),
  ]).then(() => {
    print("fetch complete");
    if (wallpaperType.get()) {
      allWallpapers.set(customWallpapers);
      allThumbnails.set(customThumbnails);
    } else {
      const mergedWallpapers = [...defaultWallpapers, ...customWallpapers];
      const mergedThumbnails = [...defaultThumbnails, ...customThumbnails];

      const [shuffledWallpapers, shuffledThumbnails] = shuffleArraysTogether(
        mergedWallpapers,
        mergedThumbnails
      );

      allWallpapers.set(shuffledWallpapers);
      allThumbnails.set(shuffledThumbnails);
    }
  });
};

FetchWallpapers();

monitorFile(`./../wallpapers/custom`, () => {
  FetchWallpapers();
});

wallpaperType.subscribe(() => FetchWallpapers());

function Wallpapers(monitor: string) {
  const getAllWallpapers = () => {
    return (
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
                      onClicked={(self) => {
                        if (targetType.get() === "sddm") {
                          execAsync(
                            `pkexec sh -c 'sed -i "s|^background=.*|background=\"${wallpaper}\"|" /usr/share/sddm/themes/where_is_my_sddm_theme/theme.conf'`
                          )
                            // .then(() => sddm.set(false))
                            .finally(() =>
                              notify({
                                summary: "SDDM",
                                body: "SDDM wallpaper changed successfully!",
                              })
                            )
                            .catch((err) => notify(err));
                          hideWindow(`wallpaper-switcher-${monitor}`);
                        } else if (targetType.get() === "lockscreen") {
                          execAsync(
                            `bash -c "cp ${wallpaper} $HOME/.config/wallpapers/lockscreen/wallpaper"`
                          )
                            // .then(() => lockScreen.set(false))
                            .finally(() =>
                              notify({
                                summary: "Lock Screen",
                                body: "Lock Screen wallpaper changed successfully!",
                              })
                            )
                            .catch((err) => notify(err));
                        } else {
                          execAsync(
                            `bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspace.get()} ${wallpaper} ${monitor}"`
                          )
                            .finally(() => {
                              selectedWorkspaceWidget.get().css = `background-image: url('${wallpaper}');`;
                            })
                            .catch((err) => notify(err));
                        }
                      }}
                    />
                  ))
              )
            )}
          </box>
        }></scrollable>
    );
  };

  const getWallpapers = () => {
    const activeId = focusedWorkspace.as((workspace) => workspace.id || 1);

    print(`bash ./scripts/get-wallpapers.sh --current ${monitor}`);

    const wallpapers: [] = JSON.parse(
      exec(`bash ./scripts/get-wallpapers.sh --current ${monitor}`) || "[]"
    );

    return wallpapers.map((wallpaper, key) => {
      key += 1;

      return (
        <button
          valign={Gtk.Align.CENTER}
          css={`
            background-image: url("${wallpaper}");
          `}
          className={activeId.as((i) => {
            selectedWorkspace.set(i);
            targetType.set("workspace");
            return `${
              i == key ? "workspace-wallpaper focused" : "workspace-wallpaper"
            }`;
          })}
          label={`${key}`}
          onClicked={(self) => {
            targetType.set("workspace");
            bottomRevealer.reveal_child = true;
            selectedWorkspace.set(key);
            selectedWorkspaceWidget.set(self);
          }}
          setup={(self) => {
            activeId.as((i) => {
              if (i === key) {
                selectedWorkspace.set(key);
                selectedWorkspaceWidget.set(self);
              }
            });
          }}
        />
      );
    });
  };

  const reset = (
    <button
      valign={Gtk.Align.CENTER}
      className="reload-wallpapers"
      label="󰑐"
      onClicked={() => {
        execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/reload.sh"`)
          .finally(() => FetchWallpapers())
          .catch((err) => print(err));
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
          .finally(() => {
            const new_wallpaper = JSON.parse(
              exec(`bash ./scripts/get-wallpapers.sh --current ${monitor}`)
            )[selectedWorkspace.get() - 1];
            selectedWorkspaceWidget.get().css = `background-image: url('${new_wallpaper}');`;
          })
          .catch((err) => notify(err));
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
              targetType == "workspace" ? workspace : ""
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
  return (
    <window
      gdkmonitor={monitor}
      namespace="wallpaper-switcher"
      name={`wallpaper-switcher-${getMonitorName(
        monitor.get_display(),
        monitor
      )}`}
      application={App}
      visible={false}
      child={Wallpapers(getMonitorName(monitor.get_display(), monitor)!)}
    />
  );
};
