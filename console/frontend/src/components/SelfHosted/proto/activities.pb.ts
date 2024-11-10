/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as fm from "./fetch.pb"
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb"
import * as BorealisV1beta1Shared from "./shared.pb"
export type GetProfileRequest = {
  period_start_from?: GoogleProtobufTimestamp.Timestamp
  period_start_to?: GoogleProtobufTimestamp.Timestamp
  cluster_name?: string
}

export type GetProfileResponse = {
  traces?: {[key: string]: Trace}
  current_cpu_cores?: number
}

export type Trace = {
  x_values_timestamp?: GoogleProtobufTimestamp.Timestamp[]
  x_values_float?: number[]
  x_values_string?: string[]
  y_values_float?: number[]
  color?: string
}

export type QueriesMetrics = {
  metrics?: {[key: string]: BorealisV1beta1Shared.MetricValues}
}

export type QueriesWaitEvents = {
  traces?: {[key: string]: Trace}
}

export type QueryMetadata = {
  fingerprint?: string
  parameters?: string[]
  text?: string
  examples_text?: string[]
  plans_id?: string[]
  database?: string
  is_query_truncated?: boolean
  query_sha?: string
  is_query_not_explainable?: boolean
}

export type GetTopQueriesRequest = {
  period_start_from?: GoogleProtobufTimestamp.Timestamp
  period_start_to?: GoogleProtobufTimestamp.Timestamp
  cluster_name?: string
  fingerprint?: string
}

export type GetTopQueriesResponse = {
  traces?: {[key: string]: Trace}
  queries_metrics?: {[key: string]: QueriesMetrics}
  queries_metadata?: {[key: string]: QueryMetadata}
}

export type GetQueryDetailsRequest = {
  period_start_from?: GoogleProtobufTimestamp.Timestamp
  period_start_to?: GoogleProtobufTimestamp.Timestamp
  cluster_name?: string
  query_fingerprint?: string
}

export type GetQueryDetailsResponse = {
  traces?: {[key: string]: Trace}
}

export type GetTopQueriesByFingerprintResponse = {
  traces?: {[key: string]: Trace}
  query_metrics?: QueriesMetrics
  queries_metadata?: {[key: string]: QueryMetadata}
}

export class Activities {
  static GetProfile(req: GetProfileRequest, initReq?: fm.InitReq): Promise<GetProfileResponse> {
    return fm.fetchReq<GetProfileRequest, GetProfileResponse>(`/v0/activities/GetProfile`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static GetTopQueries(req: GetTopQueriesRequest, initReq?: fm.InitReq): Promise<GetTopQueriesResponse> {
    return fm.fetchReq<GetTopQueriesRequest, GetTopQueriesResponse>(`/v0/activities/GetTopQueries`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static GetTopQueriesByFingerprint(req: GetTopQueriesRequest, initReq?: fm.InitReq): Promise<GetTopQueriesByFingerprintResponse> {
    return fm.fetchReq<GetTopQueriesRequest, GetTopQueriesByFingerprintResponse>(`/v0/activities/GetTopQueriesByFingerprint`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static GetQueryDetails(req: GetQueryDetailsRequest, initReq?: fm.InitReq): Promise<GetQueryDetailsResponse> {
    return fm.fetchReq<GetQueryDetailsRequest, GetQueryDetailsResponse>(`/v0/activities/GetQueryDetails`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
}