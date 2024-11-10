import {Box, Chip, Grid, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {infoService} from "./ioc";
import MainCard from "../CoreModules/MainCard";
import {CheckOutlined, ExclamationOutlined} from "@ant-design/icons";
import {useTheme} from "@mui/material/styles";
import {useNavigate} from "react-router-dom";
import {AUTO_REFRESH_INTERVALS, useAutoRefresh} from "../CoreModules/autoRefresher";

const ClustersList = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [clusters, setClusters] = useState([])

    const fetchClusterList = () => {
        infoService.getClustersList({}).then(resp => {
            setClusters(resp.clusters)
        }).catch(e => {
            // TODO error handling
            console.error(e)
        })
    }

    const {setRefreshInterval} = useAutoRefresh([fetchClusterList]);

    useEffect(() => {
        setRefreshInterval(AUTO_REFRESH_INTERVALS[2])
        fetchClusterList()
    }, [])

    function onCardClick(cluster) {
        if (cluster.status === "online") {
            navigate(`/clusters/${cluster.id}`)
        }
    }

    return (
        <Grid container spacing={4}>
            {clusters?.map(cluster => (
                <Grid item xs={4} key={cluster.id}>
                    <MainCard
                        border
                        boxShadow
                        sx={{p: 2}}
                        onClick={() => onCardClick(cluster)}
                    >
                        <Stack spacing={0.5}>
                            <Typography variant="h3">
                                {cluster.name}
                            </Typography>
                            <Grid container alignItems="flex-end">
                                <Grid item>
                                    <Chip
                                        variant='outlined'
                                        style={{
                                            backgroundColor: cluster.status === "online" ? theme.palette.success.main : theme.palette.error.main,
                                            margin: 0,
                                            color: theme.palette.secondary['A100']
                                        }}
                                        icon={
                                            <>
                                                {cluster.status === "online" &&
                                                    <CheckOutlined style={{fontSize: '0.75rem', color: 'inherit'}}/>}
                                                {cluster.status === "offline" &&
                                                    <ExclamationOutlined style={{fontSize: '0.75rem', color: 'inherit'}}/>}
                                            </>
                                        }
                                        label={cluster.status}
                                        sx={{ml: 1.25, pl: 1}}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                        {/*<Box sx={{pt: 2.25}}>*/}
                        {/*    <Typography variant="h6" color="textSecondary">*/}
                        {/*        {cluster.hostname}:{cluster.port}*/}
                        {/*    </Typography>*/}
                        {/*</Box>*/}
                    </MainCard>
                </Grid>
            ))}
        </Grid>
    )
}

export default ClustersList