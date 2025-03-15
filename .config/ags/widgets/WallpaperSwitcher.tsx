import hyprland from "gi://AstalHyprland";
import { bind, exec, execAsync, monitorFile, Variable } from "astal";
import { App, Gtk } from "astal/gtk3";
import { notify } from "../utils/notification";
import {
  focusedClient,
  focusedWorkspace,
  globalTransition,
} from "../variables";
import ToggleButton from "./toggleButton";
import { Button } from "astal/gtk3/widget";
const Hyprland = hyprland.get_default();

const selectedWorkspace = Variable<number>(0);
const selectedWorkspaceWidget = Variable<Button>(new Button());

const sddm = Variable<boolean>(false);
const wallpaperType = Variable<boolean>(false);

const allWallpapers = Variable<string[]>([]);
const allThumbnails = Variable<string[]>([]);

const FetchWallpapers = () => {
  execAsync(`bash ./scripts/wallpaper-to-thumbnail.sh`).then(() => {
    execAsync(
      `bash ./scripts/get-wallpapers.sh ${
        wallpaperType.get() ? "--custom" : "--all"
      }`
    )
      .then((wallpapers) => {
        allWallpapers.set(JSON.parse(wallpapers));
      })
      .catch((err) => notify(err));
    execAsync(
      `bash ./scripts/get-wallpapers-thumbnails.sh ${
        wallpaperType.get() ? "--custom" : "--all"
      }`
    )
      .then((wallpapers) => {
        allThumbnails.set(JSON.parse(wallpapers));
      })
      .catch((err) => notify(err));
  });
};

FetchWallpapers();

monitorFile(`./../wallpapers/default`, () => {
  FetchWallpapers();
});

monitorFile(`./../wallpapers/custom`, () => {
  FetchWallpapers();
});

wallpaperType.subscribe(() => FetchWallpapers());

function Wallpapers() {
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
                        if (sddm.get()) {
                          execAsync(
                            `pkexec sh -c 'sed -i "s|^background=.*|background=\"${wallpaper}\"|" /usr/share/sddm/themes/where_is_my_sddm_theme/theme.conf'`
                          )
                            .then(() => sddm.set(false))
                            .finally(() =>
                              notify({
                                summary: "SDDMs",
                                body: "SDDM wallpaper changed successfully!",
                              })
                            )
                            .catch((err) => notify(err));
                          App.toggle_window("wallpaper-switcher");
                        } else {
                          execAsync(
                            `bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspace.get()} ${wallpaper}"`
                          )
                            .finally(() => {
                              const new_wallpaper = JSON.parse(
                                exec(
                                  `bash ./scripts/get-wallpapers.sh --current`
                                )
                              )[selectedWorkspace.get() - 1];
                              selectedWorkspaceWidget.get().css = `background-image: url('${new_wallpaper}');`;
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

    const wallpapers: [] = JSON.parse(
      exec(`bash ./scripts/get-wallpapers.sh --current`) || "[]"
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
            return `${
              i == key ? "workspace-wallpaper focused" : "workspace-wallpaper"
            }`;
          })}
          label={`${key}`}
          onClicked={(self) => {
            sddm.set(false);
            bottomRevealer.reveal_child = true;
            selectedWorkspace.set(key);
            selectedWorkspaceWidget.set(self);
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
          `bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspace.get()} ${randomWallpaper}"`
        )
          .finally(() => {
            const new_wallpaper = JSON.parse(
              exec(`bash ./scripts/get-wallpapers.sh --current`)
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

  const hide = (
    <button
      valign={Gtk.Align.CENTER}
      className="stop-selection"
      label=""
      onClicked={() => {
        bottomRevealer.reveal_child = false;
      }}
    />
  );

  const sddmToggle = (
    <ToggleButton
      valign={Gtk.Align.CENTER}
      className="sddm"
      label="sddm"
      state={bind(sddm)}
      onToggled={(self, on) => {
        sddm.set(on);
      }}
    />
  );

  const selectedWorkspaceLabel = (
    <label
      className="button selected-workspace"
      label={bind(
        Variable.derive(
          [bind(selectedWorkspace), bind(sddm)],
          (workspace, sddm) =>
            `Wallpaper -> ${sddm ? "sddm" : `Workspace ${workspace}`}`
        )
      )}
    />
  );

  const actions = (
    <box className="actions" hexpand={true} halign={Gtk.Align.CENTER}>
      {sddmToggle}
      {selectedWorkspaceLabel}
      {random}
      {custom}
      {hide}
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

export default () => {
  return (
    <window
      name="wallpaper-switcher"
      namespace="wallpaper-switcher"
      application={App}
      visible={false}
      child={Wallpapers()}
    />
  );
};
