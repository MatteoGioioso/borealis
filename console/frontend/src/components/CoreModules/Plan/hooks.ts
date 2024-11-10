import {useReactFlow} from "reactflow";
import {useContext, useEffect, useState} from "react";
import {NodeContext} from "./Contexts";

export const useFocus = (nodeId?: string) => {
    const {focusedNodeId, setFocusedNodeId} = useContext(NodeContext);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [nodeIdFromHash, setNodeIdFromHash] = useState<string>();
    const {getNode, fitView, addNodes} = useReactFlow();

    useEffect(() => {
        setNodeIdFromHash(focusedNodeId)

        if (focusedNodeId == nodeId) {
            setIsFocused(true)
        } else {
            setIsFocused(false)
        }
    }, [focusedNodeId])

    const focusInternal = () => {
        setFocusedNodeId(nodeId)
        const node = getNode(nodeId);
        fitView({nodes: [node], duration: 800, maxZoom: 1.25})
    }

    const scrollToElement = (id: string): void => {
        const yOffset = -200;
        const element = document.getElementById(id);
        const tableContainer = document.getElementById('summary-table-container')
        const y = element.getBoundingClientRect().top + yOffset;
        tableContainer.scrollTo({top: y, behavior: 'smooth'});
    }

    return {
        isFocused,
        focus: (): void => {
            focusInternal()
        },
        isUnfocused: (): boolean => {
            if (nodeIdFromHash) {
                return nodeIdFromHash !== nodeId
            } else {
                return false
            }
        },
        closeFocusNavigation: () => {
            setFocusedNodeId('')
            fitView({duration: 800})
        },
        switchToNode: (nodeIdv?: string) => {
            setFocusedNodeId(nodeId)
            const node = getNode(nodeId);
            fitView({nodes: [node], duration: 800, maxZoom: 1.5})
        },
        switchToRow: () => {
            setFocusedNodeId(nodeId)
            scrollToElement(nodeId)
        },
        focusedNodeId
    }
}