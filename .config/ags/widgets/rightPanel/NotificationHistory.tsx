import { Gtk } from "astal/gtk3";
import Notifd from "gi://AstalNotifd";
import Notification from "./components/Notification";
import { bind, Variable } from "astal";

interface Filter {
  name: string;
  class: string;
}

const notificationFilter = Variable<Filter>({ name: "", class: "" });

export default () => {
  const Filters: Filter[] = [
    { name: "Spotify", class: "spotify" },
    { name: "Clipboard", class: "clipboard" },
    { name: "Update", class: "update" },
  ];

  const Filter = (
    <box className="filter" hexpand={false}>
      {Filters.map((filter) => (
        <button
          label={filter.name}
          hexpand={true}
          on_clicked={() => {
            notificationFilter.set(
              notificationFilter.get() === filter
                ? { name: "", class: "" }
                : filter
            );
          }}
          className={bind(notificationFilter).as((f) =>
            f.class === filter.class ? "active" : ""
          )}
        />
      ))}
    </box>
  );

  function FilterNotifications(
    notifications: Notifd.Notification[],
    filter: string
  ): Notifd.Notification[] {
    const MAX_NOTIFICATIONS = 25;

    const filtered: Notifd.Notification[] = [];
    const others: Notifd.Notification[] = [];

    notifications.forEach((notification) => {
      if (
        notification.app_name.includes(filter) ||
        notification.summary.includes(filter)
      ) {
        filtered.unshift(notification);
      } else {
        others.unshift(notification);
      }
    });

    const combinedNotifications = [...filtered, ...others];
    const keptNotifications = combinedNotifications.slice(0, MAX_NOTIFICATIONS);

    // Close excess notifications
    combinedNotifications.slice(MAX_NOTIFICATIONS).forEach((notification) => {
      notification.dismiss();
    });

    return keptNotifications;
  }

  const NotificationHistory = (
    <box vertical={true} spacing={5}>
      {bind(
        Variable.derive(
          [bind(Notifd.get_default(), "notifications"), notificationFilter],
          (notifications, filter) => {
            if (!notifications) return [];
            return FilterNotifications(notifications, filter.name).map(
              (notification) => <Notification n={notification} />
            );
          }
        )
      )}
    </box>
  );

  const NotificationsDisplay = (
    <scrollable hscroll={Gtk.PolicyType.NEVER} vexpand={true}>
      {NotificationHistory}
    </scrollable>
  );

  const ClearNotifications = (
    <button
      className="clear"
      label=""
      on_clicked={() => {
        // Notifd.get_default().clear();
        // NotificationHistory.children = []; // Clear UI
      }}
    />
  );

  return (
    <box className="notification-history" vertical={true} spacing={5}>
      {Filter}
      {NotificationsDisplay}
      {ClearNotifications}
    </box>
  );
};
