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
import {
  emptyWorkspace,
  globalMargin,
  globalSettings,
  globalTransition,
  newAppWorkspace,
} from "../variables";

const apps = new Apps.Apps();

import Hyprland from "gi://AstalHyprland";
import { closeProgress, openProgress } from "./Progress";
import { hideWindow } from "../utils/window";
import { getMonitorName } from "../utils/monitor";
const hyprland = Hyprland.get_default();

const MAX_ITEMS = 10;

const monitorName = Variable<string>("");

interface Result {
  app_name: string;
  app_arg?: string;
  app_type?: string;
  app_icon?: string;
  app_launch: () => void;
}

const Results = Variable<Result[]>([]);
const quickApps = globalSettings.get().quickLauncher.apps;

const QuickApps = () => {
  const apps = (
    <revealer
      transition_type={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transition_duration={1500}
      revealChild={bind(Results).as((results) => results.length === 0)}
      child={
        <scrollable
          vexpand={true}
          hexpand={true}
          widthRequest={500}
          hscroll={Gtk.PolicyType.ALWAYS}
          vscroll={Gtk.PolicyType.NEVER}
          child={
            <box className="quick-apps" spacing={5}>
              {quickApps.map((app) => (
                <button
                  className="quick-app"
                  onClicked={() => {
                    openProgress();
                    execAsync(
                      `bash ./scripts/app-loading-progress.sh ${app.app_name}`
                    )
                      .then((workspace) =>
                        newAppWorkspace.set(Number(workspace))
                      )
                      .finally(() => closeProgress())
                      .catch((err) => notify({ summary: "Error", body: err }));
                    hyprland.message_async(`dispatch exec ${app.exec}`, () => {
                      App.toggle_window("app-launcher");
                    });
                  }}
                  child={
                    <box spacing={5}>
                      <label className="icon" label={app.icon} />
                      <label label={app.name} />
                    </box>
                  }></button>
              ))}
            </box>
          }></scrollable>
      }></revealer>
  );

  return (
    <box
      className="quick-launcher"
      halign={Gtk.Align.CENTER}
      spacing={5}
      child={apps}></box>
  );
};

let debounceTimer: any;
let args: string[];

const Entry = (
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
          args = text.split(" ");

          if (args[0].includes("translate")) {
            const language = text.includes(">")
              ? text.split(">")[1].trim()
              : "en";
            const translation = await execAsync(
              `bash ./scripts/translate.sh '${text
                .split(">")[0]
                .replace("translate", "")
                .trim()}' '${language}'`
            );
            Results.set([
              {
                app_name: translation,
                app_launch: () => execAsync(`wl-copy ${translation}`),
              },
            ]);
          } // Handle emojis
          else if (args[0].includes("emoji")) {
            const emojis: [] = readJSONFile("./assets/emojis/emojis.json");
            const filteredEmojis = emojis.filter(
              (emoji: { app_tags: string; app_name: string }) =>
                emoji.app_tags
                  .toLowerCase()
                  .includes(text.replace("emoji", "").trim())
            );
            Results.set(
              filteredEmojis.map((emoji: { app_name: string }) => ({
                app_name: emoji.app_name,
                app_icon: emoji.app_name,
                app_launch: () => execAsync(`wl-copy ${emoji.app_name}`),
              }))
            );
          }
          // handle URL
          else if (containsProtocolOrTLD(args[0])) {
            Results.set([
              {
                app_name: getDomainFromURL(text),
                app_launch: () =>
                  execAsync(`xdg-open ${formatToURL(text)}`).then(() => {
                    const browser = execAsync(
                      `bash -c "xdg-settings get default-web-browser | sed 's/\.desktop$//'"`
                    );
                    notify({
                      summary: "URL",
                      body: `Opening ${text} in ${browser}`,
                    });
                  }),
              },
            ]);
          }
          // handle arithmetic
          else if (containsOperator(args[0])) {
            Results.set([
              {
                app_name: arithmetic(text),
                app_launch: () => execAsync(`wl-copy ${arithmetic(text)}`),
              },
            ]);
          }
          // Handle apps
          else {
            Results.set(
              apps
                .fuzzy_query(args.shift()!)
                .slice(0, MAX_ITEMS)
                .map((app) => ({
                  app_name: app.name,
                  app_icon: app.iconName,
                  app_launch: () =>
                    !args.join("")
                      ? app.launch()
                      : hyprland.message_async(
                          `dispatch exec ${app.executable} ${args.join(" ")}`,
                          () => {}
                        ),
                }))
            );
            if (Results.get().length === 0) {
              Results.set([
                {
                  app_name: `Try ${text}`,
                  app_icon: "󰋖",
                  app_launch: () =>
                    hyprland.message_async(`dispatch exec ${text}`, () => {}),
                },
              ]);
            }
          }
        } catch (err) {
          print(err);
        }
      }, 100); // 100ms delay
    }}
    onActivate={() => {
      if (Results.get().length > 0) {
        launchApp(Results.get()[0]);
      }
    }}
  />
);

const launchApp = (app: Result) => {
  openProgress();
  app.app_launch();
  hideWindow(`app-launcher-${monitorName.get()}`);
};

const organizeResults = (results: Result[]) => {
  const buttonContent = (element: Result) => (
    <box
      spacing={10}
      halign={
        element.app_type === "emoji" ? Gtk.Align.CENTER : Gtk.Align.START
      }>
      <icon icon={element.app_icon || "view-grid-symbolic"} />
      <label label={element.app_name} />
      <label className="argument" label={element.app_arg || ""} />
    </box>
  );

  const AppButton = ({
    element,
    className,
  }: {
    element: Result;
    className?: string;
  }) => {
    return (
      <button
        hexpand={true}
        className={className}
        child={buttonContent(element)}
        onClicked={() => {
          launchApp(element);
        }}
      />
    );
  };

  if (results.length === 0) return <box />;

  const rows = (
    <box className="results" vertical={true} spacing={5}>
      {Array.from({ length: Math.ceil(results.length / 2) }).map((_, i) => (
        <box vertical={false} spacing={5}>
          {results.slice(i * 2, i * 2 + 2).map((element, j) => (
            <AppButton
              element={element}
              className={i === 0 && j === 0 ? "checked" : ""}
            />
          ))}
        </box>
      ))}
    </box>
  );

  const maxHeight = 500;

  return (
    <scrollable
      heightRequest={bind(Results).as((results) =>
        results.length * 20 > maxHeight ? maxHeight : results.length * 20
      )}
      child={rows}
    />
  );
};

const ResultsDisplay = <box child={bind(Results).as(organizeResults)} />;

export default (monitor: Gdk.Monitor) => (
  <window
    gdkmonitor={monitor}
    name={`app-launcher-${getMonitorName(monitor.get_display(), monitor)}`}
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
        Entry.set_text("");
        Entry.grab_focus();
      }
    }}
    setup={(self) => {
      monitorName.set(getMonitorName(monitor.get_display(), monitor)!);
    }}
    child={
      <eventbox>
        <box vertical={true} className="app-launcher">
          <box spacing={5}>
            <icon className="icon" icon="preferences-system-search-symbolic" />
            {Entry}
          </box>
          {QuickApps()}
          {ResultsDisplay}
        </box>
      </eventbox>
    }></window>
);
