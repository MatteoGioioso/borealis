import MainCard from "../../MainCard";
import ReactJson from 'react-json-view'
import {Box} from "@mui/material";
import {CopyToClipboardButton} from "../../CopyToClipboard";

export const RawPlan = ({plan}: { plan: any }) => {
    return (
        <MainCard content={false} sx={{width: 'auto', p: 3}}>
            <Box sx={{pb: 2}}>
                <CopyToClipboardButton data={plan} />
            </Box>
            <ReactJson src={JSON.parse(plan)}/>
        </MainCard>
    )
}