import React, {useMemo, useEffect, useState, useCallback} from 'react'
import ReactFlow, {
    applyNodeChanges,
    Controls, Node, OnSelectionChangeParams, ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {NodeWidget} from './diagram/NodeWidget'
import {EdgeWidget} from './diagram/EdgeWidget'
import {useTheme} from "@mui/material/styles";
import {calculateNodes, getLayoutedElements} from "../utils";
import {Grid, Stack, Toolbar, Typography} from "@mui/material";
import {QueryPlan} from "../types";
import clone from 'just-clone';
import {NodeData} from "../Plan/Contexts";
import {NodeComparison, PlanRow} from "../Plan/types";
import {NodeComparisonTable} from "./NodeComparisonTable";

interface ComparisonDiagramsProps {
    plan: QueryPlan
    planToCompare: QueryPlan
    onClickPlanIdTitle: (id: string) => void
    onClickPlanToCompareIdTitle: (id: string) => void
    compareNode: (node: PlanRow, nodeToCompare: PlanRow) => Promise<NodeComparison>
}

// @ts-ignore
const elk = new ELK();

export const ComparisonDiagrams = ({
                                       planToCompare,
                                       plan,
                                       compareNode,
                                       onClickPlanToCompareIdTitle,
                                       onClickPlanIdTitle
                                   }: ComparisonDiagramsProps) => {
    const theme = useTheme();
    const [nodePairSelection, setNodePairSelection] = useState<{ [key: string]: PlanRow }>({nodeToCompare: null, node: null})
    const [nodeComparison, setNodeComparison] = useState<NodeComparison>(null)
    const {fitView, getNode} = useReactFlow()

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    const [nodesToCompare, setNodesToCompare, onNodesToCompareChange] = useNodesState([])
    const [edgesToCompare, setEdgesToCompare, onEdgesToCompareChange] = useEdgesState([])

    const nodeTypes = useMemo(() => ({special: NodeWidget}), [])
    const edgeTypes = useMemo(() => ({special: EdgeWidget}), [])

    const nodeTypesToCompare = useMemo(() => ({special: NodeWidget}), [])
    const edgeTypesToCompare = useMemo(() => ({special: EdgeWidget}), [])

    const onNodeSelected = useCallback((params: OnSelectionChangeParams) => {
        const node = params.nodes[0];
        if (!node) return

        setNodePairSelection(prevState => ({...prevState, node: node.data.row}))
    }, [])

    const onNodeSelectedToCompare = useCallback((params: OnSelectionChangeParams) => {
        const node = params.nodes[0];
        if (!node) return

        setNodePairSelection(prevState => ({...prevState, nodeToCompare: node.data.row}))
    }, [])

    useEffect(() => {
        const themeCopy = clone(theme)
        // @ts-ignore
        themeCopy.diagram.node.width = 200
        // @ts-ignore
        themeCopy.diagram.node.height = 50

        const {initialNodes, initialEdges} = calculateNodes(
            plan.summary,
            plan.stats,
            themeCopy,
            {draggable: false},
        )
        const {initialNodes: initialNodesToCompare, initialEdges: initialEdgesToCompare} = calculateNodes(
            planToCompare.summary,
            planToCompare.stats,
            themeCopy,
            {draggable: false},
        )

        const elkOptions = {
            'elk.algorithm': 'layered',
            'elk.spacing.nodeNode': 80,
            'elk.layered.spacing.nodeNodeBetweenLayers': 80,
            'elk.direction': 'DOWN',
        };

        getLayoutedElements(elk, initialNodes, initialEdges, elkOptions, themeCopy)
            .then(({nodes: layoutedNodes, edges: layoutedEdges}) => {
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
                window.requestAnimationFrame(() => fitView());
            });

        getLayoutedElements(elk, initialNodesToCompare, initialEdgesToCompare, elkOptions, themeCopy)
            .then(({nodes: layoutedNodes, edges: layoutedEdges}) => {
                setNodesToCompare(layoutedNodes);
                setEdgesToCompare(layoutedEdges);
                window.requestAnimationFrame(() => fitView());
            });

    }, [])

    useEffect(() => {
        if (nodePairSelection.nodeToCompare && nodePairSelection.node) {
            compareNode(nodePairSelection.node, nodePairSelection.nodeToCompare)
                .then(resp => setNodeComparison(resp))
        }
    }, [nodePairSelection]);


    const closeComparisonTable = () => {
        setNodeComparison(null)
    }

    return (
        <Grid container>
            <Grid item xs sx={{pt: 2, pr: 1}}>
                <Title plan={plan} label="Plan ID" onClick={onClickPlanIdTitle}/>
                <div style={{height: '75vh', width: 'auto', border: `solid 1px ${theme.palette.secondary.light}`, borderRadius: '10px'}}>
                    <ReactFlowProvider>
                        <ReactFlow
                            fitView
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            onSelectionChange={onNodeSelected}
                            minZoom={0.1}
                        >
                            <Controls/>

                        </ReactFlow>
                    </ReactFlowProvider>
                </div>
            </Grid>
            {Boolean(nodeComparison) && (
                <Grid item xs sx={{pt: 2, pr: 0}}>
                    <Typography variant='h5'>
                        Differences
                    </Typography>
                    <NodeComparisonTable
                        nodeComparison={nodeComparison}
                        planId={plan.id}
                        planIdToCompare={planToCompare.id}
                        closeComparisonTable={closeComparisonTable}
                    />
                </Grid>
            )}
            <Grid item xs sx={{pt: 2, pl: 1}}>
                <Title plan={planToCompare} label="Plan to compare ID" onClick={onClickPlanToCompareIdTitle}/>
                <div style={{height: '75vh', width: 'auto', border: `solid 1px ${theme.palette.secondary.light}`, borderRadius: '10px'}}>
                    <ReactFlowProvider>
                        <ReactFlow
                            fitView
                            nodes={nodesToCompare}
                            edges={edgesToCompare}
                            onNodesChange={onNodesToCompareChange}
                            onEdgesChange={onEdgesToCompareChange}
                            nodeTypes={nodeTypesToCompare}
                            edgeTypes={edgeTypesToCompare}
                            onSelectionChange={onNodeSelectedToCompare}
                            minZoom={0.1}
                        >
                            <Controls/>
                        </ReactFlow>
                    </ReactFlowProvider>
                </div>
            </Grid>
        </Grid>
    )
}

const Title = ({plan, label, onClick}: { plan: QueryPlan, label: string, onClick: any }) => {
    return (
        <Stack direction='row'>
            <Typography variant='h5'>
                {label}:
            </Typography>
            &nbsp;
            <Typography
                onClick={() => onClick(plan.id)}
                variant='h5'
                sx={{
                    cursor: 'pointer',
                    color: (theme) => theme.palette.primary.main,
                    '&:hover': {
                        color: (theme) => theme.palette.primary.dark,
                        textDecoration: 'underline'
                    }
                }}
            >
                {plan.id}
            </Typography>
        </Stack>
    )
}

export const SummaryComparisonDiagrams = (props: ComparisonDiagramsProps) => {
    return (
        <ComparisonDiagrams {...props}/>
    )
}