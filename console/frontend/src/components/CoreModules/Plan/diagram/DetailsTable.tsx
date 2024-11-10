import React, {useContext, useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import MainCard from "../../MainCard";
import {
    Box,
    Chip,
    Collapse,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {
    formatBlocksToDiskSize,
    formatNumbers,
    formatTiming, getEstimationColor,
    getPercentage,
    getPercentageColor
} from "../../utils";
import {
    BufferHitsCellCollapsedContent,
    BufferReadsCellCollapsedContent,
    BufferWrittenCellCollapsedContent, getRowEstimateDirectionSymbol,
    NodeStats,
    RowsCellCollapsedContent,
} from "../table/Cells";
import {ExpandMore} from "../ExpandMore";
import {CloseOutlined, DownOutlined, TableOutlined, WarningOutlined} from "@ant-design/icons";
import {useFocus} from "../hooks";
import {useParams} from "react-router-dom";
import {NodeData, TableTabsContext} from "../Contexts";
import {ButtonAction} from "../../Buttons";
import {PLAN_TABS_MAP} from "../../tabsMaps";
import {NumberTooltip} from "../../CustomTooltips";

export const DetailsTable = ({queryExplainerService}: { queryExplainerService: any }) => {
    const theme = useTheme();
    const {plan_id} = useParams();
    const [data, setData] = useState<NodeData>()
    const {closeFocusNavigation, focusedNodeId, switchToRow} = useFocus(data?.row?.node_id);
    const {setTabIndex} = useContext(TableTabsContext);

    useEffect(() => {
        if (focusedNodeId) {
            queryExplainerService
                .getQueryPlanNode(plan_id, focusedNodeId)
                .then((resp: NodeData) => setData(resp))
        } else {
            setData(null)
        }
    }, [focusedNodeId])

    return (
        <Collapse in={Boolean(data)} orientation='horizontal' unmountOnExit mountOnEnter>
            {Boolean(data) && (
                <MainCard content={false} sx={{width: '100%', minWidth: '25vw'}}>
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
                                <TableCell sx={{maxWidth: '50px'}}>
                                    <Stack direction='row' spacing={0}>
                                        <Typography variant="h4">{data.row.operation}</Typography>
                                        <Box sx={{flex: '1 1 100%'}}></Box>
                                        <ButtonAction
                                            icon={<TableOutlined style={{fontSize: '0.90rem', color: 'inherit'}}/>}
                                            onClick={async () => {
                                                // If the tab is set to, for example, Indexes, the app will crash because it won't find the row id
                                                // of the main table. Moreover, the switchToRow cannot happen asynchronously, thus we must wait
                                                // that setTabIndex has finished
                                                await setTabIndex(PLAN_TABS_MAP().table.index)
                                                switchToRow()
                                            }}
                                        />
                                        <ButtonAction
                                            onClick={closeFocusNavigation}
                                            icon={<CloseOutlined style={{fontSize: '0.90rem', color: 'inherit'}}/>}
                                        />
                                    </Stack>
                                </TableCell>
                            </TableHead>
                            <TableBody>
                                <TableRow
                                    tabIndex={-1}
                                    key={"exclusive"}
                                    id={"exclusive"}
                                >
                                    <TableCell
                                        style={{backgroundColor: getPercentageColor(data.row.exclusive, data.stats.execution_time, theme)}}>
                                        <b>Time:</b> {` `}
                                        {formatTiming(data.row.exclusive)}
                                    </TableCell>
                                </TableRow>

                                <TableRow
                                    tabIndex={-1}
                                    key={"inclusive"}
                                    id={"inclusive"}
                                >
                                    <TableCell
                                        style={{backgroundColor: getPercentageColor(data.row.inclusive, data.stats.execution_time, theme)}}>
                                        <b>Cumulative time:</b> {` `}
                                        {formatTiming(data.row.inclusive)}
                                    </TableCell>
                                </TableRow>


                                <Row
                                    name="Rows"
                                    mainValue={formatNumbers(data.row.rows.total)}
                                    color={getEstimationColor(data.row.rows.estimation_factor, theme)}
                                    showWarning={data.row.rows.estimation_factor >= 25}
                                >
                                    <RowsCellCollapsedContent row={data.row} expanded={true} stats={data.stats} theme={theme}/>
                                    <b>Rows estimation:</b> {` `}
                                    {getRowEstimateDirectionSymbol(data.row.rows.estimation_direction) + ' '}
                                    <NumberTooltip number={data.row.rows.estimation_factor}/>
                                </Row>

                                {data.row.does_contain_buffers && (
                                    <>
                                        <Row
                                            name="Reads"
                                            color={getPercentageColor(data.row.buffers.effective_blocks_read, data.stats.max_blocks_read, theme)}
                                            mainValue={formatBlocksToDiskSize(data.row.buffers.effective_blocks_read)}
                                            showWarning={getPercentage(data.row.buffers.effective_blocks_read, data.stats.max_blocks_read) >= 10}
                                        >
                                            <BufferReadsCellCollapsedContent row={data.row} expanded={true} stats={data.stats}
                                                                             theme={theme}/>
                                        </Row>

                                        <Row
                                            name="Written"
                                            color={getPercentageColor(data.row.buffers.effective_blocks_written, data.stats.max_blocks_written, theme)}
                                            mainValue={formatBlocksToDiskSize(data.row.buffers.effective_blocks_written)}
                                            showWarning={getPercentage(data.row.buffers.effective_blocks_written, data.stats.max_blocks_written) > 10}
                                        >
                                            <BufferWrittenCellCollapsedContent row={data.row} expanded={true} stats={data.stats}
                                                                               theme={theme}/>
                                        </Row>

                                        <Row
                                            name="Cache"
                                            mainValue={formatBlocksToDiskSize(data.row.buffers.effective_blocks_hits)}
                                        >
                                            <BufferHitsCellCollapsedContent row={data.row} expanded={true} stats={data.stats}
                                                                            theme={theme}/>
                                        </Row>
                                    </>
                                )}

                                <Row name="Info">
                                    <NodeStats row={data.row} expanded={true} stats={data.stats} theme={theme}/>
                                </Row>

                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            )}
        </Collapse>
    )
}

const Row = (props) => {
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <TableRow
            tabIndex={-1}
            key={"node"}
            id={"node"}
        >
            <TableCell>
                <ExpandMore
                    expand={expanded}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <DownOutlined style={{fontSize: '10px'}}/>
                </ExpandMore>
                <b>{props.name}</b>
                {props.showWarning && (
                    <Chip
                        style={{backgroundColor: props.color}}
                        sx={{ml: 1.25, pl: 2}}
                        icon={<WarningOutlined/>}
                    />
                )}
                <Collapse in={expanded}>
                    <Box sx={{pt: 2, pb: 1}}>
                        {props.mainValue}
                        {props.children && (<Box sx={{pt: 1}}>
                            {props.children}
                        </Box>)}
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    )
}