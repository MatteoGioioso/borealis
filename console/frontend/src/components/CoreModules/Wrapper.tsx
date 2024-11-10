import {Box, Grid, Typography} from "@mui/material";
import MainCard from "./MainCard";
import React from "react";

export const Wrapper = ({children, title = "", sx = {}}) => (
    <>
        <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
                <Typography variant="h5">{title}</Typography>
            </Grid>
        </Grid>
        <Box sx={{...sx}}>
            <MainCard
                content={false}
                border
            >
                <Box>{children}</Box>
            </MainCard>
        </Box>
    </>
);