import MainCard from "../../MainCard";
import {Box} from "@mui/material";
import {CopyToClipboardButton} from "../../CopyToClipboard";
import Highlight from 'react-highlight'

export const RawQuery = ({query}: { query: string }) => {
    return (
        <MainCard content={false} sx={{width: 'auto', p: 3}}>
            <Box sx={{pb: 2}}>
                <CopyToClipboardButton data={query} />
            </Box>
            <Highlight className='sql'>
                {query}
            </Highlight>
        </MainCard>
    )
}