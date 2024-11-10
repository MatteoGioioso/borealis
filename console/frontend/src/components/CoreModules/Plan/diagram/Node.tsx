import {
    Box,
    Chip,
    Grid,
    LinearProgress,
    LinearProgressProps,
    Stack, Tooltip,
    Typography,
} from '@mui/material';
import MainCard from '../../MainCard';
import {
    DollarOutlined,
    FallOutlined,
    FieldTimeOutlined, ForkOutlined, HddOutlined, Loading3QuartersOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import React from "react";
import {
    areRowsOverEstimated,
    formatNumbers, formatTiming,
    getEstimationColor,
    getPercentage,
    getPercentageColor,
} from "../../utils";
import {PlanRow, Stats} from "../types";
import {useFocus} from "../hooks";
import {GenericDetailsPopover} from "../../GenericDetailsPopover";
import {NodeChips} from "./NodeChips";

interface NodeProps {
    data: PlanRow
    theme: any
    stats: Stats
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number, time: number, theme: any, cellWarningColor: string }) {
    return (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Box sx={{width: '75%', mr: 1, position: 'relative'}}>
                <LinearProgress variant="determinate" value={props.value} sx={{
                    backgroundColor: props.theme.palette.secondary.lighter,
                    height: "20px",
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: props.cellWarningColor
                    }
                }}/>
                <Typography
                    color="text.primary"
                    style={{position: 'absolute', top: 0, left: "50%", transform: "translate(-50%)"}}
                >
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
            <Box sx={{width: 'auto'}}>
                <Typography color="text.primary">
                    {formatTiming(props.time)}
                </Typography>
            </Box>
        </Box>
    );
}

const Node = ({data, stats, theme}: NodeProps) => {
        const {isFocused, focus} = useFocus(data.node_id);
        const exclusiveTimeColor = getPercentageColor(data.exclusive, data.execution_time, theme);
        const exclusiveTimePercentage = getPercentage(data.exclusive, data.execution_time);

        const getStyle = () => {
            const hoverOrFocus = {
                width: 'auto',
                minWidth: theme.diagram.node.width,
                boxShadow: theme.customShadows.z1,
                border: `2px solid ${theme.palette.secondary.main} !important`
            }

            if (isFocused) {
                return hoverOrFocus
            }

            return {
                width: 'auto',
                minWidth: theme.diagram.node.width,
            }
        }

        return (
            <div
                id={`node_${data.node_id}`}
                onClick={focus}
            >
                <MainCard
                    contentSX={{p: 1.5}}
                    sx={getStyle()}
                    border
                    boxShadow
                >
                    <Stack spacing={0.5}>

                        <Grid container alignItems="center">
                            <Typography variant="h5" color="bold">
                                {data.operation}
                            </Typography>
                            <NodeChips data={data} theme={theme} stats={stats} />
                        </Grid>
                    </Stack>

                    {Boolean(data.exclusive) && (
                        <Box sx={{pt: 2, pb: 2}}>
                            <LinearProgressWithLabel
                                cellWarningColor={exclusiveTimeColor}
                                theme={theme}
                                value={exclusiveTimePercentage}
                                time={data.exclusive}
                            />
                        </Box>
                    )}

                    <Box sx={{pt: 1}}>
                        <Typography sx={{color: `${exclusiveTimeColor || 'primary'}.main`}}>
                            Rows returned: {` `}
                            <b>{formatNumbers(data.rows.total)}</b>
                        </Typography>{' '}
                    </Box>
                </MainCard>
            </div>
        );
    }
;

export default Node;