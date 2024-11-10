import React, {memo} from 'react'
import {Handle, Position} from 'reactflow'
import Node from "./Node";
import {useTheme} from "@mui/material/styles";
import {NodeData} from "../Contexts";

export interface NodeWidgetProps {
    data: NodeData
}

export const NodeWidget = memo(({data}: NodeWidgetProps) => {
    const theme = useTheme()

    return (
        <>
            <Handle
                type="source"
                position={Position.Top}
                isConnectable={false}
                style={{backgroundColor: 'transparent', color: 'transparent'}}
            />
            <Node
                data={data.row}
                theme={theme}
                stats={data.stats}
            />
            <Handle
                type="target"
                position={Position.Bottom}
                isConnectable={false}
                style={{backgroundColor: 'transparent', color: 'transparent'}}
            />
        </>
    )
})

