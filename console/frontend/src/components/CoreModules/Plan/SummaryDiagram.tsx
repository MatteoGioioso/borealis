import React, {useMemo, useEffect} from 'react'
import ReactFlow, {
    Controls,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from 'reactflow'
import {SummaryTableProps} from './interfaces'
import 'reactflow/dist/style.css'
import {NodeWidget} from './diagram/NodeWidget'
import {EdgeWidget} from './diagram/EdgeWidget'
import {useTheme} from "@mui/material/styles";
import {calculateNodes, getLayoutedElements} from "../utils";
import {Grid} from "@mui/material";
import {DetailsTable} from "./diagram/DetailsTable";


// @ts-ignore
const elk = new ELK();

export const SummaryDiagram = ({summary, stats, queryExplainerService}: SummaryTableProps) => {
    const theme = useTheme();
    const {fitView, getNode} = useReactFlow()
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const nodeTypes = useMemo(() => ({special: NodeWidget}), [])
    const edgeTypes = useMemo(() => ({special: EdgeWidget}), [])


    useEffect(() => {
        const {initialNodes, initialEdges} = calculateNodes(summary, stats, theme)

        const elkOptions = {
            'elk.algorithm': 'layered',
            'elk.spacing.nodeNode': 80,
            'elk.layered.spacing.nodeNodeBetweenLayers': 80,
            'elk.direction': 'DOWN',
        };

        getLayoutedElements(elk, initialNodes, initialEdges, elkOptions, theme).then(({nodes: layoutedNodes, edges: layoutedEdges}) => {
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            window.requestAnimationFrame(() => fitView());
        });
    }, [summary])


    return (
        <Grid container>
            <Grid item xs={4} sx={{pr: 2}} position='absolute' zIndex='999'>
                <DetailsTable queryExplainerService={queryExplainerService} />
            </Grid>

            <Grid item xs={12}>
                <div style={{height: '78vh' ,width: 'auto', border: `solid 1px ${theme.palette.secondary.light}`, borderRadius: '10px'}}>
                    <ReactFlow
                        fitView
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        // This will cause "ResizeObserver loop completed with undelivered notifications".
                        // According to SO this can be ignored: https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
                        // onlyRenderVisibleElements
                        minZoom={0.1}
                    >
                        <Controls/>
                    </ReactFlow>
                </div>
            </Grid>
        </Grid>
    )
}