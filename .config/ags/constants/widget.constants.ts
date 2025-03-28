import { WidgetSelector } from "../interfaces/widgetSelector.interface";
import Calendar from "../widgets/Calendar";
import BooruViewer from "../widgets/leftPanel/BooruViewer";
import ChatBot from "../widgets/leftPanel/ChatBot";
import MediaWidget from "../widgets/MediaWidget";
import Waifu from "../widgets/rightPanel/components/Waifu";
import NotificationHistory from "../widgets/rightPanel/NotificationHistory";

export const rightPanelWidgetSelectors: WidgetSelector[] = [
    {
        name: "Waifu",
        icon: "",
        widget: () => Waifu(),
    },
    {
        name: "Media",
        icon: "",
        widget: () => MediaWidget(),
    },
    {
        name: "NotificationHistory",
        icon: "",
        widget: () => NotificationHistory(),
    },
    {
        name: "Calendar",
        icon: "",
        widget: () => Calendar(),
    },
    // {
    //   name: "Resources",
    //   icon: "",
    //   widget: () => Resources(),
    // },
    // {
    //   name: "Update",
    //   icon: "󰚰",
    //   widget: () => Update(),
    // },
];

export const leftPanelWidgetSelectors: WidgetSelector[] = [
    {
        name: "ChatBot",
        icon: "",
        widget: () => ChatBot(),
    },
    {
        name: "BooruViewer",
        icon: "",
        widget: () => BooruViewer(),
    },
];