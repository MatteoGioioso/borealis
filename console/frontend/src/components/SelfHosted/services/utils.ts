import {Layout} from "plotly.js";

export const emptyLayout = (from, to): Layout => {
  return {
      barmode: 'stack',
      yaxis: {
          fixedrange: true,
      },
      xaxis: {
          range: [
              from,
              to,
          ],
          type: 'date',
      },
      hovermode: 'x unified',
  } as Layout
}