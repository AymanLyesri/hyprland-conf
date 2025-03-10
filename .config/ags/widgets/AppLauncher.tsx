import { bind, exec, execAsync, Variable } from "astal";
import Apps from "gi://AstalApps";

import { readJson, readJSONFile } from "../utils/json";
import { arithmetic, containsOperator } from "../utils/arithmetic";
import {
  containsProtocolOrTLD,
  formatToURL,
  getDomainFromURL,
} from "../utils/url";
import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { notify } from "../utils/notification";
import { emptyWorkspace, globalMargin, newAppWorkspace } from "../variables";

const apps = new Apps.Apps();

import Hyprland from "gi://AstalHyprland";
import { closeProgress, openProgress } from "./Progress";
const hyprland = Hyprland.get_default();

interface Result {
  app_name: string;
  app_exec: string;
  app_arg?: string;
  app_type?: string;
  app_icon?: string;
  desktop?: string | null;
}

const Results = Variable<Result[]>([]);

// const help = (
//   <menu>
//     <menuitem>
//       <label xalign={0} label="Press <Escape> \t\t =>> \t to reset input" />
//     </menuitem>
//     <menuitem>
//       <label xalign={0} label="... ... \t\t =>> \t open with argument" />
//     </menuitem>
//     <menuitem>
//       <label
//         xalign={0}
//         label="translate .. > .. \t =>> \t translate into (en,fr,es,de,pt,ru,ar...)"
//       />
//     </menuitem>
//     <menuitem>
//       <label xalign={0} label="https://... \t\t =>> \t open link" />
//     </menuitem>
//     <menuitem>
//       <label xalign={0} label="... .com \t\t =>> \t open link" />
//     </menuitem>
//     <menuitem>
//       <label xalign={0} label="..*/+-.. \t\t =>> \t arithmetics" />
//     </menuitem>
//     <menuitem>
//       <label xalign={0} label="emoji ... \t\t =>> \t search emojis" />
//     </menuitem>
//   </menu>
// );

// const popover = (

// );

// const help = (
//   <menubutton>
//     <label>?</label>
//     <Popover>
//       <label>hhhhh</label>
//     </Popover>
//   </menubutton>
// );

let debounceTimer: any;

const Entry = (
  <box spacing={5}>
    <icon className="icon" icon="preferences-system-search-symbolic" />
    <entry
      hexpand={true}
      placeholder_text="Search for an app, emoji, translate, url, or do some math..."
      onChanged={async ({ text }) => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          try {
            if (!text || text.trim() === "") {
              Results.set([]);
              return;
            }

            const args: string[] = text.split(" ");

            if (args[0].includes("translate")) {
              const language = text.includes(">")
                ? text.split(">")[1].trim()
                : "en";
              Results.set(
                readJson(
                  await execAsync(
                    `bash ./scripts/translate.sh '${text
                      .split(">")[0]
                      .replace("translate", "")
                      .trim()}' '${language}'`
                  )
                )
              );
            } else if (args[0].includes("emoji")) {
              Results.set(
                readJSONFile(`./assets/emojis/emojis.json`).filter(
                  (emoji: any) =>
                    emoji.app_tags
                      .toLowerCase()
                      .includes(text.replace("emoji", "").trim())
                )
              );
            } else if (containsProtocolOrTLD(args[0])) {
              Results.set([
                {
                  app_name: getDomainFromURL(text),
                  app_exec: `xdg-open ${formatToURL(text)}`,
                  app_type: "url",
                },
              ]);
            } else if (containsOperator(args[0])) {
              Results.set([
                {
                  app_name: arithmetic(text),
                  app_exec: `wl-copy ${arithmetic(text)}`,
                  app_type: "calc",
                },
              ]);
            } else {
              Results.set(
                apps.fuzzy_query(args.shift()!).map((app) => ({
                  app_name: app.name,
                  app_exec: app.executable,
                  app_arg: args.join(""),
                  app_type: "app",
                  app_icon: app.iconName,
                  // desktop: app.desktop,
                }))
              );

              if (Results.get().length === 0) {
                Results.set([
                  { app_name: `Try ${text}`, app_exec: text, app_icon: "󰋖" },
                ]);
              }
            }
          } catch (err) {
            print(err);
          }
        }, 100); // 100ms delay
      }}
      onActivate={() => {
        if (Results.get().length === 1) {
          launchApp(Results.get()[0]);
        }
      }}
    />
    {/* <button
      label="󰋖"
      on_primary_click={(_, event) => {
        help.popup_at_pointer(event);
      }}
    /> */}
    {/* {help} */}
  </box>
);

