import {PlanRow, Stats} from "../types";
import {Box, Collapse, Grid, IconButton, TableCell, TableRow, Typography} from "@mui/material";
import React, {memo, useContext, useEffect, useState} from "react";
import {
    BufferHitsCell,
    BufferReadsCell,
    BufferWrittenCell,
    InfoCell,
    isColumnShowing,
    LoopsCell,
    RowsCell,
    RowsEstimationCell,
    ExclusiveTimingCell, InclusiveTimingCell
} from "./Cells";
import {useTheme} from "@mui/material/styles";
import {ApartmentOutlined, CloseOutlined, DownOutlined} from "@ant-design/icons";
import {ExpandMore} from "../ExpandMore";
import {useFocus} from "../hooks";
import {TableTabsContext} from "../Contexts";
import {PLAN_TABS_MAP} from "../../tabsMaps";

export interface RowProps {
    row: PlanRow
    stats: Stats
    hidedColumns: { [key: string]: boolean }
}


export const Row = memo(({row, stats, hidedColumns}: RowProps) => {
    const theme = useTheme();
    const {isFocused, switchToNode, isUnfocused, closeFocusNavigation, focus} = useFocus(row.node_id);
    const [expanded, setExpanded] = useState(isFocused);
    const [rowHovered, setRowHovered] = React.useState(false);
    const {setTabIndex} = useContext(TableTabsContext);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const getRowStyle = (): {} => {
        if (isFocused) {
            return {border: `2px solid ${theme.palette.secondary.main}`}
        }

        return {}
    }

    useEffect(() => {
        setExpanded(isFocused)
    }, [isFocused])


    const handleRowHover = () => {
        setRowHovered(true);
    };

    const handleRowLeave = () => {
        setRowHovered(false);
    };

    return (
        <TableRow
            role="checkbox"
            sx={{
                '&:last-child td, &:last-child th': {border: 0},
                '&:hover': {
                    backgroundColor: theme.palette.secondary[200]
                }
            }}
            tabIndex={-1}
            key={row.node_id}
            id={row.node_id}
            style={getRowStyle()}
            onMouseEnter={handleRowHover}
            onMouseLeave={handleRowLeave}
        >

            {
                [
                    {
                        id: 'exclusive',
                        label: 'Time',
                        component: <ExclusiveTimingCell row={row} expanded={expanded} stats={stats} theme={theme} hovered={rowHovered}/>
                    },
                    {
                        id: 'inclusive',
                        label: 'Cumulative Time',
                        component: <InclusiveTimingCell row={row} expanded={expanded} stats={stats} theme={theme} hovered={rowHovered}/>
                    },
                    {
                        id: 'rows',
                        label: 'Rows',
                        component: <RowsCell row={row} expanded={expanded} stats={stats} theme={theme} hovered={rowHovered}/>

                    },
                    {
                        id: 'rows_x',
                        label: 'Rows E',
                        component: <RowsEstimationCell row={row} expanded={expanded} stats={stats} theme={theme} hovered={rowHovered}/>

                    },
                    {
                        id: 'loops',
                        label: 'Loops',
                        component: <LoopsCell row={row} expanded={expanded} stats={stats}/>

                    },
                    {
                        id: 'reads',
                        label: 'Reads',
                        component: <BufferReadsCell row={row} expanded={expanded} stats={stats} theme={theme} hovered={rowHovered}/>

                    },
                    {
                        id: 'written',
                        label: 'Written',
                        component: <BufferWrittenCell row={row} expanded={expanded} stats={stats} theme={theme} hovered={rowHovered}/>

                    },
                    {
                        id: 'hits',
                        label: 'Cache',
                        component: <BufferHitsCell row={row} expanded={expanded} stats={stats} theme={theme}/>

                    },
                    {
                        id: 'node',
                        label: 'Node',
                        component: <InfoCell row={row} expanded={expanded} stats={stats} theme={theme}/>

                    },
                    {
                        id: 'actions',
                        label: '',
                        component: (
                            <TableCell>
                                <ExpandMore expand={expanded} onClick={handleExpandClick}>
                                    <DownOutlined style={{fontSize: '10px'}}/>
                                </ExpandMore>
                                <IconButton onClick={() => {
                                    setTabIndex(PLAN_TABS_MAP().diagram.index)
                                    // Probably a quirk or a bug with React flow, somehow setTimeout will help to focus on the now
                                    setTimeout(() => {
                                        switchToNode(row.node_id)
                                    })
                                }}>
                                    <ApartmentOutlined style={{fontSize: '10px'}}/>
                                </IconButton>
                                {isFocused && (
                                    <>
                                        <IconButton onClick={closeFocusNavigation}>
                                            <CloseOutlined style={{fontSize: '10px', color: 'inherit'}}/>
                                        </IconButton>
                                    </>
                                )}
                            </TableCell>
                        )

                    },
                ]
                    .filter(row => isColumnShowing(row.id, hidedColumns))
                    .map(value => value.component)

            }
        </TableRow>
    );
})