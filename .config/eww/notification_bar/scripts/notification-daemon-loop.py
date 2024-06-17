import json
import dbus
import dbus.service
from dbus.mainloop.glib import DBusGMainLoop
from gi.repository import GLib
import threading
import time
from PIL import Image


class Notification:
    def __init__(self, summary, body, icon):
        self.summary = summary
        self.body = body
        self.icon = icon


notifications = []


def write_to_file(notification):
    path = "notification_bar/json/history.json"
    try:
        with open(path, "r") as f:
            data = json.load(f)
    except (FileNotFoundError, ValueError):
        data = []

    # Prepend the new notification to the beginning of the list
    data.insert(0, {"summary": notification.summary,
                "body": notification.body})

    # Keep only the last 20 notifications
    data = data[:20]

    with open(path, "w") as f:
        json.dump(data, f, indent=4)


def remove_object(notif):
    time.sleep(5)
    notifications.remove(notif)
    print_state()


def add_object(notif):
    notifications.insert(0, notif)
    write_to_file(notif)
    print_state()
    timer_thread = threading.Thread(target=remove_object, args=(notif,))
    timer_thread.start()


def print_state():

    string = "["
    for item in notifications:
        string = string + \
            f"[\"{item.icon or ''}\",\"{
                item.summary or ''}\",\"{item.body or ''}\"],"

    string = string.rstrip(",") + "]"
    print(string, flush=True)


# def convert_dbus_bytes_to_image(byte_list, width=64, height=64):
#     print("Converting byte data to image")
#     # Convert dbus.Byte to a bytes object
#     byte_data = bytes(byte_list)

#     print(byte_data)

#     # Create an image from byte data
#     image = Image.frombytes('RGB', (width, height), byte_data)

#     return image


class NotificationServer(dbus.service.Object):
    def __init__(self):
        bus_name = dbus.service.BusName(
            'org.freedesktop.Notifications', bus=dbus.SessionBus())
        dbus.service.Object.__init__(
            self, bus_name, '/org/freedesktop/Notifications')

    @dbus.service.method('org.freedesktop.Notifications', in_signature='susssasa{ss}i', out_signature='u')
    def Notify(self, app_name, replaces_id, app_icon, summary, body, actions, hints, timeout):
        # print("Received Notification:")
        # print("  App Name:", app_name[:10])
        # print("  Replaces ID:", replaces_id[:10])
        # print("  App Icon:", app_icon[:10])
        # print("  Summary:", summary[:10])
        # print("  Body:", body[:10])
        # print("  Actions:", actions)
        # print("  Hints:", hints)
        # icon_data = hints.get('icon_data', None)
        # if icon_data:
        #     print("saving image")
        #     # print(icon_data)

        #     # Extract the byte data from dbus.Byte list
        #     byte_list = [int(byte) for byte in icon_data]
        #     print("converting to image")
        #     image = convert_dbus_bytes_to_image(byte_list)
        #     print(image)
        #     image.save('icon_image.png')  # Save the image as PNG file
        # print("  Timeout:", timeout[:10])
        add_object(Notification(summary, body, app_icon))
        return 0

    @dbus.service.method('org.freedesktop.Notifications', out_signature='ssss')
    def GetServerInformation(self):
        return ("Custom Notification Server", "ExampleNS", "1.0", "1.2")


DBusGMainLoop(set_as_default=True)

if __name__ == '__main__':
    server = NotificationServer()
    mainloop = GLib.MainLoop()
    mainloop.run()
