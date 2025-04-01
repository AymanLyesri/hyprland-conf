import { WidgetSelector } from "../interfaces/widgetSelector.interface";
import Calendar from "../widgets/Calendar";
import BooruViewer from "../widgets/leftPanel/components/BooruViewer";
import ChatBot from "../widgets/leftPanel/components/ChatBot";
import CustomScripts from "../widgets/leftPanel/components/CustomScripts";
import MediaWidget from "../widgets/MediaWidget";
import Waifu from "../widgets/rightPanel/components/Waifu";
import NotificationHistory from "../widgets/rightPanel/NotificationHistory";

import Workspaces from "../widgets/bar/components/Workspaces";
import Information from "../widgets/bar/components/Information";
import Utilities from "../widgets/bar/components/Utilities";


export const barWidgetSelectors: WidgetSelector[] = [
    {
        name: "workspaces",
        icon: "󰒘",
        widget: (monitorName: string) => Workspaces({ monitorName }),
    },
    {
        name: "information",
        icon: "󰒘",
        widget: (monitorName: string) => Information({ monitorName }),
    },
    {
        name: "utilities",
        icon: "󰒘",
        widget: (monitorName: string) => Utilities({ monitorName }),
    },
]

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
    {
        name: "CustomScripts",
        icon: "",
        widget: () => CustomScripts(),
    }
];