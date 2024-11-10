import React, {FC} from 'react'
import {EdgeProps, getBezierPath} from 'reactflow'

export const EdgeWidget: FC<EdgeProps> = ({
                                              id,
                                              sourceX,
                                              sourceY,
                                              targetX,
                                              targetY,
                                              sourcePosition,
                                              targetPosition,
                                              markerEnd,
                                              data,
                                              style
                                          }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    return (
        <>
            <path id={id} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} style={style}/>
        </>
    )
}