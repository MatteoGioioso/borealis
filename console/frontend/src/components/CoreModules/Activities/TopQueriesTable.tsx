import {TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import React from "react";
import {TopQueriesTableData} from "../../SelfHosted/services/Activities.service";
import {getMetricsColumns, Metric, metricsInfoMap} from "./utils";
import {Instance} from "../../SelfHosted/proto/info.pb";
import {ZoomInOutlined} from "@ant-design/icons";
import {ButtonLink} from "../Buttons";
import {useParams} from "react-router-dom";
import {Head, QueryLoadCell, QueryTextCell, TableWrapper} from "./TableSharedComponents";


interface TopQueriesTableProps {
    tableDataArray: readonly TopQueriesTableData[]
    clusterInstancesList: Instance[]
}

export function TopQueriesTable({tableDataArray, clusterInstancesList}: TopQueriesTableProps) {
    return (
        <>
            <TableWrapper>
                <TableHead>
                    <TableRow>
                        <Head mapping={{key: '', Title: ''}}/>
                        <Head mapping={{key: 'Load by wait events (Active Average Session)', Title: 'Load'}}/>
                        <Head mapping={{key: 'SQL statement', Title: 'SQL'}}/>
                        {Object.values(metricsInfoMap).map((metric: Metric) => (
                            <Head mapping={{key: metric.key, Title: metric.title}}/>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableDataArray.map((tableData) => {
                        return (
                            <Row
                                key={tableData.fingerprint}
                                tableData={tableData}
                                clusterInstancesList={clusterInstancesList}
                            />
                        )
                    })}
                </TableBody>
            </TableWrapper>
        </>
    );
}

interface RowProps {
    tableData: TopQueriesTableData
    clusterInstancesList: Instance[]
}

function Row({tableData, clusterInstancesList}: RowProps) {
    const {cluster_id} = useParams();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <TableRow
                hover
                role="checkbox"
                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                tabIndex={-1}
                key={tableData.fingerprint}
            >
                <TableCell>
                    <ButtonLink
                        to={`/clusters/${cluster_id}/queries/${tableData.fingerprint}`}
                        icon={<ZoomInOutlined/>}
                        sx={{color: theme => theme.palette.secondary.main, m: 0, p: 0}}
                    />
                </TableCell>
                <QueryLoadCell tableData={tableData}/>
                <QueryTextCell tableData={tableData} handleOpenQueryModel={handleOpen}/>
                {getMetricsColumns(tableData).map(col => (
                    <TableCell key={tableData.fingerprint + col.key}>
                        {col.val}
                    </TableCell>
                ))}
            </TableRow>
        </>
    )
}