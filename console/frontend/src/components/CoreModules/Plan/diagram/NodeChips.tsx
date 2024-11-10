import {Chip, Grid, Tooltip} from "@mui/material";
import {
    DollarOutlined,
    FallOutlined,
    FieldTimeOutlined,
    ForkOutlined,
    HddOutlined,
    Loading3QuartersOutlined,
    RiseOutlined
} from "@ant-design/icons";
import {areRowsOverEstimated, formatNumbers, getEstimationColor, getPercentage, getPercentageColor} from "../../utils";
import React from "react";
import {PlanRow, Stats} from "../types";

interface NodeChipsProps {
    data: PlanRow
    theme: any
    stats: Stats
}

const iconStyle = {fontSize: '0.75rem', color: 'inherit'};

export const NodeChips = ({data, theme, stats}: NodeChipsProps) => {
    return (
        <Grid item>
            {Boolean(data.workers.launched) && (
                <Tooltip title={`Number of workers`}>
                    <Chip
                        style={{backgroundColor: theme.palette.primary['100'], cursor: 'inherit'}}
                        icon={<ForkOutlined style={iconStyle}/>}
                        sx={{ml: 1.25, pl: 1}}
                        label={data.workers.launched + 1}
                        size="small"
                    />
                </Tooltip>
            )}
            {Boolean(data.loops > 1) && (
                <Tooltip title={`Number of loops ${data.workers.launched > 0 ? 'per worker' : ''}`}>
                    <Chip
                        style={{backgroundColor: theme.palette.primary['100'], cursor: 'inherit'}}
                        icon={<Loading3QuartersOutlined style={iconStyle}/>}
                        sx={{ml: 1.25, pl: 1}}
                        label={formatNumbers(data.loops / (data.workers.launched + 1))}
                        size="small"
                    />
                </Tooltip>

            )}
            {getPercentage(data.exclusive, data.execution_time) > 15 && (
                <Tooltip title={`High exclusive time (${formatNumbers(getPercentage(data.exclusive, data.execution_time))})%`}>
                    <Chip
                        style={{backgroundColor: getPercentageColor(data.exclusive, data.execution_time, theme), cursor: 'inherit'}}
                        icon={<FieldTimeOutlined style={iconStyle}/>}
                        sx={{ml: 1.25, pl: 1}}
                        size="small"
                    />
                </Tooltip>
            )}
            {getPercentage(data.costs.total_cost, stats.max_cost) > 15 && (
                <Tooltip title={`High cost (${formatNumbers(getPercentage(data.costs.total_cost, stats.max_cost))})%`}>
                    <Chip
                        style={{backgroundColor: getPercentageColor(data.costs.total_cost, stats.max_cost, theme)}}
                        icon={<DollarOutlined style={iconStyle}/>}
                        sx={{ml: 1.25, pl: 1}}
                        size="small"
                    />
                </Tooltip>
            )}
            {(data.rows.estimation_factor > 10) && (
                <Tooltip
                    title={`${areRowsOverEstimated(data.rows.estimation_direction) ? 'Rows over-estimated' : 'Rows under-estimated'}`}>
                    <Chip
                        style={{backgroundColor: getEstimationColor(data.rows.estimation_factor, theme)}}
                        icon={
                            <>
                                {areRowsOverEstimated(data.rows.estimation_direction) ?
                                    <RiseOutlined style={iconStyle}/> :
                                    <FallOutlined style={iconStyle}/>
                                }
                            </>
                        }
                        sx={{ml: 1.25, pl: 1}}
                        size="small"
                    />
                </Tooltip>
            )}
            {(getPercentage(data.buffers.effective_blocks_read, stats.max_blocks_read) >= 10
                || getPercentage(data.buffers.effective_blocks_written, stats.max_blocks_written) >= 10) && (
                <Tooltip title={`High disk usage`}>
                    <Chip
                        style={{
                            backgroundColor: getPercentageColor(
                                Math.max(data.buffers.effective_blocks_read, data.buffers.effective_blocks_written),
                                stats.max_blocks_read,
                                theme
                            )
                        }}
                        icon={<HddOutlined style={iconStyle}/>}
                        sx={{ml: 1.25, pl: 1}}
                        size="small"
                    />
                </Tooltip>
            )}
            {data.cte_sub_plan_of && (
                <Tooltip title={`CTE:  ${data.cte_sub_plan_of}`}>
                    <Chip
                        style={{backgroundColor: theme.palette.secondary.light}}
                        sx={{ml: 1.25}}
                        size="small"
                        label="CTE"
                    />
                </Tooltip>
            )}
            {data.sub_plan_of && (
                <Tooltip title={`SubPlan:  ${data.sub_plan_of}`}>
                    <Chip
                        style={{backgroundColor: theme.palette.secondary.light}}
                        sx={{ml: 1.25}}
                        size="small"
                        label="SubPlan"
                    />
                </Tooltip>
            )}
        </Grid>
    )
}