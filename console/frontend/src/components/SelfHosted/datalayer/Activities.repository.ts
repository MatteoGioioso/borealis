import {
    GetProfileRequest,
    GetProfileResponse,
    Activities,
    GetTopQueriesRequest,
    GetTopQueriesResponse,
    GetTopQueriesByFingerprintResponse,
    GetQueryDetailsRequest, GetQueryDetailsResponse
} from "../proto/activities.pb";

export class ActivitiesRepository {
    private readonly ORIGIN: string;

    constructor(origin: string) {
        this.ORIGIN = origin
    }

    getProfile = async (body: GetProfileRequest): Promise<GetProfileResponse> => Activities
        .GetProfile(body, {pathPrefix: this.ORIGIN});

    getTopQueries = async (body: GetTopQueriesRequest): Promise<GetTopQueriesResponse> => Activities
        .GetTopQueries(body, {pathPrefix: this.ORIGIN});

    getTopQueriesByFingerprint = async (body: GetTopQueriesRequest): Promise<GetTopQueriesByFingerprintResponse> => Activities
        .GetTopQueriesByFingerprint(body, {pathPrefix: this.ORIGIN})

    getQueryDetails = async (body: GetQueryDetailsRequest): Promise<GetQueryDetailsResponse> => Activities
        .GetQueryDetails(body, {pathPrefix: this.ORIGIN})
}
