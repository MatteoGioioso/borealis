import {getPercentageColor} from "./utils";

test('percentage color', () => {
    const theme = {palette: {error: {main: "main_error", dark: "dark_error"}}}
    const percentageColor = getPercentageColor(2, 0, theme, false);
    expect(percentageColor).toBe("main_error")
})