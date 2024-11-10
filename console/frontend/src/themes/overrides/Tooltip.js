import { tooltipClasses } from '@mui/material/Tooltip';

export default function Tooltip(theme) {
    return {
        MuiTooltip: {
            styleOverrides: {

                tooltip: {
                    fontSize: '0.95rem',
                    border: `1px solid ${theme.palette.secondary.dark}`,
                    color: theme.palette.secondary.dark,
                    backgroundColor: theme.palette.secondary['A100'],
                    [`& .${tooltipClasses.arrow}`]: {
                        color: theme.palette.secondary['A100'],
                        '&::before': {
                            border: `1px solid ${theme.palette.secondary.dark}`,
                        }
                    },
                }
            }
        }
    }
}
