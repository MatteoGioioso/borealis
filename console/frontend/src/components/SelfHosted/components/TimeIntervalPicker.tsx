import {getTime, getTimeIntervalName, Interval, INTERVALS} from "../../CoreModules/timeIntervals";
import React from "react";
import {ButtonAction} from "../../CoreModules/Buttons";
import {ClockCircleOutlined} from "@ant-design/icons";
import {Box, Divider, Menu, Stack, Typography} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, {Dayjs} from "dayjs";
import {useFormik} from "formik";

export interface TimeIntervalPickerProps {
    onSelectTimeInterval: (interval: Interval) => void
    timeInterval: Interval
}

export const TimeIntervalPicker = ({timeInterval, onSelectTimeInterval}: TimeIntervalPickerProps) => {
    const formik = useFormik({
        initialValues: {
            from: timeInterval.from(),
            to: timeInterval.to(),
        },
        onSubmit: values => {
            onSelectTimeInterval({
                from: () => getTime(values.from),
                to: () => getTime(values.to),
                name: getTimeIntervalName(values.from, values.to),
                id: getTimeIntervalName(values.from, values.to)
            })
            setAnchorEl(null);
        },
    });

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        formik.resetForm({values: formik.initialValues});
        setAnchorEl(null);
    };

    const handleClickTimeInterval = (interval: Interval) => {
        onSelectTimeInterval(interval)
        setAnchorEl(null);
    }

    return (
        <>
            <ButtonAction
                reverseIconPosition
                onClick={handleClick}
                icon={<ClockCircleOutlined/>}
                title={timeInterval.name}
                sx={{
                    color: theme => theme.palette.secondary['600'],
                    pl: 2, pr: 2
                }}
                size='small'
            />
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <Box
                    sx={{
                        p: 2
                    }}
                >
                    <Stack direction='row' spacing={2} divider={<Divider orientation="vertical" flexItem/>}>
                        <Box>
                            <form noValidate onSubmit={formik.handleSubmit}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>

                                    <Typography>From:</Typography>
                                    <DateTimePicker
                                        slotProps={{textField: {size: 'small'}}}
                                        onChange={value => {
                                            formik.setFieldValue('from', value.toString())
                                        }}
                                        value={dayjs(formik.values.from)}
                                    />

                                    <Box sx={{pt: 2}}/>

                                    <Typography>To:</Typography>
                                    <DateTimePicker
                                        slotProps={{textField: {size: 'small'}}}
                                        onChange={value => {
                                            formik.setFieldValue('to', value.toString())
                                        }}
                                        value={dayjs(formik.values.to)}
                                    />

                                    <Box sx={{pt: 4}}/>
                                    <ButtonAction type='submit' sx={{ml: 0}} title="Set time interval" variant='contained'/>
                                </LocalizationProvider>

                            </form>
                        </Box>

                        <Box>
                            {INTERVALS.map(interval => (
                                <MenuItem onClick={() => handleClickTimeInterval(interval)}>{interval.name}</MenuItem>
                            ))}
                        </Box>
                    </Stack>
                </Box>

            </Menu>
        </>
    )
}
