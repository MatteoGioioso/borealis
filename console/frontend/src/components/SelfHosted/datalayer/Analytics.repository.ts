import {
    GetQueriesListRequest, GetQueriesListResponse,
    QueryAnalytics,
} from "../proto/analytics.pb";

export class AnalyticsRepository {
    private readonly ORIGIN: string;

    constructor(origin: string) {
        this.ORIGIN = origin
    }

    getQueriesMetrics = async (body: GetQueriesListRequest): Promise<GetQueriesListResponse> => QueryAnalytics
        .GetQueriesList(body, {pathPrefix: this.ORIGIN});

}