const launchApp = (app: Result) => {
  if (app.app_type === "app") {
    openProgress();
    execAsync(`bash ./scripts/app-loading-progress.sh ${app.app_name}`)
      .then((workspace) => newAppWorkspace.set(Number(workspace)))
      .finally(() => closeProgress())
      .catch((err) => notify({ summary: "Error", body: err }));
  }

  // if (app.desktop != null) {
  //   hyprland
  //     .message_async(
  //       `dispatch exec gtk-launch ${app.desktop} ${
  //         app.app_arg || ""
  //       }`
  //     )
  //     .then(() => {
  //       //   App.closeWindow("app-launcher");
  //     })
  //     .catch((err) => notify({ summary: "Error", body: err }));
  //   return;
  // }

  hyprland.message_async(`dispatch exec ${app.app_exec} ${app.app_arg}`, () => {
    switch (app.app_type) {
      case "app":
        break;
      case "url":
        const browser = exec(
          `bash -c "xdg-settings get default-web-browser | sed 's/\.desktop$//'"`
        );
        notify({
          summary: "URL",
          body: `Opening ${app.app_name} in ${browser}`,
        });
        break;
      default:
        break;
    }
    App.toggle_window("app-launcher");
  });

  // .finally(() => )
  // .catch((err) => notify({ summary: "Error", body: err }));
};

const organizeResults = (results: Result[]) => {
  const buttonContent = (element: Result) => (
    <box
      spacing={10}
      halign={
        element.app_type === "emoji" ? Gtk.Align.CENTER : Gtk.Align.START
      }>
      {element.app_type === "app" ? (
        <icon icon={element.app_icon || "view-grid-symbolic"} />
      ) : (
        <label label={element.app_icon} />
      )}
      <label label={element.app_name} />
      <label className="argument" label={element.app_arg || ""} />
    </box>
  );

  const button = (element: Result) => (
    <button
      hexpand={true}
      child={buttonContent(element)}
      onClick={() => {
        launchApp(element);
      }}
    />
  );

  if (results.length === 0) return <box />;

  const rows = (
    <box className="results" vertical={true} vexpand={true} hexpand={true}>
      {Array.from({ length: Math.ceil(results.length / 2) }).map((_, i) => (
        <box vertical={false} spacing={5}>
          {results.slice(i * 2, i * 2 + 2).map((element) => button(element))}
        </box>
      ))}
    </box>
  );

  const maxHeight = 500;

  return (
    <scrollable
      vexpand={true}
      hexpand={true}
      heightRequest={bind(Results).as((results) =>
        results.length * 25 > maxHeight ? maxHeight : results.length * 25
      )}
      child={rows}
    />
  );
};

const ResultsDisplay = <box child={bind(Results).as(organizeResults)} />;

export default () => (
  <window
    name="app-launcher"
    namespace="app-launcher"
    application={App}
    anchor={emptyWorkspace.as((empty) =>
      empty ? undefined : Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT
    )}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    keymode={Astal.Keymode.ON_DEMAND}
    layer={Astal.Layer.TOP}
    margin={globalMargin} // top right bottom left
    visible={false}
    onKeyPressEvent={(self, event) => {
      if (event.get_keyval()[1] === Gdk.KEY_Escape) {
        // Entry.children[1].text = "";
        // Entry.children[1].grab_focus();
      }
    }}
    // setup={(self) =>
    //   self.keybind("Escape", () => {
    //     Entry.children[1].text = "";
    //     Entry.children[1].grab_focus();
    //   })
    // }
    child={
      <eventbox>
        <box vertical={true} className="app-launcher">
          {Entry}
          {ResultsDisplay}
        </box>
      </eventbox>
    }></window>
);
