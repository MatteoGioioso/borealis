import {useState} from "react";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc)
dayjs.extend(timezone)

export const convertToLocalTime = (time: string) => dayjs(time)
    .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
    .format('YYYY-MM-DDTHH:mm:ssZ')
export const convertToUTCTime = (time: string) => dayjs(time).utc().format('YYYY-MM-DDTHH:mm:ssZ')
const getNow = () => () => dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ssZ')
const getAgo = (hours: number) => () => dayjs(new Date()).subtract(hours, 'hour').format('YYYY-MM-DDTHH:mm:ssZ')
export const getTime = (time: string) =>  dayjs(time).format('YYYY-MM-DDTHH:mm:ssZ')
export const getTimeIntervalName = (from: string, to: string): string => {
    return `${dayjs(from).format('YYYY-MM-DD HH:mm:ss')} to ${dayjs(to).format('YYYY-MM-DD HH:mm:ss')}`
}

export interface Interval {
    from: () => string
    to: () => string
    name: string
    id: string
}

export const INTERVALS: Interval[] = [
    {
        name: "Last 5 minutes",
        from: getAgo(0.08),
        to: getNow(),
        id: "Last 5_minutes"
    },
    {
        name: "Last 15 minutes",
        from: getAgo(1 / 4),
        to: getNow(),
        id: "Last 15_minutes"
    },
    {
        name: "Last 30 minutes",
        from: getAgo(1 / 2),
        to: getNow(),
        id: "Last 30_minutes"
    },
    {
        name: "Last 1 hour",
        from: getAgo(1),
        to: getNow(),
        id: "Last_1_hour"
    },
    {
        name: "Last 3 hours",
        from: getAgo(3),
        to: getNow(),
        id: "last_3_hours"
    },
    {
        name: "Last 6 hours",
        from: getAgo(6),
        to: getNow(),
        id: "last_6_hours"
    },
    {
        name: "Last 12 hours",
        from: getAgo(12),
        to: getNow(),
        id: "last_2_hours"
    },
    {
        name: "Last 24 hours",
        from: getAgo(24),
        to: getNow(),
        id: "last_4_hours"
    },
    {
        name: "Last 2 days",
        from: getAgo(24 * 2),
        to: getNow(),
        id: "last_2_days"
    },
    {
        name: "Last 7 days",
        from: getAgo(24 * 7),
        to: getNow(),
        id: "last_7_days"
    }
]

export const useTimeIntervals = () => {
    const [timeInterval, setTimeInterval] = useState<Interval>({
        name: "Last 1 hour",
        from: getAgo(1),
        to: getNow(),
        id: "last_1_hour"
    })

    return {
        timeInterval, setTimeInterval
    }
}