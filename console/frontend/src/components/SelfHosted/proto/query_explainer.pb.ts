/* eslint-disable */
// @ts-nocheck
/*
* This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
*/

import * as fm from "./fetch.pb"
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb"
export type SaveQueryPlanRequest = {
  period_start_from?: GoogleProtobufTimestamp.Timestamp
  period_start_to?: GoogleProtobufTimestamp.Timestamp
  instance_name?: string
  cluster_name?: string
  query_sha?: string
  query_fingerprint?: string
  query?: string
  database?: string
  optimization_id?: string
  alias?: string
  parameters?: string[]
}

export type SaveQueryPlanResponse = {
  plan_id?: string
}

export type GetQueryPlanRequest = {
  plan_id?: string
}

export type GetQueryPlanResponse = {
  query_id?: string
  plan_id?: string
  query_plan?: string
  query_original_plan?: string
  query_fingerprint?: string
  optimization_id?: string
  query?: string
  period_start?: GoogleProtobufTimestamp.Timestamp
  alias?: string
}

export type GetQueryPlansListRequest = {
  period_start_from?: GoogleProtobufTimestamp.Timestamp
  period_start_to?: GoogleProtobufTimestamp.Timestamp
  cluster_name?: string
  limit?: string
  order?: string
}

export type GetQueryPlansListResponse = {
  plans?: PlanItem[]
}

export type GetOptimizationsListRequest = {
  period_start_from?: GoogleProtobufTimestamp.Timestamp
  period_start_to?: GoogleProtobufTimestamp.Timestamp
  cluster_name?: string
  limit?: string
  order?: string
  query_fingerprint?: string
  optimization_id?: string
}

export type GetOptimizationsListResponse = {
  plans?: PlanItem[]
}

export type PlanItem = {
  id?: string
  alias?: string
  period_start?: GoogleProtobufTimestamp.Timestamp
  query?: string
  optimization_id?: string
  query_fingerprint?: string
  execution_time?: number
  planning_time?: number
}

export class QueryExplainer {
  static SaveQueryPlan(req: SaveQueryPlanRequest, initReq?: fm.InitReq): Promise<SaveQueryPlanResponse> {
    return fm.fetchReq<SaveQueryPlanRequest, SaveQueryPlanResponse>(`/v0/explain/SaveQueryPlan`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static GetQueryPlan(req: GetQueryPlanRequest, initReq?: fm.InitReq): Promise<GetQueryPlanResponse> {
    return fm.fetchReq<GetQueryPlanRequest, GetQueryPlanResponse>(`/v0/explain/GetQueryPlan`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static GetQueryPlansList(req: GetQueryPlansListRequest, initReq?: fm.InitReq): Promise<GetQueryPlansListResponse> {
    return fm.fetchReq<GetQueryPlansListRequest, GetQueryPlansListResponse>(`/v0/explain/GetQueryPlansList`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
  static GetOptimizationsList(req: GetOptimizationsListRequest, initReq?: fm.InitReq): Promise<GetOptimizationsListResponse> {
    return fm.fetchReq<GetOptimizationsListRequest, GetOptimizationsListResponse>(`/v0/explain/GetOptimizationsList`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)})
  }
}