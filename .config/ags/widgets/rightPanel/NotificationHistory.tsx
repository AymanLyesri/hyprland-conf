import { Gtk } from "astal/gtk3";

// const Notifications = await Service.import("notifications");

// interface Filter {
//   name: string;
//   class: string;
// }

// const notificationFilter = Variable<Filter>({ name: "", class: "" });

// export default () => {
//   const Filters: Filter[] = [
//     { name: "Spotify", class: "spotify" },
//     { name: "Clipboard", class: "clipboard" },
//     { name: "Update", class: "update" },
//   ];

//   const Filter = (
//     <box class_name="filter" hexpand={false}>
//       {Filters.map((filter) => (
//         <button
//           label={filter.name}
//           hexpand={true}
//           on_clicked={() => {
//             notificationFilter.value =
//               notificationFilter.value === filter
//                 ? { name: "", class: "" }
//                 : filter;
//           }}
//           class_name={notificationFilter
//             .bind()
//             .as((f) => (f.class === filter.class ? "active" : ""))}
//         />
//       ))}
//     </box>
//   );

//   function FilterNotifications(
//     notifications: Notification[],
//     filter: string
//   ): Notification[] {
//     const MAX_NOTIFICATIONS = 25;

//     const filtered: Notification[] = [];
//     const others: Notification[] = [];

//     notifications.forEach((notification) => {
//       if (
//         notification.app_name.includes(filter) ||
//         notification.summary.includes(filter)
//       ) {
//         filtered.unshift(notification);
//       } else {
//         others.unshift(notification);
//       }
//     });

//     const combinedNotifications = [...filtered, ...others];
//     const keptNotifications = combinedNotifications.slice(0, MAX_NOTIFICATIONS);

//     // Close excess notifications
//     combinedNotifications.slice(MAX_NOTIFICATIONS).forEach((notification) => {
//       notification.close();
//     });

//     return keptNotifications;
//   }

//   const NotificationHistory = (
//     <box vertical={true} spacing={5}>
//       {Utils.merge(
//         [notificationFilter.bind(), Notifications.bind("notifications")],
//         (filter, notifications) => {
//           if (!notifications) return [];
//           return FilterNotifications(notifications, filter.name).map(
//             (notification) => <Notification_ {...notification} />
//           );
//         }
//       )}
//     </box>
//   );

//   const NotificationsDisplay = (
//     <scrollable hscroll={Gtk.PolicyType.NEVER} vexpand={true}>
//       {NotificationHistory}
//     </scrollable>
//   );

//   const ClearNotifications = (
//     <button
//       class_name="clear"
//       label=""
//       on_clicked={() => {
//         Notifications.clear();
//         // NotificationHistory.children = []; // Clear UI
//       }}
//     />
//   );

//   return (
//     <box class_name="notification-history" vertical={true} spacing={5}>
//       {Filter}
//       {NotificationsDisplay}
//       {ClearNotifications}
//     </box>
//   );
// };

import { Astal } from "astal/gtk3";
import Notifd from "gi://AstalNotifd";
import { type Subscribable } from "astal/binding";
import { Variable, bind, timeout } from "astal";
import Notification from "./components/Notification";

// see comment below in constructor
const TIMEOUT_DELAY = 5000;

// The purpose if this class is to replace Variable<Array<Widget>>
// with a Map<number, Widget> type in order to track notification widgets
// by their id, while making it conviniently bindable as an array
class NotifiationMap implements Subscribable {
  // the underlying map to keep track of id widget pairs
  private map: Map<number, Gtk.Widget> = new Map();

  // it makes sense to use a Variable under the hood and use its
  // reactivity implementation instead of keeping track of subscribers ourselves
  private var: Variable<Array<Gtk.Widget>> = Variable([]);

  // notify subscribers to rerender when state changes
  private notify() {
    this.var.set([...this.map.values()].reverse());
  }

  constructor() {
    const notifd = Notifd.get_default();

    /**
     * uncomment this if you want to
     * ignore timeout by senders and enforce our own timeout
     * note that if the notification has any actions
     * they might not work, since the sender already treats them as resolved
     */
    // notifd.ignoreTimeout = true

    notifd.connect("notified", (_, id) => {
      this.set(
        id,
        Notification({
          n: notifd.get_notification(id)!,

          // once hovering over the notification is done
          // destroy the widget without calling notification.dismiss()
          // so that it acts as a "popup" and we can still display it
          // in a notification center like widget
          // but clicking on the close button will close it
          //   onHoverLost: () => this.delete(id),

          // notifd by default does not close notifications
          // until user input or the timeout specified by sender
          // which we set to ignore above
          //   setup: () =>
          //     timeout(TIMEOUT_DELAY, () => {
          //       /**
          //        * uncomment this if you want to "hide" the notifications
          //        * after TIMEOUT_DELAY
          //        */
          //       this.delete(id);
          //     }),
        })
      );
    });

    // notifications can be closed by the outside before
    // any user input, which have to be handled too
    notifd.connect("resolved", (_, id) => {
      this.delete(id);
    });
  }

  private set(key: number, value: Gtk.Widget) {
    // in case of replacecment destroy previous widget
    this.map.get(key)?.destroy();
    this.map.set(key, value);
    this.notify();
  }

  private delete(key: number) {
    this.map.get(key)?.destroy();
    this.map.delete(key);
    this.notify();
  }

  // needed by the Subscribable interface
  get() {
    return this.var.get();
  }

  // needed by the Subscribable interface
  subscribe(callback: (list: Array<Gtk.Widget>) => void) {
    return this.var.subscribe(callback);
  }
}

export default () => {
  const notifs = new NotifiationMap();

  return (
    <scrollable hscroll={Gtk.PolicyType.NEVER}>
      <box vertical vexpand={true} spacing={5}>
        {/* {bind(notifs)} */}
        {bind(Notifd.get_default(), "notifications").as((notifications) =>
          notifications.map((n) => <Notification n={n} />)
        )}
      </box>
    </scrollable>
  );
};
