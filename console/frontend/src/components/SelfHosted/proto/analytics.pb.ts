/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as fm from "./fetch.pb"
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb"
import * as BorealisV1beta1Shared from "./shared.pb"
export type GetQueriesListRequest = {
  period_start_from?: GoogleProtobufTimestamp.Timestamp
  period_start_to?: GoogleProtobufTimestamp.Timestamp
  cluster_name?: string
  order?: string
  limit?: string
}

export type GetQueriesListResponse = {
  queries?: Query[]
  mappings?: MetricInfo[]
}

export type Query = {
  id?: string
  fingerprint?: string
  text?: string
  parameters?: string[]
  plan_ids?: string[]
  metrics?: {[key: string]: BorealisV1beta1Shared.MetricValues}
}

export type MetricInfo = {
  key?: string
  Type?: string
  Kind?: string
  Title?: string
}

export class QueryAnalytics {
  static GetQueriesList(req: GetQueriesListRequest, initReq?: fm.InitReq): Promise<GetQueriesListResponse> {
    return fm.fetchReq<GetQueriesListRequest, GetQueriesListResponse>(`/v0/analytics/GetQueriesMetrics`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
}