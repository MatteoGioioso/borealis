import { PlanRow, Stats } from './types'
import {QueryExplainerService as QueryExplainerServiceSelfHosted} from "../../SelfHosted/services/QueryExplainer.service";

export interface SummaryTableProps {
  summary: PlanRow[]
  stats: Stats
  queryExplainerService?: QueryExplainerServiceSelfHosted
}