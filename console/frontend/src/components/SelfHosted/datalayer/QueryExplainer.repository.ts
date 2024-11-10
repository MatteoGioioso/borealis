import {
    GetOptimizationsListRequest, GetOptimizationsListResponse,
    GetQueryPlanRequest,
    GetQueryPlanResponse, GetQueryPlansListRequest, GetQueryPlansListResponse,
    QueryExplainer,
    SaveQueryPlanRequest, SaveQueryPlanResponse
} from "../proto/query_explainer.pb";

export class QueryExplainerRepository {
    private readonly ORIGIN: string;

    constructor(origin: string) {
        this.ORIGIN = origin
    }

    getQueryPlan = async (body: GetQueryPlanRequest): Promise<GetQueryPlanResponse> => QueryExplainer
        .GetQueryPlan(body, {pathPrefix: this.ORIGIN});

    saveQueryPlan = async (body: SaveQueryPlanRequest): Promise<SaveQueryPlanResponse> => QueryExplainer
        .SaveQueryPlan(body, {pathPrefix: this.ORIGIN});

    getQueryPlans = async (body: GetQueryPlansListRequest): Promise<GetQueryPlansListResponse> => QueryExplainer
        .GetQueryPlansList(body, {pathPrefix: this.ORIGIN})

    getQueryOptimizations = async (body: GetOptimizationsListRequest): Promise<GetOptimizationsListResponse> => QueryExplainer
        .GetOptimizationsList(body, {pathPrefix: this.ORIGIN})
}
