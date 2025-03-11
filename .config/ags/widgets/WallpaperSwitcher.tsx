import hyprland from "gi://AstalHyprland";
import { bind, exec, execAsync, monitorFile, Variable } from "astal";
import { App, Gtk } from "astal/gtk3";
import { notify } from "../utils/notification";
import { focusedClient, globalTransition } from "../variables";
import ToggleButton from "./toggleButton";
import { Button } from "astal/gtk3/widget";
const Hyprland = hyprland.get_default();

const selectedWorkspace = Variable<number>(0);
const selectedWorkspaceWidget = Variable<Button>(new Button());
const sddm = Variable<boolean>(false);
const customWallpapers = Variable<boolean>(false);
const allWallpapers = Variable<string[]>(
  JSON.parse(exec(`bash ./scripts/get-wallpapers.sh --all`))
);

const FetchWallpapers = () => {
  allWallpapers.set(
    JSON.parse(
      exec(
        `bash ./scripts/get-wallpapers.sh ${
          customWallpapers.get() ? "--custom" : "--all"
        }`
      )
    )
  );
};

monitorFile(`./../wallpapers/custom`, () => {
  if (customWallpapers.get()) FetchWallpapers();
});

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
            {bind(allWallpapers).as((wallpapers) =>
              wallpapers.map((wallpaper, key) => (
                <button
                  className="wallpaper"
                  css={`
                    background-image: url("${wallpaper}");
                  `}
                  onClick={(self) => {
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
                            exec(`bash ./scripts/get-wallpapers.sh --current`)
                          )[selectedWorkspace.get() - 1];
                          selectedWorkspaceWidget.get().css = `background-image: url('${new_wallpaper}');`;
                        })
                        .catch((err) => notify(err));
                    }
                  }}
                />
              ))
            )}
          </box>
        }></scrollable>
    );
  };

  const getWallpapers = () => {
    const activeId = focusedClient.as((client) => client.workspace.id);

    const wallpapers: any[] = JSON.parse(
      exec(`bash ./scripts/get-wallpapers.sh --current`)
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
          onClick={(self, event) => {
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
      onClick={() => {
        execAsync(`bash -c "$HOME/.config/hypr/hyprpaper/reload.sh"`)
          .finally(() => {
            allWallpapers.set(
              JSON.parse(exec(`bash ./scripts/get-wallpapers.sh --all`))
            );
          })
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
      onClick={() => {
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
            // top.children[
            //   selectedWorkspace.get() - 1
            // ].css = `background-image: url('${new_wallpaper}');`;
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
        customWallpapers.set(on);
        FetchWallpapers();
        self.label = on ? "custom" : "all";
      }}
    />
  );

  const hide = (
    <button
      valign={Gtk.Align.CENTER}
      className="stop-selection"
      label=""
      onClick={() => {
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
      className="button"
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
      child={
        <box vertical={true}>
          {actions}
          {getAllWallpapers()}
        </box>
      }
    />
  );

  const bottom = (
    <box
      hexpand={true}
      vexpand={true}
      spacing={10}
      child={bottomRevealer}></box>
  );

  return (
    <box className="wallpaper-switcher" vertical={true}>
      {top}
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
