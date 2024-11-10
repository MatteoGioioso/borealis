import MainCard from "../../MainCard";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import React from "react";
import {Trigger} from "../types";
import {formatBlocksToDiskSize, formatNumbers, formatTiming, capitalizeFirstLetter, getPercentageColor} from "../../utils";

export interface TriggersStatsTableProps {
    stats: Trigger[]
    executionTime: number
}

export const TriggersStatsTable = ({stats, executionTime}: TriggersStatsTableProps) => {
    return (
        <MainCard content={false} sx={{width: '50vw'}}>
            <TableContainer>
                <Table
                    title={"Triggers stats"}
                    aria-labelledby="tableTitle"
                    sx={{
                        '& .MuiTableCell-root:first-of-type': {
                            pl: 2
                        },
                        '& .MuiTableCell-root:last-of-type': {
                            pr: 3
                        }
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant='h4'>
                                    Triggers
                                </Typography>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                >
                                    {headCell.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stats.map((trigger) => {
                            return <Row trigger={trigger} executionTime={executionTime}/>
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </MainCard>
    )
}

const Row = ({trigger, executionTime}: { trigger: Trigger, executionTime: number }) => {
    // @ts-ignore
    return (
        <TableRow
            hover
            role="checkbox"
            sx={{'&:last-child td, &:last-child th': {border: 0}}}
            tabIndex={-1}
            key={trigger.name}
            id={trigger.name}
        >
            <TableCell>
                {trigger.name}
            </TableCell>
            <TableCell sx={{backgroundColor: (theme) => getPercentageColor(trigger.time, executionTime, theme)}}>
                <b>{formatTiming(trigger.time)}</b>
            </TableCell>
            <TableCell>
                {trigger.calls}
            </TableCell>
            <TableCell>
                {formatTiming(trigger.avg_time)}
            </TableCell>
        </TableRow>
    )
}

const headCells = [
    {
        id: 'name',
        label: 'Name',
        align: 'left',
        description: ""
    },
    {
        id: 'formatted',
        label: 'Time',
        align: 'left',
        description: ""
    },
    {
        id: 'full',
        label: 'Calls',
        align: 'left',
        description: ""
    },
    {
        id: 'avg_time',
        label: 'Average time'
    }
]

const getMeasure = (name: string, data: number): string => {
    if (name.includes("time") || name.includes("duration")) {
        return formatTiming(data)
    } else if (name.includes("blocks")) {
        return formatBlocksToDiskSize(data)
    }

    return formatNumbers(data)
}