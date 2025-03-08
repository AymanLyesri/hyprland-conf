import { bind, exec, execAsync, readFile, timeout, Variable } from "astal";
import { Waifu } from "../../../interfaces/waifu.interface";
import { readJSONFile } from "../../../utils/json";
import {
  globalSettings,
  globalTransition,
  rightPanelWidth,
  waifuCurrent,
  waifuFavorites,
} from "../../../variables";
import { Gtk } from "astal/gtk3";
import ToggleButton from "../../toggleButton";
import { EventBox } from "astal/gtk3/widget";
import { getSetting, setSetting } from "../../../utils/settings";
import { notify } from "../../../utils/notification";

import hyprland from "gi://AstalHyprland";
const Hyprland = hyprland.get_default();

const waifuPath = "./assets/waifu/waifu.png";
const jsonPath = "./assets/waifu/waifu.json";
const favoritesPath = "./assets/waifu/favorites/";

const imageDetails = Variable<Waifu>(readJSONFile(`./assets/waifu/waifu.json`));
const nsfw = Variable<boolean>(false);
const terminalWaifuPath = `./assets/terminal/icon.jpg`;

const GetImageFromApi = (param = "") => {
  // openProgress();
  execAsync(`python ./scripts/get-waifu.py ${nsfw.get()} "${param}"`)
    .finally(() => {
      // closeProgress();
      imageDetails.set(JSON.parse(readFile(`./assets/waifu/waifu.json`)));
      waifuCurrent.set({
        id: String(imageDetails.get().id),
        preview: String(imageDetails.get().preview_file_url),
      });
    })
    .catch((error) => notify({ summary: "Error", body: error }));
};

const SearchImage = () =>
  execAsync(
    `bash -c "xdg-open 'https://danbooru.donmai.us/posts/${
      imageDetails.get().id
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
    "dispatch exec [float;size 50%] feh --scale-down " + waifuPath
  ).catch((err) => notify({ summary: "Error", body: err }));

const addToFavorites = () => {
  if (!waifuFavorites.get().find((fav) => fav.id === waifuCurrent.get().id)) {
    execAsync(
      `bash -c "curl -o ${favoritesPath + waifuCurrent.get().id}.jpg ${
        waifuCurrent.get().preview
      }"`
    )
      .then(() =>
        waifuFavorites.set([...waifuFavorites.get(), waifuCurrent.get()])
      )
      .finally(() =>
        notify({
          summary: "Waifu",
          body: `Image ${waifuCurrent.get().id} Added to favorites`,
        })
      )
      .catch((err) => notify({ summary: "Error", body: err }));
  } else {
    notify({
      summary: "Waifu",
      body: `Image ${waifuCurrent.get().id} Already favored`,
    });
  }
};

const downloadAllFavorites = () => {
  waifuFavorites.get().forEach((fav) => {
    execAsync(
      `bash -c "curl -o ${favoritesPath + fav.id}.jpg ${fav.preview}"`
    ).catch((err) => notify({ summary: "Error", body: err }));
  });
};

const removeFavorite = (favorite: any) => {
  execAsync(`rm ${favoritesPath + favorite.id}.jpg`)
    .then(() =>
      notify({
        summary: "Waifu",
        body: `${favorite.id} Favorite removed`,
      })
    )
    .finally(() =>
      // (waifuFavorites.get() = waifuFavorites
      //   .get()
      //   .filter((fav) => fav !== favorite))
      {
        waifuFavorites.set(
          waifuFavorites.get().filter((fav) => fav !== favorite)
        );
      }
    )
    .catch((err) => notify({ summary: "Error", body: err }));
};

const PinImageToTerminal = () => {
  if (readFile(terminalWaifuPath) == "")
    exec(`mkdir -p ${terminalWaifuPath.split("/").slice(0, -1).join("/")}`);
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
    .catch((err) => print(err));
};

