import { App } from "astal/gtk3"
import Bar from "./widgets/bar/Bar"
import { getCssPath } from "./utils/scss"
import RightPanel from "./widgets/rightPanel/RightPanel"
import RightPanelHover from "./widgets/rightPanel/RightPanelHover"

App.start({
    css: getCssPath(),
    main()
    {
        Bar()
        RightPanel()
        RightPanelHover()

        console.log("App started");

    },
})
