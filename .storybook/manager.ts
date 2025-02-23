import { addons } from "@storybook/addons"
import { themes } from "@storybook/theming"
import { ThemeVars } from "storybook/internal/theming"

addons.setConfig({
  theme: themes.dark as ThemeVars
})