function Actions() {
  //   const top = Widget.Box({
  //     class_name: "top",
  //     vpack: "start",
  //     hpack: "start",
  //     children: [
  //       Widget.Button({
  //         label: "Pin",
  //         class_name: "pin",
  //         on_clicked: () => PinImageToTerminal(),
  //       }),
  //     ],
  //   });

  const top = (
    <box className="top" valign={Gtk.Align.START} halign={Gtk.Align.START}>
      <button label="Pin" className="pin" onClicked={PinImageToTerminal} />
    </box>
  );

  //   const Entry = Widget.Entry({
  //     class_name: "input",
  //     placeholder_text: "Tags/ID",
  //     text: getSetting("waifu.input_history"),
  //     on_accept: (self) => {
  //       if (self.text == null || self.text == "") {
  //         return;
  //       }
  //       setSetting("waifu.input_history", self.text);
  //       GetImageFromApi(self.text);
  //     },
  //   });

  const Entry = (
    <entry
      className="input"
      placeholderText="Tags/ID"
      text={getSetting("waifu.input_history")}
      onActivate={(self) => {
        if (self.text == null || self.text == "") {
          return;
        }
        setSetting("waifu.input_history", self.text);
        GetImageFromApi(self.text);
      }}
    />
  );

  //   const actions = Widget.Revealer({
  //     revealChild: false,
  //     transitionDuration: globalTransition,
  //     transition: "slide_up",
  //     child: Widget.Box(
  //       { vertical: true },
  //       Widget.Box([
  //         Widget.Button({
  //           label: "",
  //           class_name: "open",
  //           hexpand: true,
  //           on_primary_click: async () => OpenImage(),
  //         }),
  //         Widget.Button({
  //           label: "",
  //           class_name: "favorite",
  //           hexpand: true,
  //           on_primary_click: () => (left.reveal_child = !left.reveal_child),
  //         }),
  //         Widget.Button({
  //           label: "",
  //           hexpand: true,
  //           class_name: "random",
  //           on_clicked: async () => GetImageFromApi(),
  //         }),
  //         Widget.Button({
  //           label: "",
  //           hexpand: true,
  //           class_name: "browser",
  //           on_clicked: async () => SearchImage(),
  //         }),
  //         Widget.Button({
  //           label: "",
  //           hexpand: true,
  //           class_name: "copy",
  //           on_clicked: async () => CopyImage(),
  //         }),
  //       ]),
  //       Widget.Box([
  //         Widget.Button({
  //           label: "",
  //           class_name: "entry-search",
  //           hexpand: true,
  //           on_clicked: () => Entry.activate(),
  //         }),
  //         Entry,
  //         Widget.ToggleButton({
  //           label: "",
  //           class_name: "nsfw",
  //           hexpand: true,
  //           on_toggled: ({ active }) => {
  //             nsfw.get() = active;
  //             notify({
  //               summary: "Waifu",
  //               body: `NSFW is ${nsfw.get() ? "Enabled" : "Disabled"}`,
  //             }).catch((err) => print(err));
  //           },
  //         }),
  //       ])
  //     ),
  //   });

  const actions = (
    <revealer
      revealChild={false}
      transitionDuration={globalTransition}
      transition_type={Gtk.RevealerTransitionType.SLIDE_UP}>
      <box vertical>
        <box>
          <button label="" className="open" hexpand onClicked={OpenImage} />
          <button
            label=""
            className="favorite"
            hexpand
            onClicked={() => (left.reveal_child = !left.reveal_child)}
          />
          <button
            label=""
            hexpand
            className="random"
            onClicked={() => GetImageFromApi}
          />
          <button
            label=""
            hexpand
            className="browser"
            onClicked={() => SearchImage}
          />
          <button label="" hexpand className="copy" onClicked={CopyImage} />
        </box>
        <box>
          <button
            label=""
            className="entry-search"
            hexpand
            onClicked={() => Entry.activate()}
          />
          {Entry}
          {ToggleButton({
            label: "",
            className: "nsfw",
            hexpand: true,
            onToggled: (self, on) => {
              nsfw.set(on);
              notify({
                summary: "Waifu",
                body: `NSFW is ${nsfw.get() ? "Enabled" : "Disabled"}`,
              });
            },
          })}
        </box>
      </box>
    </revealer>
  );
  //   const left = Widget.Revealer({
  //     vexpand: true,
  //     hexpand: true,
  //     hpack: "start",
  //     transition: "slide_right",
  //     transition_duration: globalTransition,
  //     reveal_child: false,
  //     child: Widget.Scrollable({
  //       hscroll: "never",
  //       child: Widget.Box({
  //         class_name: "favorites",
  //         vertical: true,
  //         spacing: 5,
  //         children: [
  //           Widget.Box({
  //             vertical: true,
  //             children: waifuFavorites.bind().as((favorites) =>
  //               favorites.map((favorite) =>
  //                 Widget.EventBox({
  //                   class_name: "favorite-event",
  //                   child: Widget.Box({
  //                     class_name: "favorite",
  //                     css: `background-image: url("${
  //                       favoritesPath + favorite.id
  //                     }.jpg");`,
  //                     child: Widget.Button({
  //                       hexpand: true,
  //                       vpack: "start",
  //                       hpack: "end",
  //                       class_name: "delete",
  //                       label: "",
  //                       on_primary_click: () => removeFavorite(favorite),
  //                     }),
  //                   }),
  //                   on_primary_click: () => {
  //                     GetImageFromApi(String(favorite.id));
  //                     left.reveal_child = false;
  //                   },
  //                 })
  //               )
  //             ),
  //           }),
  //           Widget.Button({
  //             label: "",
  //             class_name: "add",
  //             on_primary_click: () => addToFavorites(),
  //           }),
  //         ],
  //       }),
  //     }),
  //   });

  const left = (
    <revealer
      vexpand
      hexpand
      halign={Gtk.Align.START}
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={globalTransition}
      revealChild={false}>
      <scrollable hscroll={Gtk.PolicyType.NEVER}>
        <box className="favorites" vertical spacing={5}>
          <box vertical>
            {/* {waifuFavorites.bind().as((favorites) =>
                favorites.map((favorite) => (
                  <eventBox className="favorite-event">
                    <box
                      className="favorite"
                      css={`background-image: url("${favoritesPath + favorite.id}.jpg");`}>
                      <button
                        hexpand
                        valign={Gtk.Align.START}
                        halign={Gtk.Align.END}
                        className="delete"
                        label=""
                        // onClicked={() => removeFavorite(favorite)}
                      />
                    </box>
                    {/* onClicked={() => {
                      GetImageFromApi(String(favorite.id));
                      left.reveal_child = false;
                    }}> */}
            {bind(waifuFavorites).as((favorites) =>
              favorites.map((favorite) => (
                <EventBox className="favorite-event">
                  <box
                    className="favorite"
                    css={`
                      background-image: url("${favoritesPath +
                      favorite.id}.jpg");
                    `}>
                    <button
                      hexpand
                      valign={Gtk.Align.START}
                      halign={Gtk.Align.END}
                      className="delete"
                      label=""
                      onClicked={() => removeFavorite(favorite)}
                    />
                  </box>
                </EventBox>
              ))
            )}
          </box>
          <button label="" className="add" onClicked={addToFavorites} />
        </box>
      </scrollable>
    </revealer>
  );

  //   const bottom = Widget.Box({
  //     class_name: "bottom",
  //     vertical: true,
  //     vpack: "end",
  //     children: [
  //       Widget.ToggleButton({
  //         label: "",
  //         class_name: "action-trigger",
  //         hpack: "end",
  //         on_toggled: (self) => {
  //           actions.reveal_child = self.active;
  //           self.label = self.active ? "" : "";
  //           if (self.active)
  //             timeout(15000, () => {
  //               actions.reveal_child = false;
  //               self.label = "";
  //               self.active = false;

  //               left.reveal_child = false;
  //             });
  //           else left.reveal_child = false;
  //         },
  //       }),
  //       actions,
  //     ],
  //   });

  const bottom = (
    <box className="bottom" vertical valign={Gtk.Align.END}>
      {ToggleButton({
        label: "",
        className: "action-trigger",
        halign: Gtk.Align.END,
        onToggled: (self, on) => {
          actions.reveal_child = on;
          self.label = on ? "" : "";
          if (on)
            timeout(15000, () => {
              actions.reveal_child = false;
              self.label = "";
              // self.active = false;

              left.reveal_child = false;
            });
          else left.reveal_child = false;
        },
      })}
      {actions}
    </box>
  );

  //   return Widget.Box({
  //     class_name: "actions",
  //     hexpand: true,
  //     vertical: true,
  //     children: [top, left, bottom],
  //   });

  return (
    <box className="actions" hexpand vertical>
      {top}
      {left}
      {bottom}
    </box>
  );
}

