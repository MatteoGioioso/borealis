import {Box, Grid} from "@mui/material";
import {infoService, queryExplainerService} from "./ioc";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {QueryPlanListItem} from "../CoreModules/types";
import {Instance} from "./proto/info.pb";
import {QueryForm} from "../CoreModules/QueryForm";
import {PlansList} from "../CoreModules/PlansList";
import {Wrapper} from "../CoreModules/Wrapper";

const Plans = () => {
    const [plansList, setPlansList] = useState([])
    const [clusterInstancesList, setClusterInstancesList] = useState<Instance[]>([])
    const {cluster_id} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        Promise
            .all([
                    queryExplainerService.getQueryPlansList({cluster_name: cluster_id}),
                    infoService.getClusterInstancesList({cluster_name: cluster_id}),
                ]
            )
            .then(responses => {
                setPlansList(responses[0] as QueryPlanListItem[])
                setClusterInstancesList(responses[1] as Instance[])
            })
            .catch(e => {
                // TODO handle error
                console.error(e)
            })
    }, []);

    const onClickPlansList = (item) => {
        navigate(`/clusters/${cluster_id}/plans/${item.id}`)
    }

    async function onSubmitCustomQuery(values, {setErrors, setStatus, setSubmitting}) {
        const planID = await queryExplainerService.saveQueryPlan({
            query: values.query,
            cluster_name: cluster_id,
            instance_name: values.instanceName,
            database: "postgres"
        });
        navigate(`/clusters/${cluster_id}/plans/${planID}`)
    }

    return (
        <>
            <Grid container>
                <Grid item xs={8}>
                    <Wrapper sx={{pt: 2, pr: 2}} title="Custom query">
                        {Boolean(clusterInstancesList?.length) && (
                            <Box sx={{p: 3}}>
                                <QueryForm
                                    databasesList={[]}
                                    clusterInstancesList={clusterInstancesList}
                                    onSubmit={onSubmitCustomQuery}
                                />
                            </Box>
                        )}
                    </Wrapper>
                </Grid>
                <Grid item xs={4}>
                    <Wrapper sx={{pt: 2}} title="Plans">
                        {Boolean(plansList?.length) && (
                            <PlansList items={plansList} clusterId={cluster_id} onClick={onClickPlansList}/>
                        )}
                    </Wrapper>
                </Grid>
            </Grid>
        </>
    )
}

export default Plans