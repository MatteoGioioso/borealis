import {QueryPlanListItem} from "../types";
import ReactApexChart from 'react-apexcharts';
import {useTheme} from '@mui/material/styles';
import React, {useState, useEffect} from 'react';
import {ApexOptions} from "apexcharts";
import MainCard from "../MainCard";
import {
    formatDate,
    formatTiming,
} from "../utils";
import {renderToString} from 'react-dom/server'
import {Box, Chip, Grid, Stack, Typography} from "@mui/material";
import {useParams} from "react-router-dom";


interface OptimizationsAnalyticsProps {
    optimizations: QueryPlanListItem[]
}

export const OptimizationsAnalytics = ({optimizations}: OptimizationsAnalyticsProps) => {
    return (
        <OptimizationChart optimizations={optimizations}/>
    )
}


const areaChartOptions = {
    chart: {
        height: 450,
        type: 'area',
        toolbar: {
            show: false
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        width: 2
    },
    grid: {
        strokeDashArray: 0
    },
};

// ==============================|| INCOME AREA CHART ||============================== //

const OptimizationChart = ({optimizations}: OptimizationsAnalyticsProps) => {
    const theme = useTheme();
    const {plan_id} = useParams();

    const {primary, secondary} = theme.palette.text;
    const line = theme.palette.divider;

    const [options, setOptions] = useState(areaChartOptions);

    useEffect(() => {
        // @ts-ignore
        setOptions((prevState) => ({
            ...prevState,
            colors: [theme.palette.primary.main, theme.palette.primary[700]],
            xaxis: {
                categories: optimizations.map((opt, index) => `#${index+1}`),
                axisBorder: {
                    show: true,
                    color: line
                },
                tickAmount: optimizations.length
            },
            yaxis: {
                labels: {
                    style: {
                        colors: [secondary]
                    }
                }
            },
            grid: {
                borderColor: line
            },
            tooltip: {
                theme: 'light',
                custom({series, seriesIndex, dataPointIndex, w}) {
                    return renderToString(
                        <OptimizationToolTip
                            optimizations={optimizations}
                            series={series}
                            dataPointIndex={dataPointIndex}
                            seriesIndex={seriesIndex}
                            w={w}/>
                    )
                }
            },
            annotations: {
                xaxis: [{
                    x: `#${optimizations.findIndex(opt => opt.id === plan_id)+1}`,
                    borderColor: '#999',
                    yAxisIndex: 0,
                    label: {
                        show: true,
                        text: '<>',
                        style: {
                            color: "#fff",
                            background: theme.palette.primary.main
                        }
                    }
                }]
            },
        }));
    }, [plan_id]);

    const [series, setSeries] = useState([
        {
            name: 'Execution time',
            data: []
        },
    ]);

    useEffect(() => {
        setSeries([
            {
                name: 'Execution time (s)',
                data: optimizations.map(opt => Math.round(opt.executionTime) / 1000)
            },
            {
                name: 'Planning time (s)',
                data: optimizations.map(opt => Math.round(opt.planningTime) / 1000)
            },
        ]);
    }, []);

    return (
        <MainCard>
            <ReactApexChart options={options as ApexOptions} series={series} type="line" height={300}/>
        </MainCard>
    );
};


const OptimizationToolTip = ({series, seriesIndex, dataPointIndex, w, optimizations}) => {
    return (
        <Box style={{padding: '10px'}}>
            <Typography variant='h4' sx={{p: 0}}>
                {(optimizations as QueryPlanListItem[])[dataPointIndex].id}
            </Typography>
            <Typography variant='body2'>
                Execution time: {formatTiming((optimizations as QueryPlanListItem[])[dataPointIndex].executionTime)}
            </Typography>
            <Typography variant='body2'>
                Planning time: {formatTiming((optimizations as QueryPlanListItem[])[dataPointIndex].planningTime)}
            </Typography>
            <Typography variant='subtitle1'>
                {formatDate((optimizations as QueryPlanListItem[])[dataPointIndex].period_start)}
            </Typography>
        </Box>
    )
}