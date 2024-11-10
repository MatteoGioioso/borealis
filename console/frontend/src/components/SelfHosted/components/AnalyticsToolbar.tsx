import {AppBar, Box, IconButton, Toolbar} from "@mui/material";
import React from "react";
import MenuItem from "@mui/material/MenuItem";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import {AUTO_REFRESH_INTERVALS} from "../../CoreModules/autoRefresher";
import {formatTiming} from "../../CoreModules/utils";
import {SyncOutlined} from "@ant-design/icons";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Interval} from "../../CoreModules/timeIntervals";
import {TimeIntervalPicker} from "./TimeIntervalPicker";

export interface ClusterToolbarProps {
    onSelectTimeInterval: (interval: Interval) => void
    onSelectAutoRefreshInterval: (interval: number) => void
    autoRefreshInterval: number
    timeInterval: Interval
    refresh: () => void
}

export const AnalyticsToolbar = ({
                                     onSelectAutoRefreshInterval,
                                     autoRefreshInterval,
                                     onSelectTimeInterval,
                                     timeInterval,
                                     refresh
                                 }: ClusterToolbarProps) => {
    return (
        <>
            <AppBar position="static" color='inherit' elevation={0}
                    sx={{
                        border: '1px solid',
                        borderRadius: 2,
                        borderColor: theme => theme.palette.grey['A800'],
                    }}
            >
                <Toolbar variant="dense">
                    <Box sx={{flex: '1 1 100%'}}></Box>
                    <TimeIntervalPicker
                        onSelectTimeInterval={onSelectTimeInterval}
                        timeInterval={timeInterval}
                    />
                    <Box sx={{pl: 4}}/>
                    <AutoRefreshIntervalsDropdown
                        autoRefreshInterval={autoRefreshInterval}
                        onSelectAutoRefreshInterval={onSelectAutoRefreshInterval}
                        refresh={refresh}
                    />
                </Toolbar>
            </AppBar>
        </>
    )
}

export interface AutoRefreshIntervalsDropdownProps {
    onSelectAutoRefreshInterval: (interval: number) => void
    autoRefreshInterval: number
    refresh: () => void
}

export const AutoRefreshIntervalsDropdown = ({
                                                 onSelectAutoRefreshInterval,
                                                 autoRefreshInterval,
                                                 refresh
                                             }: AutoRefreshIntervalsDropdownProps) => {
    const handleChange = (event: SelectChangeEvent) => {
        onSelectAutoRefreshInterval(Number(event.target.value))
    };

    return (
        <>
            <IconButton onClick={refresh}>
                <SyncOutlined/>
            </IconButton>
            <FormControl sx={{minWidth: 90}} size="small">
                <Select
                    sx={{
                        boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': {border: 0}
                    }}
                    id="autorefresh-dropdown"
                    value={autoRefreshInterval.toString()}
                    label={<SyncOutlined/>}
                    onChange={handleChange}
                >
                    <MenuItem value={0}>
                        <em>Off</em>
                    </MenuItem>
                    {AUTO_REFRESH_INTERVALS.map(interval => (
                        <MenuItem value={interval}>{formatTiming(interval)}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>
    );
}


