import {Box, Button, Divider, IconButton, Modal, Paper, Snackbar, Stack, Typography} from "@mui/material";
import {ShareAltOutlined} from "@ant-design/icons";
import React, {useContext, useState} from "react";
import {ButtonAction, UploadButton} from "../Buttons";
import {PlanForm} from "../PlanForm";
import {QueryPlan, QueryPlanListItem} from "../types";
import {FormikHelpers} from "formik/dist/types";
import {formatTiming, getPercentageColor} from "../utils";
import {TableTabsContext} from "./Contexts";
import PlansListDropdown from "../PlansListDropdown";
import {PLAN_TABS_MAP} from "../tabsMaps";

const modalBoxStyles = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

interface OptimizationFormModalProps {
    plan: QueryPlan,
    open: boolean
    setOpen: (b: boolean) => void
    optimizationModalContent: (callback: () => void) => React.JSX.Element
}

interface PlanToolbarProps {
    plan: QueryPlan
    uploadSharedPlan: (event: React.SyntheticEvent) => Promise<string>
    sharePlan: (planId: string) => void
    selectPlan: (planId: string) => void
    plansList: QueryPlanListItem[]
    optimizationModalContent: (callback: () => void) => React.JSX.Element
}

export const PlanToolbar = ({
                                optimizationModalContent,
                                plan,
                                sharePlan,
                                uploadSharedPlan,
                                plansList,
                                selectPlan
                            }: PlanToolbarProps) => {
    const [open, setOpen] = useState<boolean>(false)
    const [openModal, setOpenModal] = useState(false);
    const {setTabIndex} = useContext(TableTabsContext);

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: 1,
                    border: '1px solid',
                    borderColor: theme => theme.palette.grey['A800'],
                    borderRadius: 2,
                }}
            >
                <Stack direction='row'>
                    <Stack direction='row'>
                        <PlansListDropdown
                            items={plansList}
                            currentPlanId={plan.id}
                            onClick={selectPlan}
                        />
                    </Stack>
                    <Stack direction='row' divider={<Divider orientation="vertical" flexItem/>}>

                        <Typography sx={{p: 1, whiteSpace: 'nowrap'}}>Execution
                            time: <b>{formatTiming(plan.stats.execution_time)}</b></Typography>
                        <Typography sx={{p: 1, whiteSpace: 'nowrap'}}>Planning
                            time: <b>{formatTiming(plan.stats.planning_time)}</b></Typography>
                        {Boolean(plan.jit_stats) && (
                            <>
                                <Typography
                                    sx={{pt: 1, pb: 1, pl: 1, color: theme => theme.palette.primary.main, cursor: 'pointer'}}
                                    onClick={() => setTabIndex(PLAN_TABS_MAP().stats.index)}
                                >
                                    JIT
                                </Typography>
                                <Typography sx={{pt: 1, pb: 1, pr: 1}}>:</Typography>
                                <Typography
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        p: 1,
                                        borderRadius: 2,
                                        backgroundColor: theme => getPercentageColor(plan.jit_stats.Timing.Total, plan.stats.execution_time, theme)
                                    }}
                                >
                                    <b>{formatTiming(plan.jit_stats.Timing.Total)}</b>
                                </Typography>
                            </>

                        )}
                        {Boolean(plan.triggers_stats) && (
                            <>
                                <Typography
                                    sx={{pt: 1, pb: 1, pl: 1, color: theme => theme.palette.primary.main, cursor: 'pointer'}}
                                    onClick={() => setTabIndex(PLAN_TABS_MAP().stats.index)}
                                >
                                    Triggers
                                </Typography>
                                <Typography sx={{pt: 1, pb: 1, pr: 1}}>:</Typography>
                                <Typography
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        p: 1,
                                        borderRadius: 2,
                                        backgroundColor: theme => getPercentageColor(plan.triggers_stats.max_time, plan.stats.execution_time, theme)
                                    }}
                                >
                                    <b>{formatTiming(plan.triggers_stats.max_time)}</b>
                                </Typography>
                            </>
                        )}
                    </Stack>

                    <Stack direction='row'>
                        <ButtonAction title="Optimize" onClick={() => setOpenModal(true)}/>

                        <IconButton
                            component={Button}
                            onClick={() => {
                                setOpen(true)
                                sharePlan(plan.id)
                            }}
                            color='primary'
                        >
                            <ShareAltOutlined/>
                        </IconButton>

                        <UploadButton
                            color='primary'
                            onUpload={uploadSharedPlan}
                        />
                    </Stack>

                    <Snackbar
                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                        open={open}
                        onClose={() => setOpen(false)}
                        autoHideDuration={2000}
                        message="Downloading plan"
                    />


                </Stack>
            </Paper>

            <OptimizationFormModal
                plan={plan}
                open={openModal}
                setOpen={setOpenModal}
                optimizationModalContent={optimizationModalContent}
            />
        </>
    )
}

const OptimizationFormModal = ({plan, setOpen, open, optimizationModalContent}: OptimizationFormModalProps) => {
    return (
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={modalBoxStyles}>
                <Stack direction='row'>
                    <Typography variant='h4'>Optimization for: </Typography>
                    <Typography sx={{pl: 1}} variant='h4' fontWeight='100'>{plan.id}</Typography>
                </Stack>
                <Typography sx={{pb: 2}} variant='body1'>Write your optimized query here and compare it with the current one</Typography>
                {optimizationModalContent(() => setOpen(false))}
            </Box>
        </Modal>
    )
}