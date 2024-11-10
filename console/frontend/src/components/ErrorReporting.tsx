import React from 'react'
import {Alert, AlertColor, AlertTitle, Box, Button, Grid, IconButton, Link, Stack, Typography} from "@mui/material";
import {CloseOutlined} from "@ant-design/icons";
import {ExplainedError} from "./CoreModules/Plan/types";

export interface ErrorReport {
    severity?: AlertColor
    description?: string | React.JSX.Element
    error: string;
    error_details: string;
    error_stack: string;
}

export const ErrorAlert = ({error, setError}: { error: ErrorReport, setError: (err: ErrorReport) => void }) => {
    const {severity = "error"} = error
    return (
        <Grid container justifyContent='center'>
            <Alert
                sx={{p: 2}}
                severity={severity as AlertColor}
                action={
                    <Stack direction='row'>
                        <IconButton
                            size='medium'
                            onClick={() => setError(null)}
                        >
                            <CloseOutlined/>
                        </IconButton>
                    </Stack>
                }
            >
                <AlertTitle><Typography variant='h4'>{error.error}</Typography></AlertTitle>
                <Typography variant='h6'>{error.error_details}</Typography>
                {error.description}

                {Boolean(error.error_stack) && (
                    <Box pt={3}>
                        <Typography variant='h6'>Stack: </Typography>
                        <div>{error.error_stack ? error.error_stack
                            .split("\n")
                            .map((line, i) => <p key={i}
                                                 style={{margin: "1px", fontSize: "12px", paddingLeft: 3 * i}}>{line}</p>) : '-'}</div>
                    </Box>
                )}
            </Alert>
        </Grid>
    )
}

