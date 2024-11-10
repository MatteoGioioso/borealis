import {Box, Grid} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";
import {activitiesService, infoService, queryExplainerService} from "./ioc";
import React, {useEffect, useState} from "react";
import {Instance} from "./proto/info.pb";
import Plot from 'react-plotly.js';
import {ChartObject, TableData} from "./services/Activities.service";
import {ErrorAlert, ErrorReport} from "../ErrorReporting";
import {TopQueriesTable} from "../CoreModules/Activities/TopQueriesTable";
import {PlotRelayoutEvent} from "plotly.js";
import {useAutoRefresh} from "../CoreModules/autoRefresher";
import {AnalyticsToolbar} from "./components/AnalyticsToolbar";
import {getTime, getTimeIntervalName, useTimeIntervals} from "../CoreModules/timeIntervals";
import {Wrapper} from "../CoreModules/Wrapper";

export const Activities = () => {
    const {cluster_id} = useParams();
    const [clusterInstancesList, setClusterInstancesList] = useState<Instance[]>([])
    const [activities, setActivities] = useState<ChartObject>(undefined)
    const [topQueries, setTopQueries] = useState<TableData[]>(undefined)
    const [error, setError] = useState<ErrorReport>()
    const navigate = useNavigate();
    const {timeInterval, setTimeInterval} = useTimeIntervals();

    const fetchActivities = () => {
        Promise.all([
            activitiesService.getProfile({
                from: timeInterval.from(),
                to: timeInterval.to(),
                clusterName: cluster_id
            }),
            activitiesService.getTopQueries({
                from: timeInterval.from(),
                to: timeInterval.to(),
                clusterName: cluster_id
            })
        ]).then(responses => {
            setActivities(responses[0] as ChartObject)
            setTopQueries(responses[1] as TableData[])
        }).catch(e => {
            setError({
                error: e.message,
                error_stack: "",
                error_details: ""
            })
        })
    }

    const {refreshInterval, setRefreshInterval} = useAutoRefresh([fetchActivities]);

    useEffect(() => {
        fetchActivities()
    }, [timeInterval.id]);

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

    return (
        <>
            <AnalyticsToolbar
                onSelectAutoRefreshInterval={setRefreshInterval}
                autoRefreshInterval={refreshInterval}
                timeInterval={timeInterval}
                onSelectTimeInterval={setTimeInterval}
                refresh={() => fetchActivities()}
            />
            <Box sx={{pt: 2}}/>
            <Grid container>
                {error && <ErrorAlert error={error} setError={setError}/>}
                <Grid item xs={12}>
                    {Boolean(activities) && (
                        <Wrapper sx={{pt: 2}} title="Activities">
                            <Plot
                                data={activities.traces}
                                layout={activities.layout}
                                useResizeHandler
                                onRelayout={OnPlotRelayout}
                                config={{displayModeBar: false, doubleClick: false}}
                                style={{width: '100%', height: '100%'}}
                            />
                        </Wrapper>
                    )}

                </Grid>
                <Grid item xs={12}>
                    {Boolean(topQueries?.length > 0) && (

                        <Wrapper sx={{pt: 2}}>
                            <TopQueriesTable
                                tableDataArray={topQueries}
                                clusterInstancesList={clusterInstancesList}
                            />
                        </Wrapper>
                    )}

                </Grid>

            </Grid>
        </>
    )
}

export default Activities