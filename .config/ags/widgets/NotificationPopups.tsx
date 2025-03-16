import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import Notifd from "gi://AstalNotifd";
import Notification from "./rightPanel/components/Notification";
import { type Subscribable } from "astal/binding";
import { Variable, bind, timeout } from "astal";
import { DND, globalMargin } from "../variables";

// see comment below in constructor
const TIMEOUT_DELAY = 5000;

// The purpose if this class is to replace Variable<Array<Widget>>
// with a Map<number, Widget> type in order to track notification widgets
// by their id, while making it conveniently bindable as an array
class NotificationMap implements Subscribable {
  // the underlying notificationMap to keep track of id widget pairs
  private notificationMap: Map<number, Gtk.Widget> = new Map();

  // it makes sense to use a Variable under the hood and use its
  // reactivity implementation instead of keeping track of subscribers ourselves
  private notifications: Variable<Array<Gtk.Widget>> = Variable([]);

  // notify subscribers to rerender when state changes
  private notify() {
    this.notifications.set([...this.notificationMap.values()].reverse());
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
      if (DND.get()) return;
      this.set(
        id,
        Notification({
          n: notifd.get_notification(id)!,
          popup: true,
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
    this.notificationMap.get(key)?.destroy();
    this.notificationMap.set(key, value);
    this.notify();
  }

  private delete(key: number) {
    this.notificationMap.get(key)?.destroy();
    this.notificationMap.delete(key);
    this.notify();
  }

  // needed by the Subscribable interface
  get() {
    return this.notifications.get();
  }

  // needed by the Subscribable interface
  subscribe(callback: (list: Array<Gtk.Widget>) => void) {
    return this.notifications.subscribe(callback);
  }
}

export default (monitor: Gdk.Monitor) => {
  const { TOP, RIGHT } = Astal.WindowAnchor;
  const notifications = new NotificationMap();

  return (
    <window
      gdkmonitor={monitor}
      className="NotificationPopups"
      name="notification-popups"
      namespace="notification-popups"
      application={App}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.OVERLAY}
      anchor={TOP | RIGHT}
      margin={globalMargin}
      widthRequest={400}
      child={
        <box vertical vexpand={true} spacing={globalMargin} noImplicitDestroy>
          {bind(notifications)}
        </box>
      }></window>
  );
};
