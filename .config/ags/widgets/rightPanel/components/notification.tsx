import { Gtk } from "astal/gtk3";
import { Box, Button, Revealer, RevealerProps } from "astal/gtk3/widget";
import ToggleButton from "../../toggleButton";
import { execAsync, timeout } from "astal";

const TRANSITION = 200;

/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
function NotificationIcon({ app_entry, app_icon, image }) {
  if (image) {
    // return Widget.Box({
    //   hexpand: true,
    //   vexpand: true,
    //   class_name: "image",
    //   css:
    //     `background-image: url("${image}");` +
    //     "background-size: cover;" +
    //     "background-repeat: no-repeat;" +
    //     "background-position: center;" +
    //     "border-radius: 10px;",
    // });
    return (
      <box
        hexpand
        vexpand
        className="image"
        css={`
          background-image: url("${image}");
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          border-radius: 10px;
        `}
      />
    );
  }

  let icon = "dialog-information-symbolic";
  //   if (Utils.lookUpIcon(app_icon)) icon = app_icon;

  //   if (app_entry && Utils.lookUpIcon(app_entry)) icon = app_entry;

  //   return Widget.Box({
  //     child: Widget.Icon({ class_name: "icon", icon: icon }),
  //   });

  return <icon className="icon" icon={icon} />;
}

