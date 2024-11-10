import {CustomToolTip, InfoToolTip} from "../CustomTooltips";
import {StopOutlined, WarningOutlined} from "@ant-design/icons";
import {Box, Stack, Table, TableCell, TableContainer, Typography} from "@mui/material";
import {formatNumbers, truncateText} from "../utils";
import React, {useState} from "react";
import {TopQueriesByFingerprintTableData, TopQueriesTableData} from "../../SelfHosted/services/Activities.service";
import {useTheme} from "@mui/material/styles";
import {getPopupWaitEventsSummary, PopupWaitEventsSummary} from "./utils";
import {MouseOverPopover} from "../GenericDetailsPopover";
import Plot from "react-plotly.js";
import {MetricInfo} from "../../SelfHosted/proto/analytics.pb";

export interface CellProps {
    tableData: TopQueriesByFingerprintTableData | TopQueriesTableData
    handleOpenQueryModel?: () => void
}

export const QueryTextCell = ({tableData, handleOpenQueryModel}: CellProps) => {
    const theme = useTheme();

    return (
        <TableCell
            onClick={() => !tableData.isNotExplainable && handleOpenQueryModel()}
        >
            {!tableData.isNotExplainable || (
                <>
                    <CustomToolTip
                        text={""}
                        maxChar={0}
                        info={"Query cannot be explained"}
                        children={<StopOutlined style={{color: theme.palette.error.main, fontSize: '0.8rem'}}/>}
                    />
                    <Box sx={{pr: 2, display: 'inline'}}/>
                </>
            )}
            {!tableData.isTruncated || (
                <>
                    <CustomToolTip
                        text={""}
                        maxChar={0}
                        info={"Query is truncated"}
                        children={<WarningOutlined style={{color: theme.palette.warning.main, fontSize: '0.8rem'}}/>}
                    />
                    <Box sx={{pr: 2, display: 'inline'}}/>
                </>
            )}
            <CustomToolTip text={""} maxChar={0} info={tableData.name} children={<code>{truncateText(tableData.name, 60)}</code>}/>
        </TableCell>
    )
}

export const QueryLoadCell = ({tableData}: CellProps) => {
    const [popData, setPopData] = useState<PopupWaitEventsSummary[]>([{color: "", x: 0, name: ""}]);

    return (
        <TableCell onMouseEnter={() => {
            setPopData(getPopupWaitEventsSummary(tableData));
        }}>
            <Stack direction='row' spacing={1}>
                <MouseOverPopover
                    name={"summary"}
                    content={
                        popData.map(d => (
                            <div key={d.name} style={{color: d.color}}>&#9632;
                                <p style={{
                                    color: '#2f2f2f',
                                    display: "inline"
                                }}>{d.name}: {formatNumbers(d.x)}</p>
                            </div>
                        ))}
                >
                    <Plot
                        data={tableData.aas.data}
                        layout={tableData.aas.layout}
                        config={{displayModeBar: false}}
                        style={{width: tableData.aas.upperRange * 4}}
                    />
                </MouseOverPopover>
                <Typography>
                    {formatNumbers(tableData.aas.total)}
                </Typography>
            </Stack>
        </TableCell>
    )
}

export const TableWrapper = (props) => {
    return (
        <TableContainer
            sx={{
                height: '50vh',
                width: '100vw',
                overflowX: 'auto',
                position: 'relative',
                display: 'block',
                maxWidth: '100%',
                '& td, & th': {whiteSpace: 'nowrap'},
                ...props.sx
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
                    }
                }}
            >
                {props.children}
            </Table>
        </TableContainer>
    )
}
export const Head = ({mapping}: { mapping: MetricInfo }) => {
    return (
        <TableCell
            key={mapping.key}
        >
            <InfoToolTip info={mapping.key} text={mapping.Title} maxChar={20}/>
        </TableCell>
    );
}