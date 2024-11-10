import React from "react";
import {Box, Popover} from "@mui/material";
import {useTheme} from "@mui/material/styles";

interface PopoverProps {
    name: string,
    content: any,
    children: any,
    keepCloseCondition?: boolean,
    style?: any
}

export const GenericDetailsPopover = (props: PopoverProps) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        if (props.keepCloseCondition) return
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <span
                aria-owns={open ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                onClick={handlePopoverOpen}
                style={props.keepCloseCondition ? {} : {
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textDecorationColor: theme.palette.secondary.light
                }}
            >
                {props.children}
            </span>
            <Popover
                transitionDuration={200}
                id="mouse-over-popover"
                sx={{
                    ...props.style
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
            >
                <Box sx={{p: 1.2}}>
                    {props.content}
                </Box>
            </Popover>
        </>
    )
}

export const MouseOverPopover = (props: PopoverProps) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
           <span
               aria-owns={open ? 'mouse-over-popover' : undefined}
               aria-haspopup="true"
               onMouseEnter={handlePopoverOpen}
               onMouseLeave={handlePopoverClose}
               style={props.keepCloseCondition ? {} : {
                   cursor: 'pointer',
                   textDecoration: 'underline',
                   textDecorationColor: theme.palette.secondary.light
               }}
           >
                {props.children}
            </span>
            <Popover
                id="mouse-over-popover"
                sx={{
                    pointerEvents: 'none',
                    ...props.style
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                <Box sx={{p: 1.2}}>
                    {props.content}
                </Box>
            </Popover>
        </>
    );
}