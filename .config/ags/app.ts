import { App } from "astal/gtk3"
import Bar from "./widgets/bar/Bar"
import { getCssPath } from "./utils/scss"

App.start({
    css: getCssPath(),
    main()
    {
        App.get_monitors().map(Bar)
    },
})
