import MainCard from "../MainCard";
import {Stats} from "./types"
import {Box, Grid, Table, TableBody, TableCell, TableContainer, TableRow, Typography} from "@mui/material";
import {formatBlocksToDiskSize, formatNumbers, formatTiming} from "../utils";
import {Row} from "./table/Row";
import React from "react";
import {ExclusiveTimingCell, getRowEstimateDirectionSymbol} from "./table/Cells";
import {GenericDetailsPopover} from "../GenericDetailsPopover";

interface OverallStatsProps {
    stats: Stats
}

export const OverallStats = ({stats}: OverallStatsProps) => {
    return (
        <TableContainer
            sx={{
                width: '100vw',
                overflowX: 'auto',
                position: 'relative',
                display: 'block',
                maxWidth: '100%',
                '& td, & th': {whiteSpace: 'nowrap'}
            }}
        >
            <Table
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
                <TableBody>
                    <TableRow
                        hover
                        role="checkbox"
                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        tabIndex={-1}
                        key={'1'}
                    >

                        <TableCell align="left">
                            Execution time: {formatTiming(stats.execution_time)}
                        </TableCell>
                        <TableCell align="left">
                            Planning time: {formatTiming(stats.planning_time)}
                        </TableCell>
                        <TableCell align="left">
                            Total reads from Disk: {formatBlocksToDiskSize(stats.max_blocks_read)}
                        </TableCell>
                        <TableCell align="left">
                            Total written to Disk: {formatBlocksToDiskSize(stats.max_blocks_written)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}