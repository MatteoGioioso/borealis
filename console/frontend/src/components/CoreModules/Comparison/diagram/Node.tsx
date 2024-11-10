import {
    Grid,
    Stack, Theme,
    Typography,
} from '@mui/material';
import React from "react";
import MainCard from "../../MainCard";
import {Node as ReactflowNodeProps} from 'reactflow'
import {NodeData} from "../../Plan/Contexts";
import {NodeChips} from "../../Plan/diagram/NodeChips";

interface NodeProps extends NodeData, ReactflowNodeProps {
    theme: Theme
}

const Node = ({row, stats, theme, selected}: NodeProps) => {
    return (
        <div
            id={`node_${row.node_id}`}
        >
            <MainCard
                border
                boxShadow
                sx={{cursor: 'pointer', p: 0, borderColor: selected ? theme.palette.primary.main : theme.palette.secondary.light}}
                contentSX={{p: '10px !important'}}
            >
                <Stack spacing={0.5}>

                    <Grid container alignItems="center">
                        <Typography variant="subtitle2" color="bold">
                            {row.operation}
                        </Typography>
                        <NodeChips data={row} theme={theme} stats={stats} />
                    </Grid>
                </Stack>
            </MainCard>
        </div>
    );
};

export default Node;