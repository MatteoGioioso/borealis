import React, {useEffect, useState} from 'react'
import {SummaryTableProps} from './interfaces'
import {
    Box,
    Button, Checkbox,
    Collapse,
    FormControlLabel, FormGroup, FormHelperText,
    FormLabel, Stack, Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar, Tooltip
} from '@mui/material';
import {headCells, isColumnShowing, RowsCellCollapsedContent} from "./table/Cells";
import {Row} from "./table/Row";
import MainCard from "../MainCard";
import {GenericDetailsPopover} from "../GenericDetailsPopover";
import {ExpandMore} from "./ExpandMore";
import {DownOutlined, SettingOutlined} from "@ant-design/icons";
import FormControl from "@mui/material/FormControl";

function OrderTableHead({hidedColumns}: { hidedColumns: { [key: string]: boolean } }) {
    return (
        <TableHead>
            <TableRow hover={false}>
                {headCells()
                    .filter(value => isColumnShowing(value.id, hidedColumns))
                    .map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                        >
                            <Tooltip title={headCell.description}>
                                <Box>{headCell.label}</Box>
                            </Tooltip>
                        </TableCell>
                    ))}
            </TableRow>
        </TableHead>
    );
}


function TableToolBar({setHidedColumns, hidedColumns}: { hidedColumns: { [key: string]: boolean }, setHidedColumns: any }) {
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHidedColumns(prevState => ({
            ...prevState,
            [event.target.name]: !event.target.checked
        }))
    };

    return (
        <>
            <Toolbar sx={{backgroundColor: '#fafafb'}} variant='dense'>
                <Box sx={{flex: '1 1 100%'}}></Box>
                <ExpandMore
                    expand={expanded}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <SettingOutlined />
                </ExpandMore>

            </Toolbar>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{display: 'flex'}}>
                    <FormControl sx={{m: 3}} component="fieldset" variant="standard">
                        <FormLabel component="legend">Visible columns</FormLabel>
                        <FormGroup>
                            <Stack direction='row'>
                                {headCells()
                                    .filter(value => value.label)
                                    .filter(value => value.id !== "node")
                                    .map(value => (
                                        <FormControlLabel
                                            key={value.id}
                                            control={
                                                <Checkbox checked={!hidedColumns[value.id]} onChange={handleChange} name={value.id}/>
                                            }
                                            label={value.label}
                                        />
                                    ))}
                            </Stack>
                        </FormGroup>
                    </FormControl>
                </Box>
            </Collapse>
        </>
    )
}

export function SummaryTable({summary, stats}: SummaryTableProps) {
    const [hidedColumns, setHidedColumns] = useState<{ [key: string]: boolean }>({})

    function hideBuffers() {
        if (!summary[0].does_contain_buffers) {
            setHidedColumns({'reads': true, 'written': true, 'hits': true})
        } else {
            setHidedColumns({'reads': false, 'written': false, 'hits': false})
        }
    }

    useEffect(() => {
        hideBuffers()
    }, [summary[0].does_contain_buffers]);

    useEffect(() => {
        hideBuffers()
    }, []);

    return (
        <MainCard content={false}>
            <TableToolBar hidedColumns={hidedColumns} setHidedColumns={setHidedColumns}/>
            <TableContainer
                id='summary-table-container'
                sx={{
                    width: '100vw',
                    maxHeight: '75vh',
                    position: 'relative',
                    display: 'block',
                    maxWidth: '100%',
                    '& td, & th': {whiteSpace: 'nowrap'}
                }}
            >
                <Table
                    stickyHeader
                    aria-labelledby="tableTitle"
                    sx={{
                        '& .MuiTableCell-root:first-of-type': {
                            pl: 2
                        },
                        '& .MuiTableCell-root:last-of-type': {
                            pr: 3
                        },
                        borderCollapse: 'collapse',
                    }}
                >
                    <OrderTableHead hidedColumns={hidedColumns}/>
                    <TableBody>
                        {summary.map((row) => {
                            return <Row row={row} stats={stats} hidedColumns={hidedColumns}/>;
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </MainCard>
    );
}
