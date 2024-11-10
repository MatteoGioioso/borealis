import {useNavigate, useParams} from "react-router-dom";
import {activitiesService, infoService, queryExplainerService} from "./ioc";
import {getTime, getTimeIntervalName, useTimeIntervals} from "../CoreModules/timeIntervals";
import React, {useEffect, useState} from "react";
import {AnalyticsToolbar} from "./components/AnalyticsToolbar";
import {Box, Grid, Stack} from "@mui/material";
import {ErrorAlert, ErrorReport} from "../ErrorReporting";
import {Wrapper} from "../CoreModules/Wrapper";
import {useAutoRefresh} from "../CoreModules/autoRefresher";
import {QueryDetailsType, TopQueriesByFingerprintTableData} from "./services/Activities.service";
import {TopQueriesByFingerprintTable} from "../CoreModules/Activities/TopQueriesByFingerprintTable";
import Plot from "react-plotly.js";
import Plotly from 'plotly.js-cartesian-dist-min'
import {PlotRelayoutEvent} from "plotly.js";
import {Instance} from "./proto/info.pb";
import {QueryPlan, QueryPlanListItem} from "../CoreModules/types";
import {PlansList} from "../CoreModules/PlansList";

const QueryDetails = () => {
    const {cluster_id, query_fingerprint} = useParams();
    const [error, setError] = useState<ErrorReport>()
    const {timeInterval, setTimeInterval} = useTimeIntervals();
    const [topQueriesByFingerprint, setTopQueriesByFingerprint] = useState<TopQueriesByFingerprintTableData[]>(undefined)
    const [queryDetails, setQueryDetails] = useState<QueryDetailsType>(undefined)
    const [plotRefsMap, setPlotRefsMap] = useState<{ [key: string]: any }>({})
    const [clusterInstancesList, setClusterInstancesList] = useState<Instance[]>([])
    const [optimizationsList, setOptimizationsList] = useState<QueryPlanListItem[]>(null)
    const navigate = useNavigate();

    useEffect(() => {
        infoService
            .getClusterInstancesList({cluster_name: cluster_id})
            .then(setClusterInstancesList)
            .catch(e => {
                setError({
                    error: e.message,
                    error_stack: "",
                    error_details: ""
                })
            })
    }, []);

    const fetchQueryDetails = () => {
        Promise
            .all([
                activitiesService.getTopQueriesByFingerprint({
                    from: timeInterval.from(),
                    to: timeInterval.to(),
                    clusterName: cluster_id,
                    fingerprint: query_fingerprint
                }),
                activitiesService.getQueryDetails({
                    from: timeInterval.from(),
                    to: timeInterval.to(),
                    clusterName: cluster_id,
                    fingerprint: query_fingerprint
                })
            ])
            .then(responses => {
                setTopQueriesByFingerprint(responses[0] as TopQueriesByFingerprintTableData[])
                setQueryDetails(responses[1] as QueryDetailsType)
            })
            .catch(e => {
                console.error(e)
                setError({
                    error: e.message,
                    error_stack: "",
                    error_details: ""
                })
            })
    }

    const {refreshInterval, setRefreshInterval} = useAutoRefresh([fetchQueryDetails]);

    useEffect(() => {
        fetchQueryDetails()
    }, [timeInterval.id])

    const OnPlotRelayout = (e: PlotRelayoutEvent) => {
        if (e.autosize || Object.keys(e).length === 0) return;

        const from = e["xaxis.range[0]"].toString()
        const to = e["xaxis.range[1]"].toString()

        setTimeInterval({
            to: () => getTime(to),
            from: () => getTime(from),
            name: getTimeIntervalName(from, to),
            id: getTimeIntervalName(from, to)
        })
    };

    const onPlotHover = (event, detail) => {
        const points = event.points
            .map(point => ({curveNumber: point.curveNumber, pointNumber: point.pointNumber}));

        Object
            .keys(plotRefsMap)
            .filter(key => key !== detail.name)
            .forEach(key => Plotly.Fx.hover(plotRefsMap[key], points))
    };

    const onPlotUnhover = (event, detail) => {
        Object
            .keys(plotRefsMap)
            .filter(key => key !== detail.name)
            .forEach(key => {
                Plotly.Fx.hover(plotRefsMap[key], [])
            })
    };

    const onClickExplainTopQuery = async (querySha: string, params: string[], instanceName: string) => {
        try {
            const planID = await queryExplainerService.saveQueryPlan({
                cluster_name: cluster_id,
                instance_name: instanceName,
                query_sha: querySha,
            });
            navigate(`/clusters/${cluster_id}/plans/${planID}`)
        } catch (e) {
            setError({
                error: e.message,
                error_stack: "",
                error_details: ""
            })
        }
    }

    return (
        <>
            <AnalyticsToolbar
                onSelectAutoRefreshInterval={setRefreshInterval}
                autoRefreshInterval={refreshInterval}
                timeInterval={timeInterval}
                onSelectTimeInterval={setTimeInterval}
                refresh={() => fetchQueryDetails()}
            />
            <Box sx={{pt: 2}}/>
            <Grid container spacing={2}>
                {error && <ErrorAlert error={error} setError={setError}/>}

                <Grid item xs={12}>
                    {Boolean(topQueriesByFingerprint) && (
                        <Wrapper sx={{pt: 2}} title="Activities">
                            <TopQueriesByFingerprintTable
                                tableDataArray={topQueriesByFingerprint}
                                clusterInstancesList={clusterInstancesList}
                            />
                        </Wrapper>
                    )}
                </Grid>

                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        {Boolean(queryDetails) && (
                            Object.values(queryDetails).map(detail => {
                                return (
                                    <Grid item xs={6} key={detail.name}>
                                        <Box sx={{pt: 3}}/>
                                        <Wrapper sx={{pt: 1}} title={detail.name}>
                                            <Plot
                                                onInitialized={(figure, graphDiv) => {
                                                    setPlotRefsMap(prevState => ({
                                                        ...prevState,
                                                        [detail.name]: graphDiv
                                                    }))
                                                }}
                                                data={detail.data}
                                                layout={detail.layout}
                                                useResizeHandler
                                                config={{displayModeBar: false, doubleClick: false}}
                                                style={{width: '100%', height: '100%'}}
                                                onHover={(e) => onPlotHover(e, detail)}
                                                onUnhover={(e) => onPlotUnhover(e, detail)}
                                                onRelayout={OnPlotRelayout}
                                            />
                                        </Wrapper>
                                    </Grid>
                                );
                            })
                        )}

                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}

export default QueryDetails