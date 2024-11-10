import {createContext, Dispatch, SetStateAction, useState} from "react";
import {IndexesStats, PlanRow, Stats} from "./types";

interface Explained {
    summary: PlanRow[]
    stats: Stats
    indexesStats: IndexesStats
}

export interface NodeData {
    row: PlanRow
    stats: Stats
}

interface NodeContextProps {
    focusedNodeId: string
    hoverNodeId: string
    nodeData: NodeData
    explained: Explained
    setFocusedNodeId: Dispatch<SetStateAction<string>>
    setHoverNodeId: Dispatch<SetStateAction<string>>
    setNodeData: Dispatch<SetStateAction<NodeData>>
    setExplained: Dispatch<SetStateAction<Explained>>
}

export const NodeContext = createContext<NodeContextProps>({
    focusedNodeId: '',
    hoverNodeId: '',
    nodeData: null,
    explained: null,
    setFocusedNodeId: value => {
    },
    setHoverNodeId: value => {
    },
    setNodeData: value => {
    },
    setExplained: value => {
    }
});

export function NodeProvider(props) {
    const [explained, setExplained] = useState<Explained>();
    const [focusedNodeId, setFocusedNodeId] = useState('');
    const [nodeData, setNodeData] = useState<NodeData>()
    const [hoverNodeId, setHoverNodeId] = useState('')

    return (
        <NodeContext.Provider
            value={{
                focusedNodeId, setFocusedNodeId, hoverNodeId, setHoverNodeId, nodeData, setNodeData, setExplained, explained
            }}
        >
            {props.children}
        </NodeContext.Provider>
    )
}

interface TableTabsProps {
    tabIndex: number
    setTabIndex: Dispatch<SetStateAction<number>>
}

export const TableTabsContext = createContext<TableTabsProps>({
    tabIndex: 0,
    setTabIndex: value => {
    }
})

export function TableTabsProvider(props) {
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <TableTabsContext.Provider value={{tabIndex, setTabIndex}}>
            {props.children}
        </TableTabsContext.Provider>
    )
}