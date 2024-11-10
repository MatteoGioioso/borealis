import {PlanRow, Property, Stats} from "./Plan/types";
import {Edge, Node, Position} from "reactflow";
import {Theme} from "@mui/material";

export const formatNumbers = (num: number): string => {
    const ONE_MILLION = 1000000
    const THOUSAND = 1000
    const HUNDRED = 100
    const TEN = 10
    const ONE = 1

    if (num >= ONE_MILLION) {
        return `${Math.floor(num / ONE_MILLION)} Mil`
    }

    if (num >= THOUSAND) {
        return `${Math.floor(num / THOUSAND)} K`
    }

    if (num < THOUSAND && num >= HUNDRED) {
        return `${Math.floor(num)}`
    }

    if (num <= HUNDRED && num >= TEN) {
        return `${Math.floor(num * 100) / 100}`
    }

    if (num <= TEN && num >= ONE) {
        return `${Math.floor(num * 100) / 100}`
    }

    if (num <= ONE) {
        if (num <= 1/1000) {
            return "< 0.001"
        }
        return `${Math.floor(num * 1000) / 1000}`
    }

    return num.toString()
}

export function formatTiming(milliseconds: number): string {
    const seconds = Math.round(milliseconds / 1000);

    if (seconds < 1) {
        return Math.floor(milliseconds * 1000) / 1000 + ' ms';
    } else if (seconds < 60) {
        const secs = milliseconds / 1000
        return Math.round(secs * 100) / 100 + ' s';
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return minutes + ' min';
    } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return hours + ' h';
    } else {
        const days = Math.floor(seconds / 86400);
        return days + ' d';
    }
}

export function formatDate(date: string | Date): string {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    } as Intl.DateTimeFormatOptions;
    const d = new Date(date);
    return d.toLocaleDateString("en-US", options)
}

export function formatBlocksToDiskSize(blocks: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let size = blocks * 8192;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function formatDiskSize(diskSize: number): string {
    const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;

    while (diskSize >= 1024 && unitIndex < units.length - 1) {
        diskSize /= 1024;
        unitIndex++;
    }

    return `${diskSize.toFixed(2)} ${units[unitIndex]}`;
}

export function formatBigNumbers(n: number) {
    if (Number.isSafeInteger(n)) return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return n.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const getFunctionFromKind = (kind: string) => {
    const kindMap = {
        "timing": formatTiming,
        "quantity": formatNumbers,
        "blocks": formatBlocksToDiskSize,
        "disk_size": formatDiskSize,
        "": (val: any) => val
    }

    return kindMap[kind]
}

export function getPercentageColor(reference: number, total: number, theme?: any, hovered?: boolean): string {
    if (total === undefined) return !hovered ? theme.palette.secondary.A100 : theme.palette.secondary[200]

    const percentage = getPercentage(reference, total)
    return getColorFromPercentage(percentage, theme, hovered);
}

export function getTextPercentageColor(reference: number, total: number, theme?: any, hovered?: boolean): string {
    const percentage = getPercentage(reference, total)

    if (percentage >= 50 && hovered) {
        return theme.palette.secondary["A100"]
    }

    if (percentage >= 90) {
        return theme.palette.secondary["A100"]
    }

    return 'inherit'
}


export function getColorFromPercentage(percentage: number, theme, hovered?: any): string {
    if (percentage <= 10) {
        return !hovered ? theme.palette.secondary.A100 : theme.palette.secondary[200]
    }

    if (percentage > 10 && percentage < 50) {
        return !hovered ? theme.palette.warning.light : theme.palette.warning.main
    }

    if (percentage >= 50 && percentage < 90) {
        return !hovered ? theme.palette.warning.main : theme.palette.warning.dark
    }

    if (percentage >= 90) {
        return !hovered ? theme.palette.error.main : theme.palette.error.dark
    }

    return !hovered ? theme.palette.secondary.A100 : theme.palette.secondary[200]
}

export function getEstimationColor(estimationFactor: number, theme?: any, hovered?: boolean): string {
    if (estimationFactor >= 10 && estimationFactor < 100) {
        return !hovered ? theme.palette.warning.light : theme.palette.warning.main
    }

    if (estimationFactor >= 100 && estimationFactor < 1000) {
        return !hovered ? theme.palette.warning.main : theme.palette.warning.dark
    }

    if (estimationFactor >= 1000) {
        return !hovered ? theme.palette.error.main : theme.palette.error.dark
    }

    return !hovered ? theme.palette.secondary.A100 : theme.palette.secondary[200]
}

export function getTextEstimationColor(estimationFactor: number, theme?: any, hovered?: boolean): string {
    if (estimationFactor >= 100 && hovered) {
        return theme.palette.secondary["A100"]
    }

    if (estimationFactor >= 1000) {
        return theme.palette.secondary["A100"]
    }

    return 'inherit'
}

export function getPercentage(reference: number, total: number): number {
    if (reference > total) {
        return 100
    }
    return (reference / total) * 100
}

export function truncateText(text: string, chars: number): string {
    if (text.length <= chars) return text;
    return text.slice(0, chars) + '...'
}

export const areRowsOverEstimated = (direction: string): boolean => {
    switch (direction) {
        case 'over':
            return true
        case 'under':
            return false
        default:
            return true
    }
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const calculateNodes = (
    summary: PlanRow[],
    stats: Stats,
    theme: Theme,
    nodeOptions: any = {},
    additionalData: any = {}
) => {
    const initialNodes = []
    const initialEdges = []

    function getStrokeWidth(row: PlanRow, stats: Stats) {
        if (!stats) {
            return 1
        }
        return Math.max((getPercentage(row.rows.total * (row.workers.launched + 1), stats.max_rows) / 2), 1);
    }

    for (let i = 0; i < summary.length; i++) {
        const row: PlanRow = summary[i]

        const node: Node = {
            id: row.node_id,
            data: {
                row,
                stats,
                ...additionalData
            },
            targetPosition: Position.Bottom,
            sourcePosition: Position.Top,
            type: 'special',
            draggable: true,
            position: {x: 0, y: 0},
            ...nodeOptions
        }

        initialNodes.push(node)

        if (row.node_parent_id === "") continue

        const edge: Edge = {
            id: `${row.node_id}-${row.node_parent_id}`,
            source: row.node_id,
            target: row.node_parent_id,
            style: {
                strokeWidth: getStrokeWidth(row, stats),
                stroke: theme.palette.primary[200]
            },
            data: {
                rows: row.rows.total,
                ...additionalData
            },
            type: 'special',
        }

        initialEdges.push(edge)
    }

    return {
        initialNodes, initialEdges
    }
}


export const getLayoutedElements = (elk: any, nodes: Node[], edges: Edge[], options = {}, theme: any) => {
    const graph = {
        id: 'root',
        layoutOptions: options,
        children: nodes.map((node) => ({
            ...node,
            targetPosition: 'bottom',
            sourcePosition: 'top',
            width: theme.diagram.node.width,
            height: theme.diagram.node.height,
        })),
        edges: edges,
    };

    return elk
        .layout(graph)
        .then((layoutedGraph) => ({
            nodes: layoutedGraph.children.map((node) => ({
                ...node,
                position: {x: -node.x, y: -node.y},
            })),

            edges: layoutedGraph.edges,
        }))
        .catch(console.error);
};

export const renderStringProperty = (property: Property): string => {
    return property.skip ? '' : `${getFunctionFromKind(property.kind)((property[property.type]))}`
}