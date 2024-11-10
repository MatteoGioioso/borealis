export default function TableRow(theme) {
    return {
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&.MuiTableRow-root:hover td': {},
                }
            }
        }
    };
}
