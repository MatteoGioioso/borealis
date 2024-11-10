import {Tooltip, Typography} from "@mui/material";
import React from "react";
import {formatBigNumbers, formatNumbers, formatTiming, truncateText} from "./utils";

interface CustomTooltipProps {
    text: string
    maxChar: number
    info?: string | number
    children?: any
}

export const CustomToolTip = ({children, info, ...props}: CustomTooltipProps) => {
    return (
        <Tooltip
            arrow
            title={info}
            {...props}
        >
            {/* @ts-ignore */}
            {getTooltipContent(children, true)}
        </Tooltip>
    )
}

export const InfoToolTip = ({text, info, maxChar, ...props}: CustomTooltipProps) => {
    return (
        <Tooltip
            arrow
            title={info}
            {...props}
        >
            {/* @ts-ignore */}
            {getTooltipContent(truncateText(text, maxChar), true)}
        </Tooltip>
    )
}

export const TextTooltip = ({text, maxChar, ...props}: CustomTooltipProps) => {
    return (
        <Tooltip
            arrow
            title={text}
            {...props}
        >
            {/* @ts-ignore */}
            {getTooltipContent(truncateText(text, maxChar), true)}
        </Tooltip>
    )
}

interface NumberTooltipProps {
    number: number
}

export const NumberTooltip = ({number, ...props}: NumberTooltipProps) => {
    const MIN_NUMBER = 999
    return (
        <Tooltip
            disableHoverListener={number < MIN_NUMBER}
            arrow
            title={formatBigNumbers(number)}
            {...props}
        >
            {getTooltipContent(formatNumbers(number), number > MIN_NUMBER)}
        </Tooltip>
    )
}

export const TimingTooltip = ({number, ...props}: NumberTooltipProps) => {
    const MIN_MILLIS = 999
    return (
        <Tooltip
            disableHoverListener={number < MIN_MILLIS}
            arrow
            title={`${formatBigNumbers(number)} ms`}
            {...props}
        >
            {getTooltipContent(formatTiming(number), number > MIN_MILLIS)}
        </Tooltip>
    )
}

function getTooltipContent(children: any, isEnabled: boolean) {
    return <Typography
        component='span'
        sx={{
            cursor: isEnabled && 'pointer',
            textDecoration: isEnabled && 'underline',
            width: 'fit-content',
            textDecorationColor: theme => theme.palette.secondary.light,
            fontWeight: 'inherit'
        }}
    >
        {children}
    </Typography>;
}