function Image() {
  //   return Widget.EventBox({
  //     on_secondary_click: async () => SearchImage(),
  //     child: Widget.Box({
  //       class_name: "image",
  //       hexpand: false,
  //       vexpand: false,
  //       child: Actions(),
  //       css: merge(
  //         [imageDetails.bind(), rightPanelWidth.bind()],
  //         (imageDetails, width) => {
  //           return `
  //                 background-image: url("${waifuPath}");
  //                 min-height: ${
  //                   (Number(imageDetails.image_height) /
  //                     Number(imageDetails.image_width)) *
  //                   width
  //                 }px;
  //                 `;
  //         }
  //       ),
  //       setup: () => {
  //         if (readFile(waifuPath) == "" || readFile(jsonPath) == "")
  //           GetImageFromApi(waifuCurrent.get());
  //         // downloadAllFavorites()
  //       },
  //     }),
  //   });

  return (
    <EventBox
    // onSecondaryClick={SearchImage}
    >
      <box
        className="image"
        hexpand={false}
        vexpand={false}
        css={bind(
          Variable.derive(
            [bind(imageDetails), bind(rightPanelWidth)],
            (imageDetails, width) => {
              return `
                    background-image: url("${waifuPath}");
                    min-height: ${
                      (Number(imageDetails.image_height) /
                        Number(imageDetails.image_width)) *
                      width
                    }px;
                    `;
            }
          )
        )}>
        {Actions()}
      </box>
    </EventBox>
  );
}

