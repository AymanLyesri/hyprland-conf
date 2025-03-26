import { bind, exec, execAsync, Variable } from "astal";
import {
  waifuApi,
  globalSettings,
  globalTransition,
  rightPanelWidth,
  waifuCurrent,
  waifuFavorites,
} from "../../../variables";
import { Gtk } from "astal/gtk3";
import ToggleButton from "../../toggleButton";
import { getSetting, setSetting } from "../../../utils/settings";
import { notify } from "../../../utils/notification";

import { closeProgress, openProgress } from "../../Progress";
import { Api } from "../../../interfaces/api.interface";
import { readJSONFile } from "../../../utils/json";

import hyprland from "gi://AstalHyprland";
const Hyprland = hyprland.get_default();

const waifuPath = "./assets/booru/waifu/waifu.webp";
const jsonPath = "./assets/booru/waifu/waifu.json";

const apiList: Api[] = [
  {
    name: "Danbooru",
    value: "danbooru",
    idSearchUrl: "https://danbooru.donmai.us/posts/",
  },
  {
    name: "Gelbooru",
    value: "gelbooru",
    idSearchUrl: "https://gelbooru.com/index.php?page=post&s=view&id=",
  },
];

const nsfw = Variable<boolean>(false);
nsfw.subscribe((value) =>
  notify({ summary: "Waifu", body: `NSFW is ${value ? "on" : "off"}` })
);
const terminalWaifuPath = `./assets/terminal/icon.jpg`;

const GetImageFromApi = (param = "", api: Api = {} as Api) => {
  openProgress();

  let apiValue = api.value ?? waifuApi.get().value;
  execAsync(
    `python ./scripts/get-waifu.py ${apiValue} ${nsfw.get()} "${param}"`
  )
    .finally(() => {
      closeProgress();
      let imageDetails = readJSONFile(jsonPath);
      waifuCurrent.set({
        id: imageDetails.id,
        preview: imageDetails.preview_file_url ?? imageDetails.preview_url,
        height: imageDetails.image_height ?? imageDetails.height,
        width: imageDetails.image_width ?? imageDetails.width,
        api: waifuApi.get(),
      });
    })
    .catch((error) => notify({ summary: "Error", body: error }));
};

const OpenInBrowser = () =>
  execAsync(
    `bash -c "xdg-open '${waifuApi.get().idSearchUrl}${
      waifuCurrent.get().id
    }' && xdg-settings get default-web-browser | sed 's/\.desktop$//'"`
  )
    .then((browser) =>
      notify({ summary: "Waifu", body: `opened in ${browser}` })
    )
    .catch((err) => notify({ summary: "Error", body: err }));

const CopyImage = () =>
  execAsync(`bash -c "wl-copy --type image/png < ${waifuPath}"`).catch((err) =>
    notify({ summary: "Error", body: err })
  );

const OpenImage = () =>
  Hyprland.message_async(
    `dispatch exec [float;size 50%] feh --scale-down $HOME/.config/ags/${waifuPath}`,
    (res) => {
      notify({ summary: "Waifu", body: waifuPath });
    }
  );

const PinImageToTerminal = () => {
  execAsync(
    `bash -c "cmp -s ${waifuPath} ${terminalWaifuPath} && { rm ${terminalWaifuPath}; echo 1; } || { cp ${waifuPath} ${terminalWaifuPath}; echo 0; }"`
  )
    .then((output) =>
      notify({
        summary: "Waifu",
        body: `${
          Number(output) == 0 ? "Pinned To Terminal" : "UN-Pinned from Terminal"
        }`,
      })
    )
    .catch((err) => notify({ summary: "Error", body: err }));
};

