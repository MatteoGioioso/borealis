import {Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import React from "react";
import {formatBlocksToDiskSize, formatNumbers, formatTiming, capitalizeFirstLetter} from "../utils";
import MainCard from "../MainCard";
import {ComparisonGeneralStats, PropComparison} from "../Plan/types";
import {ArrowDownOutlined, ArrowUpOutlined, CheckOutlined, CloseOutlined, SwapRightOutlined} from "@ant-design/icons";
import {useTheme} from "@mui/material/styles";

export interface GeneralStatsComparisonTableProps {
    stats: ComparisonGeneralStats
}

export const GeneralStatsComparisonTable = ({stats}: GeneralStatsComparisonTableProps) => {
    return (
        <MainCard content={false} sx={{width: '40vw'}}>
            <TableContainer
                sx={{
                    overflowX: 'auto',
                    position: 'relative',
                    display: 'block',
                    maxWidth: '100%',
                    '& td, & th': {whiteSpace: 'nowrap'}
                }}
            >
                <Table
                    title={"General stats"}
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
                        {Object.keys(stats).map((s) => {
                            return <Row key={s} name={s} data={stats[s]}/>
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </MainCard>
    )
}

const Row = ({name, data}: { name: string, data: PropComparison }) => {
    const theme = useTheme();
    // @ts-ignore
    const formattedName = capitalizeFirstLetter(name.replaceAll("_", " "))
    return (
        <TableRow
            role="checkbox"
            sx={{'&:last-child td, &:last-child th': {border: 0}}}
            tabIndex={-1}
            key={name}
            id={name}
        >
            <TableCell>
                {formattedName}
            </TableCell>
            <TableCell>
                <Stack direction='row'>
                    <b>{getMeasure(formattedName, data.current)}</b>
                    <Box sx={{flex: '1 1 100%'}}></Box>
                    <SwapRightOutlined/>
                </Stack>
            </TableCell>
            <TableCell>
                <b>{getMeasure(formattedName, data.to_compare)}</b>
            </TableCell>
            {data.current === data.to_compare && <TableCell>-</TableCell>}
            {data.current !== data.to_compare && (
                <TableCell>
                    {data.has_improved
                        ? <CheckOutlined style={{color: theme.palette.success.main}}/>
                        : <CloseOutlined style={{color: theme.palette.error.main}}/>}
                </TableCell>
            )}
            {data.current === data.to_compare && <TableCell>-</TableCell>}
            {data.current !== data.to_compare && (
                <TableCell
                    style={{
                        backgroundColor: data.has_improved ? theme.palette.success.main : theme.palette.error.main,
                        color: data.has_improved ? 'inherit' : 'white'
                    }}
                >
                    {data.percentage_improved > 0 && "+"}{formatNumbers(data.percentage_improved)} %
                </TableCell>
            )}
        </TableRow>
    )
}

const headCells = [
    {
        id: 'name',
        label: 'Stat',
        align: 'left',
        description: ""
    },
    {
        id: 'plan_prev',
        label: 'Current Plan',
        align: 'left',
        description: ""
    },
    {
        id: 'optimized_plan',
        label: 'Optimized plan',
        align: 'left',
        description: ""
    },
    {
        id: 'has_improved',
        label: 'Outcome',
        align: 'left',
        description: ""
    },
    {
        id: 'difference',
        label: 'Difference',
        align: 'left',
        description: ""
    },
]

const getMeasure = (name: string, data: number): string => {
    if (name.includes("time") || name.includes("duration")) {
        return formatTiming(data)
    } else if (name.includes("blocks")) {
        return formatBlocksToDiskSize(data)
    }

    return formatNumbers(data)
}