import {TableData, TopQueriesByFingerprintTableData, TopQueriesTableData} from "../../SelfHosted/services/Activities.service";
import {formatBlocksToDiskSize, formatNumbers, formatTiming} from "../utils";

export interface Metric {
    key: string,
    type: string,
    unit: string,
    title: string
}

export const metricsInfoMap = {
    num_queries: {key: 'num_queries', type: 'sum', unit: 'count', title: "Calls"},
    query_time: {key: 'query_time', type: 'sum', unit: 'ms', title: "Time"},
    shared_blks_read: {key: 'shared_blks_read', type: 'sum', unit: 'bytes', title: "Blocks read"},
    shared_blks_dirtied: {key: 'shared_blks_dirtied', type: 'sum', unit: 'bytes', title: "Blocks dirtied"},
    shared_blks_hit: {key: 'shared_blks_hit', type: 'sum', unit: 'bytes', title: "Buffer hits"},
    shared_blks_written: {key: 'shared_blks_written', type: 'sum', unit: 'bytes', title: "Blocks written"},
    rows_sent: {key: 'rows_sent', type: 'sum', unit: 'count', title: "Rows returned"},
    local_blks_hit: {key: "local_blks_hit", type: "sum", unit: "bytes", title: "Local blocks hit"},
    local_blks_read: {key: "local_blks_read", type: "sum", unit: "bytes", title: "Local blocks read"},
    local_blks_dirtied: {key: "local_blks_dirtied", type: "sum", unit: "bytes", title: "Local blocks dirtied"},
    local_blks_written: {key: "local_blks_written", type: "sum", unit: "bytes", title: "Local blocks written"},
    temp_blks_read: {key: "temp_blks_read", type: "sum", unit: "bytes", title: "Temp blocks read"},
    temp_blks_written: {key: "temp_blks_written", type: "sum", unit: "bytes", title: "Temp blocks written"},
    blk_read_time: {key: "blk_read_time", type: "sum", unit: "ms", title: "Blocks read time"},
    blk_write_time: {key: "blk_write_time", type: "sum", unit: "ms", title: "Blocks write time"}
}

// @ts-ignore
export const getMetricsKeys = (excludedColumns?: string[]) => Object.keys(metricsInfoMap).filter(k => !excludedColumns?.includes(k)).map(k => k)

export const getMetricsColumns = (tableData: TopQueriesTableData): { val: string, key: string }[] => {
    return Object
        .keys(metricsInfoMap)
        .map(metricKey => {
            const metric: Metric = metricsInfoMap[metricKey]

            const metricObj = tableData[metric.key]
            if (!metricObj) {
                return {
                    val: "",
                    key: ""
                }
            }

            const metricVal = metricObj[metric.type]
            switch (metric.unit) {
                case 'ms':
                    return {
                        val: metricVal ? formatTiming(metricVal) : '-',
                        key: metricKey
                    }
                case 'bytes':
                    return {
                        val: metricVal ? formatBlocksToDiskSize(metricVal) : '-',
                        key: metricKey
                    }
                default:
                    return {
                        val: metricVal ? formatNumbers(metricVal) : '-',
                        key: metricKey
                    }
            }
        })
}


export interface PopupWaitEventsSummary {
    name: string,
    x: number,
    color: string
}

export const getPopupWaitEventsSummary = (tableData: TopQueriesTableData | TopQueriesByFingerprintTableData): PopupWaitEventsSummary[] => {
    return tableData.aas.data
        .filter(d => d.x[0] !== 0)
        .map(d => ({
            // @ts-ignore
            x: d.x as number,
            color: d.marker.color as string,
            name: d.name
        }))
        .sort(function (a, b) {
            return b.x - a.x;
        });
}