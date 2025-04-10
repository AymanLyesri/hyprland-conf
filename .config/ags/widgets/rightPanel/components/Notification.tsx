import { execAsync, GLib, timeout, Variable } from "astal";
import { Gtk, Astal } from "astal/gtk3";
import Notifd from "gi://AstalNotifd";
import { globalTransition, NOTIFICATION_DELAY } from "../../../variables";
import ToggleButton from "../../toggleButton";
import hyprland from "gi://AstalHyprland";
import { notify } from "../../../utils/notification";
import { asyncSleep, time } from "../../../utils/time";
const Hyprland = hyprland.get_default();

const isIcon = (icon: string) => !!Astal.Icon.lookup_icon(icon);

const TRANSITION = 200;

function NotificationIcon(n: Notifd.Notification) {
  const notificationIcon = n.image || n.app_icon || n.desktopEntry;

  if (!notificationIcon)
    return <icon className="icon" icon={"dialog-information-symbolic"} />;

  return (
    <box
      className="image"
      css={`
        background-image: url("${notificationIcon}");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        border-radius: 10px;
      `}
    />
  );
}

function copyNotificationContent(n: Notifd.Notification) {
  if (n.appIcon) {
    execAsync(`bash -c "wl-copy --type image/png < '${n.appIcon}'"`)
      .finally(() => notify({ summary: "Copied", body: n.appIcon }))
      .catch((err) => notify({ summary: "Error", body: err }));
    return;
  }

  const content = n.body || n.app_name;
  if (!content) return;
  execAsync(`wl-copy "${content}"`).catch((err) =>
    notify({ summary: "Error", body: err })
  );
}

export default ({
  n,
  newNotification = false,
  popup = false,
}: {
  n: Notifd.Notification;
  newNotification?: boolean;
  popup?: boolean;
}) => {
  const IsLocked = Variable<boolean>(false);
  IsLocked.subscribe((value) => {
    if (!value)
      timeout(NOTIFICATION_DELAY, () => {
        if (!IsLocked.get() && popup) closeNotification();
      });
  });

  async function closeNotification(dismiss = false) {
    Revealer.reveal_child = false;
    timeout(globalTransition, () => {
      Parent.destroy();
      if (dismiss) n.dismiss();
    });
  }

  const icon = (
    <box
      valign={Gtk.Align.START}
      halign={Gtk.Align.CENTER}
      hexpand={false}
      className="icon"
      child={NotificationIcon(n)}></box>
  );

  const title = (
    <label
      className="title"
      xalign={0}
      justify={Gtk.Justification.LEFT}
      hexpand={true}
      maxWidthChars={24}
      truncate={true}
      wrap={true}
      label={n.summary}
      useMarkup={true}
    />
  );

  const body = (
    <label
      className="body"
      hexpand={true}
      truncate={true}
      maxWidthChars={24}
      xalign={0}
      justify={Gtk.Justification.LEFT}
      label={n.body}
      wrap={true}
    />
  );

  // const actions: string[] = n.actions
  //   ? JSON.parse(n.actions.toString()[0])
  //   : [];

  // const Actions = (
  //   <box className="actions">
  //     {actions.map((action) => (
  //       <button
  //         className={action[0].includes("Delete") ? "delete" : ""}
  //         onClicked={() => {
  //           Hyprland.message_async(`dispatch exec ${action[1]}`).catch((err) =>
  //             notify(err)
  //           );
  //         }}
  //         hexpand={true}
  //         child={
  //           <label label={action[0].includes("Delete") ? "󰆴" : action[0]} />
  //         }></button>
  //     ))}
  //   </box>
  // );

  const expandRevealer = (
    <revealer
      reveal_child={false}
      transition_type={Gtk.RevealerTransitionType.CROSSFADE}
      transitionDuration={globalTransition}
      child={
        <ToggleButton
          className="expand"
          state={false}
          onToggled={(self, on) => {
            title.set_property("truncate", !on);
            body.set_property("truncate", !on);
            self.label = on ? "" : "";
          }}
          label=""
        />
      }
    />
  );

  const lockButton = (
    <ToggleButton
      className="lock"
      label=""
      onToggled={(self, on) => {
        IsLocked.set(on);
      }}
    />
  );

  const copyButton = (
    <button
      className="copy"
      label=""
      onClicked={() => copyNotificationContent(n)}
    />
  );

  const leftRevealer = (
    <revealer
      reveal_child={false}
      transition_type={Gtk.RevealerTransitionType.CROSSFADE}
      transitionDuration={globalTransition}
      child={popup ? lockButton : copyButton}
    />
  );

  const closeRevealer = (
    <revealer
      reveal_child={false}
      transition_type={Gtk.RevealerTransitionType.CROSSFADE}
      transitionDuration={globalTransition}
      child={
        <button
          className="close"
          label=""
          onClicked={() => {
            closeNotification(true);
          }}
        />
      }></revealer>
  );

  const CircularProgress = (
    <circularprogress
      className="circular-progress"
      rounded={true}
      value={1}
      setup={(self) => {
        while (self.value >= 0 && !self.destroyed) {
          self.value -= 0.01;
          asyncSleep(50);
        }
        self.visible = false;
        self.destroy();
      }}
    />
  );

  const topBar = (
    <box className="top-bar" hexpand={true} spacing={5}>
      <box spacing={5} hexpand>
        <box
          visible={popup}
          className={"circular-progress-box"}
          child={CircularProgress}
        />

        <label
          wrap={true}
          xalign={0}
          truncate={popup}
          className="app-name"
          label={n.app_name}
        />
        {leftRevealer}
      </box>
      <box className={"quick-actions"}>
        {closeRevealer}
        {expandRevealer}
      </box>

      <label xalign={1} className="time" label={time(n.time)} />
    </box>
  );

  const Box = (
    <box
      className={`notification ${n.urgency} ${n.app_name}`}
      child={
        <box className="main-content" vertical={true} spacing={10}>
          {topBar}
          {/* <separator /> */}
          <box spacing={5}>
            {icon}
            <box vertical={true} spacing={5}>
              <box hexpand={true} child={title}></box>
              {body}
            </box>
          </box>
          {/* {Actions} */}
        </box>
      }></box>
  );

  const Revealer = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transitionDuration={TRANSITION}
      reveal_child={!newNotification}
      setup={(self) => {
        timeout(1, () => {
          self.reveal_child = true;
        });
      }}
      child={Box}></revealer>
  );
  const Parent = (
    <box
      visible={true}
      setup={(self) =>
        timeout(NOTIFICATION_DELAY, () => {
          if (!IsLocked.get() && popup) closeNotification();
        })
      }
      child={
        <eventbox
          className={"notification-eventbox"}
          visible={true}
          onHover={() => {
            leftRevealer.reveal_child = true;
            closeRevealer.reveal_child = true;
            expandRevealer.reveal_child = true;
          }}
          onHoverLost={() => {
            if (!IsLocked.get()) leftRevealer.reveal_child = false;
            closeRevealer.reveal_child = false;
            expandRevealer.reveal_child = false;
          }}
          onClick={() =>
            popup ? lockButton.activate() : copyButton.activate()
          }
          // onSecondaryClick={() => closeRevealer.child.activate()}
          child={Revealer}></eventbox>
      }></box>
  );

  return Parent;
};
