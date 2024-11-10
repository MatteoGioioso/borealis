import {
    Alert,
    AlertTitle,
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip
} from "@mui/material";
import React from "react";
import {formatBlocksToDiskSize, formatNumbers, formatTiming, capitalizeFirstLetter, truncateText, formatBigNumbers} from "../utils";
import MainCard from "../MainCard";
import {NodeComparison, PropComparison, PropStringComparison} from "../Plan/types";
import {CheckOutlined, CloseOutlined, ReadOutlined, SwapRightOutlined} from "@ant-design/icons";
import {useTheme} from "@mui/material/styles";
import {GenericDetailsPopover} from "../GenericDetailsPopover";

export interface NodeComparisonTableProps {
    nodeComparison: NodeComparison
    planId: string
    planIdToCompare: string
    closeComparisonTable: (e: any) => void
}

export const NodeComparisonTable = ({nodeComparison, planId, planIdToCompare, closeComparisonTable}: NodeComparisonTableProps) => {
    return (
        <MainCard content={false}>
            <TableContainer
                sx={{
                    height: '75vh',
                    overflowX: 'auto',
                    position: 'relative',
                    display: 'block',
                    maxWidth: '100%',
                    '& td, & th': {whiteSpace: 'nowrap'}
                }}
            >

                <Toolbar variant='dense'>
                    <Box sx={{flex: '1 1 100%'}}></Box>
                    <CloseOutlined onClick={closeComparisonTable}/>
                </Toolbar>

                {nodeComparison?.warnings?.length > 0 && (
                    <Alert sx={{width: '100%'}} severity="error">
                        <AlertTitle>Probable meaningless comparison</AlertTitle>
                        {nodeComparison.warnings.map(w => (
                            <p>{w}</p>
                        ))}
                    </Alert>
                )}

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
                    <TableHead>
                        <TableRow>
                            {headCells(planId, planIdToCompare).map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    sx={{fontSize: '13px'}}
                                >
                                    {headCell.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.keys(nodeComparison).map(propName => (getRow(propName, nodeComparison[propName])))}
                        {Object.keys(nodeComparison.rows).map(rowPropName => (
                            <Row key={rowPropName} name={rowPropName} data={nodeComparison.rows[rowPropName]}/>
                        ))}
                        {Object.keys(nodeComparison.buffers).map(bufferName => (
                            <Row key={bufferName} name={bufferName} data={nodeComparison.buffers[bufferName]}/>
                        ))}
                        {Object.keys(nodeComparison.costs).map(costProp => (
                            <Row key={costProp} name={costProp} data={nodeComparison.costs[costProp]}/>
                        ))}
                        {Object.keys(nodeComparison.scopes).map(scopeName => (
                            <StringRow key={scopeName} name={scopeName} data={nodeComparison.scopes[scopeName]}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </MainCard>
    )
}

const Row = ({name, data}: { name: string, data: PropComparison }) => {
    return (data.current !== data.to_compare) &&
        <TableRow
            role="checkbox"
            sx={{'&:last-child td, &:last-child th': {border: 0}}}
            tabIndex={-1}
            key={name}
            id={name}
        >
            <PropComparisonCells name={name} data={data as PropComparison}/>
        </TableRow>
}

const StringRow = ({name, data}: { name: string, data: PropStringComparison }) => {
    return (data.original || data.to_compare) &&
        <TableRow
            role="checkbox"
            sx={{'&:last-child td, &:last-child th': {border: 0}}}
            tabIndex={-1}
            key={name}
            id={name}
        >
            <StringComparisonCells name={name} data={data}/>
        </TableRow>

}


const getRow = (name: string, data: PropComparison) => {
    switch (name) {
        case "inclusive_time":
        case "loops":
        case "exclusive_time":
        case "execution_time":
            return (data.current !== data.to_compare) &&
                <TableRow
                    role="checkbox"
                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                    tabIndex={-1}
                    key={name}
                    id={name}
                >
                    <PropComparisonCells name={name} data={data as PropComparison}/>
                </TableRow>
    }
}

const PropComparisonCells = ({data, name}: { data: PropComparison, name: string }) => {
    const theme = useTheme();
    // @ts-ignore
    const formattedName = capitalizeFirstLetter(name.replaceAll("_", " "))
    return (
        <>
            <TableCell>
                {formattedName}
            </TableCell>
            <TableCell>
                <Stack direction='row'>
                    <Tooltip arrow title={`${formatBigNumbers(data.current)} ${getUnit(name)}`}>
                        <b>{getMeasure(formattedName, data.current)}</b>
                    </Tooltip>
                    <Box sx={{flex: '1 1 100%'}}></Box>
                    <SwapRightOutlined/>
                </Stack>
            </TableCell>
            <TableCell>
                <Tooltip arrow title={`${formatBigNumbers(data.to_compare)} ${getUnit(name)}`}>
                    <b>{getMeasure(formattedName, data.to_compare)}</b>
                </Tooltip>
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
        </>
    )
}

const StringComparisonCells = ({data, name}: { data: PropStringComparison, name: string }) => {
    const theme = useTheme();
    // @ts-ignore
    const formattedName = capitalizeFirstLetter(name.replaceAll("_", " "))
    return (
        <>
            <TableCell>
                {formattedName}
            </TableCell>
            <TableCell>
                {Boolean(data.original) && (
                    <GenericDetailsPopover name={"scopes"} content={<code>{data.original}</code>}>
                        <ReadOutlined/>
                    </GenericDetailsPopover>
                )}
            </TableCell>
            <TableCell>
                {Boolean(data.to_compare) && (
                    <GenericDetailsPopover name={"scopes to compare"} content={<code>{data.to_compare}</code>}>
                        <ReadOutlined/>
                    </GenericDetailsPopover>
                )}
            </TableCell>
            <TableCell>
                {data.are_same
                    ? <CheckOutlined style={{color: theme.palette.success.main}}/>
                    : <CloseOutlined style={{color: theme.palette.error.main}}/>}
            </TableCell>
            <TableCell></TableCell>
        </>
    )
}


const headCells = (planId: string, planIdToCompare: string) => [
    {
        id: 'name',
        label: 'Stat',
        align: 'left',
        description: ""
    },
    {
        id: 'plan_prev',
        label: planId,
        align: 'left',
        description: ""
    },
    {
        id: 'optimized_plan',
        label: planIdToCompare,
        align: 'left',
        description: ""
    },
    {
        id: 'has_improved',
        label: '',
        align: 'left',
        description: ""
    },
    {
        id: 'difference',
        label: '',
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

const getUnit = (name: string): string => {
    if (name.includes("time") || name.includes("duration")) {
        return 'ms'
    } else if (name.includes("blocks")) {
        return 'blocks'
    }

    return ''
}

const keepClose = (data: number, name: string): boolean => {
    if (name.includes("blocks")) {
        return data === 0
    }
    return data === 0 || data < 100
}