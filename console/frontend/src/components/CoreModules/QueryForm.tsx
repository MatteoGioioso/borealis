import {Database, Instance} from "../SelfHosted/proto/info.pb";
import {Formik} from "formik";
import {Button, FormHelperText, Grid, Stack, TextField} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import {QUERY_EXAMPLE_PLACEHOLDER} from "../utils";
import React from "react";
import {FormikHelpers} from "formik/dist/types";

interface QueryFormProps {
    clusterInstancesList: Instance[]
    databasesList: Database[]
    onSubmit: (values: any, formikHelpers: FormikHelpers<any>) => void | Promise<any>
}

export const QueryForm = ({clusterInstancesList, databasesList, onSubmit}: QueryFormProps) => {
    return (
        <Formik
            initialValues={{
                query: '',
                instanceName: '',
                database: '',
                alias: ''
            }}
            onSubmit={onSubmit}
            validate={values => {
                const errors = {};
                if (!values.query) {
                    // @ts-ignore
                    errors.query = 'Required';
                }

                if (!values.instanceName) {
                    // @ts-ignore
                    errors.instanceName = 'Required';
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
                                    <Grid container spacing={2}>

                                        <Grid item xs={6}>
                                            <InputLabel htmlFor="instanceName">Instances*</InputLabel>
                                            <TextField
                                                select
                                                fullWidth
                                                id="instanceName"
                                                type="text"
                                                value={values.instanceName}
                                                name="instanceName"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                inputProps={{}}
                                                error={Boolean(touched.instanceName && errors.instanceName)}
                                            >
                                                {clusterInstancesList.map(instance => (
                                                    <MenuItem key={instance.id} value={instance.id}>
                                                        {instance.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                            {touched.instanceName && errors.instanceName && (
                                                <FormHelperText error id="helper-text-plan-signup">
                                                    {errors.instanceName as string}
                                                </FormHelperText>
                                            )}
                                        </Grid>

                                        <Grid item xs={6}>

                                            <InputLabel htmlFor="database">Databases*</InputLabel>
                                            <TextField
                                                select
                                                fullWidth
                                                id="database"
                                                type="text"
                                                value={values.database}
                                                name="database"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                inputProps={{}}
                                                error={Boolean(touched.database && errors.database)}
                                            >
                                                {databasesList.map(database => (
                                                    <MenuItem key={database.name} value={database.name}>
                                                        {database.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                            {touched.database && errors.database && (
                                                <FormHelperText error id="helper-text-plan-signup">
                                                    {errors.database as string}
                                                </FormHelperText>
                                            )}
                                        </Grid>

                                    </Grid>
                                </Stack>

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
                                    <InputLabel htmlFor="query">Query*</InputLabel>
                                    <TextField
                                        fullWidth
                                        error={Boolean(touched.query && errors.query)}
                                        id="query"
                                        type="text"
                                        value={values.query}
                                        name="query"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder={QUERY_EXAMPLE_PLACEHOLDER}
                                        inputProps={{}}
                                        multiline
                                        rows={10}
                                    />
                                    {touched.query && errors.query && (
                                        <FormHelperText error id="helper-text-plan-signup">
                                            {errors.query as string}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Stack>
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