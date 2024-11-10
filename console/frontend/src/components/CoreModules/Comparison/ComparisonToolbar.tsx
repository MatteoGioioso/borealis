import {QueryPlanListItem} from "../types";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import {useParams} from "react-router-dom";
import {Grid, Paper, Stack} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import {ButtonAction} from "../Buttons";
import {SwapOutlined} from "@ant-design/icons";
import React from "react";

interface ToolBarProps {
    optimizations: QueryPlanListItem[]
    onClickSwap: () => void
    handleChange: (e: SelectChangeEvent) => void
    handleChangeToCompare: (e: SelectChangeEvent) => void
    onClickGoBackToOptimizations: () => void
}

export const Toolbar = ({optimizations, onClickSwap, handleChangeToCompare, handleChange, onClickGoBackToOptimizations}: ToolBarProps) => {
    const {plan_id, plan_id_to_compare} = useParams();

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
                    {Boolean(optimizations) && (
                        <Grid container spacing={0} alignItems="center">
                            <Grid item xs={5} sx={{pr: 1}}>
                                <FormControl fullWidth>
                                    <InputLabel id="optimizations-comparison">Plan</InputLabel>
                                    <Select
                                        labelId="optimizations-comparison"
                                        id="demo-simple-select"
                                        label="Plan"
                                        onChange={handleChange}
                                        value={plan_id}
                                        defaultValue=""
                                    >
                                        {optimizations.map(opt => (
                                            <MenuItem key={opt.id} value={opt.id}>{opt.id}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2}>
                                <ButtonAction
                                    onClick={onClickSwap}
                                    icon={<SwapOutlined/>}
                                    sx={{ml: 0}}
                                />
                            </Grid>
                            <Grid item xs={5} sx={{pl: 2}}>
                                <FormControl fullWidth>
                                    <InputLabel id="optimizations-comparison">Plan to compare</InputLabel>
                                    <Select
                                        labelId="optimizations-comparison"
                                        id="demo-simple-select"
                                        label="Plan to compare"
                                        onChange={handleChangeToCompare}
                                        value={plan_id_to_compare}
                                        defaultValue=""
                                    >
                                        {optimizations.map(opt => (
                                            <MenuItem key={opt.id} value={opt.id}>{opt.id}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    )}

                </Stack>

            </Paper>

            {/*<Paper*/}
            {/*    elevation={0}*/}
            {/*    sx={{*/}
            {/*        position: 'absolute',*/}
            {/*        right: 25,*/}
            {/*        top: 75,*/}
            {/*        p: 0.5,*/}
            {/*        border: '1px solid',*/}
            {/*        borderColor: theme => theme.palette.grey['A800'],*/}
            {/*        borderRadius: 2,*/}
            {/*        zIndex: 999*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Stack direction='row'>*/}
            {/*        <ButtonAction*/}
            {/*            title="Back to optimizations"*/}
            {/*            onClick={onClickGoBackToOptimizations}*/}
            {/*        />*/}
            {/*    </Stack>*/}

            {/*</Paper>*/}
        </>
    )
}