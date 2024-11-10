import {Stack} from "@mui/material";
import {GeneralStatsTable} from "./GeneralStatsTable";
import {JIT, Stats, Trigger, Triggers} from "../types";
import {JITStatsTable} from "./JITStats";
import {TriggersStatsTable} from "./TriggersStatsTable";

interface GeneralStatsProps {
    stats: Stats
    jitStats: JIT
    triggers: Triggers
}

export const GeneralStats = ({jitStats, stats, triggers}: GeneralStatsProps) => {
    return (
        <Stack spacing={2}>
            <GeneralStatsTable stats={stats}/>
            {Boolean(jitStats) && <JITStatsTable stats={jitStats} executionTime={stats.execution_time} />}
            {Boolean(triggers?.items) && <TriggersStatsTable stats={triggers.items} executionTime={stats.execution_time} />}
        </Stack>
    )
}