import {Button, FormHelperText, Grid, Stack, TextField, Typography} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import {QUERY_EXAMPLE_PLACEHOLDER, QUERY_PLAN_EXAMPLE_PLACEHOLDER} from "../utils";
import {ReactNode} from "react";
import {Formik} from "formik";
import {FormikHelpers} from "formik/dist/types";

interface PlanFormProps {
    onSubmit: (values: any, formikHelpers: FormikHelpers<any>) => void | Promise<any>
}

export const PlanForm = ({onSubmit}: PlanFormProps) => {
    return (
        <Formik
            initialValues={{
                plan: '',
                alias: '',
                query: ''
            }}
            onSubmit={onSubmit}
            validate={values => {
                const errors = {};
                if (!values.plan) {
                    // @ts-ignore
                    errors.plan = 'Required';
                }

                return errors;
            }}
        >
            {({errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values}) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Stack spacing={2}>
                                <Stack spacing={0}>
                                    <InputLabel htmlFor="alias">Alias</InputLabel>
                                    <TextField
                                        fullWidth
                                        id="alias"
                                        type="text"
                                        value={values.alias}
                                        name="alias"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder={'Plan alias'}
                                        inputProps={{}}
                                        rows={1}
                                    />
                                </Stack>

                                <Stack spacing={0}>
                                    <InputLabel htmlFor="plan">Plan*</InputLabel>
                                    <TextField
                                        fullWidth
                                        error={Boolean(touched.plan && errors.plan)}
                                        id="plan"
                                        type="text"
                                        value={values.plan}
                                        name="plan"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder={QUERY_PLAN_EXAMPLE_PLACEHOLDER}
                                        inputProps={{}}
                                        multiline
                                        rows={15}
                                    />
                                </Stack>

                                <Stack spacing={0}>
                                    <InputLabel htmlFor="query">Query</InputLabel>
                                    <TextField
                                        fullWidth
                                        id="query"
                                        type="text"
                                        value={values.query}
                                        name="query"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder={QUERY_EXAMPLE_PLACEHOLDER}
                                        inputProps={{}}
                                        multiline
                                        rows={4}
                                    />
                                </Stack>

                                {touched.plan && errors.plan && (
                                    <FormHelperText error id="helper-text-plan-signup">
                                        {errors.plan as ReactNode}
                                    </FormHelperText>
                                )}
                            </Stack>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="body1">
                                Pgex uses wasm and does not have a backend. <b>I do not save any of the
                                information
                                provided
                                in this form</b>.
                            </Typography>
                            <Typography variant="body2">
                                For the time being all your query plans, query and schemas are stored in the client. If any
                                changes to
                                this behaviour will occur, you will be notified.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit"
                                    variant="contained"
                                    color="primary">
                                Explain
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            )}
        </Formik>
    )
}