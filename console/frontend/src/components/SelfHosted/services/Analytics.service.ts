import {AnalyticsRepository} from "../datalayer/Analytics.repository";
import {GetQueriesListRequest, GetQueriesListResponse} from "../proto/analytics.pb";


export class AnalyticsService {
    private analyticsRepository: AnalyticsRepository;

    constructor(analyticsRepository: AnalyticsRepository) {
        this.analyticsRepository = analyticsRepository
    }

    async getQueriesList(body: GetQueriesListRequest): Promise<GetQueriesListResponse> {
        return await this.analyticsRepository.getQueriesMetrics(body)
    }
}