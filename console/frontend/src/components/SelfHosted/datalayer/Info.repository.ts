import {
    GetClusterInstancesRequest,
    GetClusterInstancesResponse,
    GetClustersRequest,
    GetClustersResponse,
    GetDatabasesRequest, GetDatabasesResponse,
    Info
} from "../proto/info.pb";

export class InfoRepository {
    private readonly ORIGIN: string;

    constructor(origin: string) {
        this.ORIGIN = origin
    }

    getClustersList = async (body: GetClustersRequest): Promise<GetClustersResponse> => Info
        .GetClusters(body, {pathPrefix: this.ORIGIN});

    getClusterInstancesList = async (body: GetClusterInstancesRequest): Promise<GetClusterInstancesResponse> => Info
        .GetClusterInstances(body, {pathPrefix: this.ORIGIN})

    getDatabasesList = async (body: GetDatabasesRequest): Promise<GetDatabasesResponse> => Info
        .GetDatabases(body, {pathPrefix: this.ORIGIN})
}