/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
export function Notification_(
  n: Notification,
  new_Notification = false,
  popup = false
) {
  //   const icon = Widget.Box({
  //     vpack: "start",
  //     hpack: "center",
  //     hexpand: false,
  //     class_name: "icon",
  //     child: NotificationIcon(n),
  //   });

  const icon = (
    <box
      valign={Gtk.Align.START}
      halign={Gtk.Align.CENTER}
      hexpand={false}
      className="icon">
      {NotificationIcon({n.app_entry, n.icon, n.icon})}
    </box>
  );

  //   const title = Widget.Label({
  //     class_name: "title",
  //     xalign: 0,
  //     justification: "left",
  //     hexpand: true,
  //     max_width_chars: 24,
  //     truncate: "end",
  //     wrap: true,
  //     label: n.summary,
  //     use_markup: true,
  //   });

  const title = (
    <label
      className="title"
      xalign={0}
      justify={Gtk.Justification.LEFT}
      hexpand
      max_width_chars={24}
      truncate={true}
      wrap
      label={n.title}
      use_markup
    />
  );

  // const body = Widget.Label({
  //   class_name: "body",
  //   hexpand: true,
  //   use_markup: true,
  //   truncate: "end",
  //   max_width_chars: 24,
  //   xalign: 0,
  //   justification: "left",
  //   label: n.body,
  //   wrap: true,
  // });

  const body = (
    <label
      className="body"
      hexpand
      use_markup
      truncate={true}
      max_width_chars={24}
      xalign={0}
      justify={Gtk.Justification.LEFT}
      label={n.body}
      wrap
    />
  );

  // const actions: string[][] = n.hints.actions
  //   ? readJson(n.hints.actions.get_string()[0])
  //   : [];

  // const Actions = Widget.Box({
  //   class_name: "actions",
  //   // hpack: "fill",
  //   children: actions.map((action) =>
  //     Widget.Button({
  //       class_name: action[0].includes("Delete") ? "delete" : "",
  //       // hpack: action[0].includes("Delete") ? "end" : "fill",
  //       on_clicked: () => {
  //         Hyprland.messageAsync(`dispatch exec ${action[1]}`).catch((err) =>
  //           Utils.notify(err)
  //         );
  //       },
  //       hexpand: true,
  //       child: Widget.Label(action[0].includes("Delete") ? "󰆴" : action[0]),
  //     })
  //   ),
  // });

  // const expand = Widget.ToggleButton({
  //   class_name: "expand",
  //   on_toggled: (self) => {
  //     title.truncate = self.active ? "none" : "end";
  //     body.truncate = self.active ? "none" : "end";
  //     self.label = self.active ? "" : "";
  //   },
  //   label: "",
  // });

  const expand = (
    <ToggleButton
      className="expand"
      on_toggled={(self, on) => {
        // title.truncate = on ? "none" : "end";
        // body.truncate = on ? "none" : "end";
        self.label = on ? "" : "";
      }}
      label=""
    />
  );

  let timeoutId: any;

  // const lockButton = Widget.ToggleButton({
  //   class_name: "lock",
  //   label: "",
  //   on_toggled: ({ active }) => {
  //     Revealer.attribute.locked = active;

  //     // If there is an existing timeout, clear it when the button is clicked again
  //     if (timeoutId) {
  //       clearTimeout(timeoutId);
  //       timeoutId = null; // Reset timeout ID
  //     }

  //     if (!Revealer.attribute.locked) {
  //       timeoutId = setTimeout(() => {
  //         Revealer.reveal_child = false;
  //         Parent.destroy();
  //         timeoutId = null; // Clear timeout ID after execution
  //       }, notifications.popupTimeout);
  //     }
  //   },
  // });

  const lockButton = (
    <ToggleButton
      className="lock"
      label=""
      on_toggled={(self, on) => {
        Revealer.attribute.locked = on;

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (!Revealer.attribute.locked) {
          timeoutId = setTimeout(() => {
            Revealer.reveal_child = false;
            Parent.destroy();
            timeoutId = null;
          }, notifications.popupTimeout);
        }
      }}
    />
  );

  // const copyButton = Widget.Button({
  //   class_name: "copy",
  //   label: "",
  //   on_clicked: () =>
  //     Utils.execAsync(`wl-copy "${n.body}"`).catch((err) => print(err)),
  // });

  const copyButton = (
    <Button
      className="copy"
      label=""
      on_clicked={() =>
        execAsync(`wl-copy "${n.body}"`).catch((err) => print(err))
      }
    />
  );

  // const leftRevealer = Widget.Revealer({
  //   reveal_child: false,
  //   transition: "slide_left",
  //   transition_duration: globalTransition,
  //   setup: (self) => (self.child = popup ? lockButton : copyButton),
  // });

  const leftRevealer = (
    <revealer
      reveal_child={false}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      transition_duration={TRANSITION}
      setup={(self) => (self.child = popup ? lockButton : copyButton)}
    />
  );

  // const closeRevealer = Widget.Revealer({
  //   reveal_child: false,
  //   transition: "slide_right",
  //   transition_duration: globalTransition,
  //   child: Widget.Button({
  //     class_name: "close",
  //     label: "",
  //     on_clicked: () => {
  //       Revealer.reveal_child = false;
  //       timeout(globalTransition, () => {
  //         n.close();
  //       });
  //     },
  //   }),
  // });

  const closeRevealer = (
    <revealer
      reveal_child={false}
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transition_duration={TRANSITION}
      child={
        <Button
          className="close"
          label=""
          on_clicked={() => {
            Revealer.reveal_child = false;
            timeout(TRANSITION, () => {
              n.close();
            });
          }}
        />
      }
    />
  );

  // const topBar = Widget.Box({
  //   class_name: "top-bar",
  //   hexpand: true,
  //   spacing: 5,
  //   children: [
  //     leftRevealer,
  //     Widget.Label({
  //       hexpand: true,
  //       xalign: 0,
  //       truncate: popup ? "none" : "end",
  //       class_name: "app-name",
  //       label: n.app_name,
  //     }),
  //     Widget.Label({
  //       hexpand: true,
  //       xalign: 1,
  //       class_name: "time",
  //       label: time(n.time),
  //     }),
  //     expand,
  //     closeRevealer,
  //   ],
  // });

  const topBar = (
    <box className="top-bar" hexpand spacing={5}>
      {leftRevealer}
      <label
        hexpand
        xalign={0}
        // truncate={popup ? "none" : "end"}
        truncate={popup ? false : true}
        className="app-name"
        // label={n.app_name}
      />
      <label hexpand xalign={1} className="time" label={time(n.time)} />
      {expand}
      {closeRevealer}
    </box>
  );

  // const Box = Widget.Box(
  //   {
  //     class_name: `notification ${n.urgency} ${n.app_name}`,
  //   },

  //   Widget.Box({
  //     class_name: "main-content",
  //     vertical: true,
  //     spacing: 5,
  //     children: [
  //       topBar,
  //       Widget.Separator(),
  //       Widget.Box({
  //         children: [
  //           icon,
  //           Widget.Box(
  //             {
  //               vertical: true,
  //               spacing: 5,
  //             },
  //             Widget.Box({
  //               hexpand: true,
  //               child: title,
  //             }),
  //             body
  //           ),
  //         ],
  //       }),
  //       Actions,
  //     ],
  //   })
  // );

  const Box = (
    <box className={`notification ${n.urgency} ${n.app_name}`}>
      <box className="main-content" vertical spacing={5}>
        {topBar}
        {/* <separator /> */}
        <box>
          {icon}
          <box vertical spacing={5}>
            <box hexpand>{title}</box>
            {body}
          </box>
        </box>
        {/* {Actions} */}
      </box>
    </box>
  );

  // const Revealer: any = Widget.Revealer({
  //   attribute: {
  //     id: n.id,
  //     locked: false,
  //     hide: () => (Revealer.reveal_child = false),
  //   },
  //   child: Box,
  //   transition: "slide_down",
  //   transition_duration: TRANSITION,
  //   reveal_child: !new_Notification,
  //   visible: true, // this is necessary for the revealer to work
  //   setup: (self) => {
  //     timeout(1, () => {
  //       self.reveal_child = true;
  //     });
  //   },
  // });

  const Revealer = (
    <revealer
      attribute={{
        id: n.id,
        locked: false,
        hide: () => (Revealer.reveal_child = false),
      }}
      child={Box}
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transition_duration={TRANSITION}
      reveal_child={!new_Notification}
      visible
      setup={(self) => {
        timeout(1, () => {
          self.reveal_child = true;
        });
      }}
    />
  );

  // const Parent = Widget.Box({
  //   visible: true,
  //   child: Widget.EventBox({
  //     visible: true,
  //     child: Revealer,
  //     on_hover: () => {
  //       leftRevealer.reveal_child = true;
  //       closeRevealer.reveal_child = true;
  //     },
  //     on_hover_lost: () => {
  //       if (!Revealer.attribute.locked) leftRevealer.reveal_child = false;
  //       closeRevealer.reveal_child = false;
  //     },

  //     on_primary_click: () => leftRevealer.child.activate(),
  //     on_secondary_click: () => closeRevealer.child.activate(),
  //   }),
  // });

  const Parent = (
    <box visible>
      <eventbox
        visible
        child={Revealer}
        on_hover={() => {
          leftRevealer.reveal_child = true;
          closeRevealer.reveal_child = true;
        }}
        on_hover_lost={() => {
          if (!Revealer.attribute.locked) leftRevealer.reveal_child = false;
          closeRevealer.reveal_child = false;
        }}
        on_primary_click={() => leftRevealer.child.activate()}
        on_secondary_click={() => closeRevealer.child.activate()}
      />
    </box>
  );

  return Parent;
}
