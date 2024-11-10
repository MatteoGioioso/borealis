import React, {memo} from 'react'
import {Handle, Position} from 'reactflow'
import Node from "./Node";
import {useTheme} from "@mui/material/styles";
import {NodeData} from "../../Plan/Contexts";
import {Node as ReactflowNodeProps} from 'reactflow'

export interface NodeWidgetProps {
    data: NodeData
}

export const NodeWidget = memo(({data, ...otherProps}: NodeWidgetProps) => {
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
                theme={theme}
                {...data}
                {...otherProps as ReactflowNodeProps}
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