function Actions() {
  const top = (
    <box
      className="top"
      child={
        <button
          label=""
          className="pin"
          onClicked={() => PinImageToTerminal()}
        />
      }></box>
  );

  const Entry = (
    <entry
      className="input"
      placeholderText="Tags / ID"
      text={getSetting("waifu.input_history")}
      onActivate={(self) => {
        setSetting("waifu.input_history", self.text);
        GetImageFromApi(self.text);
      }}
    />
  );

  const actions = (
    <revealer
      revealChild={false}
      transitionDuration={globalTransition}
      transition_type={Gtk.RevealerTransitionType.SLIDE_UP}
      child={
        <box vertical>
          <box>
            <button label="" className="open" hexpand onClicked={OpenImage} />
            <button
              label=""
              hexpand
              className="browser"
              onClicked={() => OpenInBrowser()}
            />
            <button label="" hexpand className="copy" onClicked={CopyImage} />
          </box>
          <box>
            <button
              hexpand
              label=""
              className="entry-search"
              onClicked={() => Entry.activate()}
            />
            {Entry}
            <button
              hexpand
              label={""}
              className={"upload"}
              onClicked={() => {
                let dialog = new Gtk.FileChooserDialog({
                  title: "Open Image",
                  action: Gtk.FileChooserAction.OPEN,
                });
                dialog.add_button("Open", Gtk.ResponseType.OK);
                dialog.add_button("Cancel", Gtk.ResponseType.CANCEL);
                let response = dialog.run();
                if (response == Gtk.ResponseType.OK) {
                  let filename = dialog.get_filename();
                  let [height, width] = exec(
                    `identify -format "%h %w" ${filename}`
                  ).split(" ");
                  execAsync(`cp ${filename} ${waifuPath}`)
                    .then(() =>
                      waifuCurrent.set({
                        id: 0,
                        preview: waifuPath,
                        height: Number(height) ?? 0,
                        width: Number(width) ?? 0,
                        api: {} as Api,
                        url_path: waifuCurrent.get().url_path,
                      })
                    )
                    .finally(() =>
                      notify({
                        summary: "Waifu",
                        body: "Custom image set",
                      })
                    )
                    .catch((err) => notify({ summary: "Error", body: err }));
                }
                dialog.destroy();
              }}
            />
          </box>
          <box>
            {apiList.map((api) => (
              <ToggleButton
                hexpand
                className={"api"}
                label={api.name}
                state={bind(waifuApi).as(
                  (current) => current.value === api.value
                )}
                onToggled={(self, on) => waifuApi.set(api)}
              />
            ))}
          </box>
        </box>
      }></revealer>
  );

  const bottom = (
    <box className="bottom" vertical vexpand valign={Gtk.Align.END}>
      {
        <ToggleButton
          label=""
          className="action-trigger"
          halign={Gtk.Align.END}
          onToggled={(self, on) => {
            actions.reveal_child = on;
            self.label = on ? "" : "";
            actions.reveal_child = on;
          }}
        />
      }
      {actions}
    </box>
  );

  return (
    <box className="actions" vertical>
      {top}
      {bottom}
    </box>
  );
}

function Image() {
  return (
    <eventbox
      // onClicked={OpenInBrowser}
      child={
        <box
          className="image"
          hexpand={false}
          vexpand={false}
          css={bind(
            Variable.derive(
              [bind(waifuCurrent), bind(rightPanelWidth)],
              (waifuCurrent, width) => {
                return `
                    background-image: url("${waifuCurrent.url_path}");
                    min-height: ${
                      (Number(waifuCurrent.height) /
                        Number(waifuCurrent.width)) *
                      width
                    }px;
                    `;
              }
            )
          )}
          child={Actions()}></box>
      }></eventbox>
  );
}

export default () => {
  return (
    <revealer
      transitionDuration={globalTransition}
      transition_type={Gtk.RevealerTransitionType.SLIDE_DOWN}
      revealChild={globalSettings.get().waifu.visibility}
      child={
        <eventbox
          className="waifu-event"
          child={
            <box className="waifu" vertical child={Image()}></box>
          }></eventbox>
      }></revealer>
  );
};

export function WaifuVisibility() {
  return ToggleButton({
    state: bind(globalSettings).as((s) => s.waifu.visibility),
    onToggled: (self, on) => setSetting("waifu.visibility", on),
    label: "󱙣",
    className: "waifu icon",
  });
}
