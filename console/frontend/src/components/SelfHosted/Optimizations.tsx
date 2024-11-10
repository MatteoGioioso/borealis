import {Grid, Stack} from "@mui/material";
import {OptimizationsList} from "../CoreModules/Optimization/OptimizationsList";
import {QueryPlanListItem} from "../CoreModules/types";
import {useNavigate, useParams} from "react-router-dom";
import {OptimizationsAnalytics} from "../CoreModules/Optimization/OptimizationsAnalytics";
import {OptimizationsComparisonsSelects} from "../CoreModules/Optimization/OptimizationsComparisonsSelects";

interface OptimizationsProps {
    optimizations: QueryPlanListItem[]
}

export const Optimizations = ({optimizations}: OptimizationsProps) => {
    const navigate = useNavigate();
    const {cluster_id} = useParams();

    function onClickOptimization(opt: QueryPlanListItem) {
        navigate(`/clusters/${cluster_id}/plans/${opt.id}`)
    }

    function onClickCompare(planId: string, planIdToCompare: string) {
        navigate(`/clusters/${cluster_id}/plans/${planId}/comparisons/${planIdToCompare}`)
    }

    return (
        <Grid container>
            <Grid item xs={6}>
                <OptimizationsList optimizations={optimizations} onClickOptimization={onClickOptimization}/>
            </Grid>
            <Grid item xs={6} sx={{pl: 2}}>
                <Stack spacing={2}>
                <OptimizationsComparisonsSelects optimizations={optimizations} onClickCompare={onClickCompare} />
                <OptimizationsAnalytics optimizations={optimizations} />
                </Stack>
            </Grid>
        </Grid>
    )
}