export default () => {
  //   return Widget.Revealer({
  //     transitionDuration: globalTransition,
  //     transition: "slide_down",
  //     reveal_child: globalSettings.bind().as((s) => s.waifu.visibility),
  //     child: Widget.EventBox({
  //       class_name: "waifu-event",
  //       child: Widget.Box(
  //         {
  //           vertical: true,
  //           class_name: "waifu",
  //         },
  //         Image()
  //       ),
  //     }),
  //   });

  return (
    <revealer
      transitionDuration={globalTransition}
      transition_type={Gtk.RevealerTransitionType.SLIDE_DOWN}
      revealChild={globalSettings.get().waifu.visibility}>
      <EventBox className="waifu-event">
        <box className="waifu" vertical>
          {Image()}
        </box>
      </EventBox>
    </revealer>
  );
};

export function WaifuVisibility() {
  //   return Widget.ToggleButton({
  //     active: globalSettings.get().waifu.visibility,
  //     onToggled: ({ active }) => setSetting("waifu.visibility", active),
  //     label: "󱙣",
  //     class_name: "waifu icon",
  //   });

  return ToggleButton({
    state: globalSettings.get().waifu.visibility,
    onToggled: (self, on) => setSetting("waifu.visibility", on),
    label: "󱙣",
    className: "waifu icon",
  });
}
