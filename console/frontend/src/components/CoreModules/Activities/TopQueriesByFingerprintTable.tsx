import {TableBody, TableHead, TableRow} from "@mui/material";
import React, {useState} from "react";
import {TopQueriesByFingerprintTableData, TopQueriesTableData} from "../../SelfHosted/services/Activities.service";
import {Instance} from "../../SelfHosted/proto/info.pb";
import {Head, QueryLoadCell, QueryTextCell, TableWrapper} from "./TableSharedComponents";


interface TopQueriesByFingerprintTableProps {
    tableDataArray: readonly TopQueriesByFingerprintTableData[]
    clusterInstancesList: Instance[]
}

export function TopQueriesByFingerprintTable({
                                                 tableDataArray,
                                                 clusterInstancesList
                                             }: TopQueriesByFingerprintTableProps) {
    return (
        <>
            <TableWrapper sx={{height: '30vh'}}>
                <TableHead>
                    <TableRow>
                        <Head mapping={{key: 'Load by wait events (Active Average Session)', Title: 'Load'}}/>
                        <Head mapping={{key: 'SQL statement', Title: 'SQL'}}/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableDataArray.map((tableData) => {
                        return (
                            <Row
                                key={tableData.query_sha}
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
    tableData: TopQueriesByFingerprintTableData
    clusterInstancesList: Instance[]
}

function Row({tableData, clusterInstancesList}: RowProps) {
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
                key={tableData.query_sha}
            >
                <QueryLoadCell tableData={tableData}/>
                <QueryTextCell tableData={tableData} handleOpenQueryModel={handleOpen}/>
            </TableRow>
        </>
    )
}