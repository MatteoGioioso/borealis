import {QueryExplainerRepository} from "../datalayer/QueryExplainer.repository";
import {
    GetOptimizationsListRequest,
    GetQueryPlanRequest,
    GetQueryPlansListRequest,
    SaveQueryPlanRequest
} from "../proto/query_explainer.pb";
import {Explained, PlanRow, Triggers} from "../../CoreModules/Plan/types";
import {PlanService} from "../../CoreModules/Plan/parser";
import {QueryPlan, QueryPlanListItem} from "../../CoreModules/types";
import {NodeData} from "../../CoreModules/Plan/Contexts";

export class QueryExplainerService {
    private queryExplainerRepository: QueryExplainerRepository;
    private planService: PlanService

    constructor(queryExplainerRepository: QueryExplainerRepository) {
        this.queryExplainerRepository = queryExplainerRepository
        this.planService = new PlanService();
    }

    async saveQueryPlan(body: SaveQueryPlanRequest): Promise<string> {
        const response = await this.queryExplainerRepository.saveQueryPlan(body);
        return response.plan_id
    }

    async getQueryPlan(body: GetQueryPlanRequest): Promise<QueryPlan> {
        const response = await this.queryExplainerRepository.getQueryPlan(body)
        const parsedResponse: Explained = JSON.parse(response.query_plan);
        return {
            alias: response.alias,
            id: response.plan_id,
            jit_stats: parsedResponse.jit_stats,
            nodes_stats: parsedResponse.nodes_stats,
            period_start: new Date(response.period_start as number),
            query_id: response.query_id,
            tables_stats: parsedResponse.tables_stats,
            triggers_stats: parsedResponse.triggers_stats,
            indexes_stats: parsedResponse.indexes_stats,
            stats: parsedResponse.stats,
            summary: parsedResponse.summary,
            original_plan: response.query_original_plan,
            query: response.query,
            optimization_id: response.optimization_id,
            query_fingerprint: response.query_fingerprint
        }
    }

    async getQueryPlanNode(planId: string, nodeId: string): Promise<NodeData> {
        const response: QueryPlan = await this.getQueryPlan({plan_id: planId});
        const foundNode: PlanRow = response.summary.find(node => node.node_id === nodeId);
        return {
            row: foundNode,
            stats: response.stats
        }
    }

    async getQueryPlansList(body: GetQueryPlansListRequest): Promise<QueryPlanListItem[]> {
        const response = await this.queryExplainerRepository.getQueryPlans({
            cluster_name: body.cluster_name,
        });

        if (response.plans?.length) {
            return response.plans.map(plan => ({
                id: plan.id,
                query: plan.query,
                period_start: new Date(plan.period_start as number)
            }))
        }

        return []
    }

    async getOptimizationsList(body: GetOptimizationsListRequest): Promise<QueryPlanListItem[]> {
        const response = await this.queryExplainerRepository.getQueryOptimizations(body);

        if (response.plans?.length) {
            return response.plans.map(plan => ({
                id: plan.id,
                query: plan.query,
                period_start: new Date(plan.period_start as number),
                optimization_id: plan.optimization_id,
                query_fingerprint: plan.query_fingerprint,
                executionTime: plan.execution_time,
                planningTime: plan.planning_time
            }))
        }

        return []
    }
}