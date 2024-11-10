import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import {QueryPlanListItem} from "../types";
import MainCard from "../MainCard";
import {formatDate, formatTiming} from "../utils";
import {useParams} from "react-router-dom";

interface OptimizationsListProps {
    optimizations: QueryPlanListItem[]
    onClickOptimization: (opt: QueryPlanListItem) => void
}

export function OptimizationsList({optimizations, onClickOptimization}: OptimizationsListProps) {
    const {plan_id} = useParams();

    const getPrimaryText = (item: QueryPlanListItem, index: number): React.JSX.Element => {
        let text = item.id
        if (item.alias) {
            text = `${item.alias} (${text})`
        }

        if (index === 0) {
            text = `Root Plan: ${text}`
        }

        return <>{text}</>
    }

    const getActiveStep = () => {
        return optimizations.findIndex(opt => opt.id === plan_id)
    }

    return (
        <MainCard>
            <Box sx={{maxWidth: 400}}>
                <Stepper nonLinear activeStep={getActiveStep()} orientation="vertical">
                    {optimizations.map((opt, index) => {
                        return (
                            <Step key={opt.id}>
                                <StepLabel>
                                    <Typography
                                        onClick={() => onClickOptimization(opt)}
                                        variant='h5'
                                        sx={{
                                            cursor: 'pointer',
                                            color: (theme) => theme.palette.primary.main,
                                            '&:hover': {
                                                color: (theme) => theme.palette.primary.dark,
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        {getPrimaryText(opt, index)}
                                    </Typography>
                                    <Typography variant='body2'>
                                        {formatDate(opt.period_start)}
                                    </Typography>
                                </StepLabel>
                                <StepContent>
                                    <Typography fontWeight='bold'>Execution time: {formatTiming(opt.executionTime)}</Typography>
                                </StepContent>
                            </Step>
                        )
                    })}
                </Stepper>
            </Box>
        </MainCard>
    );
}
