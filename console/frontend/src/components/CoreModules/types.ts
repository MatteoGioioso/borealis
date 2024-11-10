import {Explained} from "./Plan/types";

export interface QueryPlanListItem {
    query?: string;
    id: string;
    period_start: Date
    alias?: string
    executionTime?: number
    planningTime?: number
    optimization_id?: string
    query_fingerprint?: string
}

export interface QueryPlan extends Explained {
    original_plan?: string;
    query?: string;
    query_id?: string;
    id?: string;
    period_start?: Date
    alias?: string
    optimization_id?: string
    query_fingerprint?: string
}

export type tabMaps = { [key: string]: { name: string, index: number, id: string } }