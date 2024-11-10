import {Link as RouterLink} from "react-router-dom";
import {Box, Button, ButtonProps, IconButtonProps, Stack, Typography} from "@mui/material";
import React from "react";
import {styled} from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import {UploadOutlined} from "@ant-design/icons";

interface ButtonActionProps extends ButtonProps {
    title?: string
    icon?: React.JSX.Element
    reverseIconPosition?: boolean
}

interface ButtonLinkProps extends ButtonActionProps {
    to: string
}

interface UploadButtonProps extends IconButtonProps {
    onUpload: any
}


export const ButtonLink = ({title, to, icon, sx, ...buttonProps}: ButtonLinkProps) => {
    return (
        // @ts-ignore
        <Button component={RouterLink} to={to} sx={{ml: 1, pt: 0.3, pb: 0.3, pl: 3, pr: 3, ...sx}} {...buttonProps}>
            <ButtonInternal title={title} icon={icon}/>
        </Button>
    )
}

export const ButtonAction = ({title, icon, reverseIconPosition, sx, ...buttonProps}: ButtonActionProps) => {
    return (
        // @ts-ignore
        <Button sx={{ml: 1, pt: 0.3, pb: 0.3, pl: 3, pr: 3, ...sx}} {...buttonProps}>
            <ButtonInternal title={title} icon={icon} reverseIconPosition={reverseIconPosition}/>
        </Button>
    )
}

const ButtonInternal = ({title, icon, reverseIconPosition}: ButtonActionProps) => {
    return (
        <Box sx={{flexShrink: 0}}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{p: 0.5}}>
                {reverseIconPosition && Boolean(icon) && icon}
                {Boolean(title) && <Typography variant="subtitle1">{title}</Typography>}
                {reverseIconPosition || Boolean(icon) && icon}
            </Stack>
        </Box>
    )
}

const Input = styled('input')({
    display: 'none',
});

export function UploadButton({onUpload, ...iconButtonProps}: UploadButtonProps) {
    return (
        <label htmlFor="icon-button-file">
            <Input accept="application/json" id="icon-button-file" type="file" onInput={onUpload}/>
            <IconButton
                sx={{ml: 1, pt: 0.3, pb: 0.3, pl: 3, pr: 3}}
                color="secondary"
                aria-label="upload plan"
                component="span"
                /* @ts-ignore */
                {...iconButtonProps}
            >
                <UploadOutlined/>
            </IconButton>
        </label>
    );
}