import {useEffect, useState} from "react";

const MILLISECONDS = 1000

export const AUTO_REFRESH_INTERVALS = [
    5*MILLISECONDS,
    10*MILLISECONDS,
    30*MILLISECONDS,
    60*MILLISECONDS,
    5*60*MILLISECONDS,
    15*60*MILLISECONDS,
]

export const useAutoRefresh = (fetchFuncs: (() => void)[]) => {
    const [refreshInterval, setRefreshInterval] = useState<number>(0)

    useEffect(() => {
        let intervalId;

        if (intervalId) {
            clearInterval(intervalId)
        }

        if (refreshInterval !== 0) {
            intervalId = setInterval(() => {
                fetchFuncs.forEach(func => func())
            }, refreshInterval);
        }

        return () => clearInterval(intervalId)
    }, [refreshInterval, fetchFuncs]);

    return {
        setRefreshInterval, refreshInterval
    }
}