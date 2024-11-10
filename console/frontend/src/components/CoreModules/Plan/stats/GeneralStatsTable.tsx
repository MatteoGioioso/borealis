import MainCard from "../../MainCard";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import React from "react";
import {Stats} from "../types";
import {formatBlocksToDiskSize, formatNumbers, formatTiming, capitalizeFirstLetter} from "../../utils";

export interface GeneralStatsTableProps {
    stats: Stats
}

export const GeneralStatsTable = ({stats}: GeneralStatsTableProps) => {
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
                            <TableCell>
                                <Typography variant='h4'>
                                    General Stats
                                </Typography>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.keys(stats).map((s) => {
                            return <Row name={s} data={stats[s]}/>
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </MainCard>
    )
}

const Row = ({name, data}: { name: string, data: number }) => {
    // @ts-ignore
    const formattedName = capitalizeFirstLetter(name.replaceAll("_", " "))
    return (
        <TableRow
            hover
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
                <b>{getMeasure(formattedName, data)}</b>
            </TableCell>
            <TableCell>
                {data}
            </TableCell>
        </TableRow>
    )
}

const getMeasure = (name: string, data: number): string => {
    if (name.includes("time") || name.includes("duration")) {
        return formatTiming(data)
    } else if (name.includes("blocks")) {
        return formatBlocksToDiskSize(data)
    }

    return formatNumbers(data)
}