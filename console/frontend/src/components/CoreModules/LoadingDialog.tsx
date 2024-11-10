import {CircularProgress, Dialog, DialogContent, DialogTitle, Stack, Typography} from "@mui/material";
import React from "react";

export const LoadingDialog = (props: { open: boolean; handleClose: () => void; }) => {
    return (
        <Dialog
            open={props.open}
            sx={{p: 10}}
            disableEscapeKeyDown
        >
            <DialogContent>
               <Stack spacing={4} justifyItems='center' justifyContent='center' >
                   <CircularProgress />
                   <Typography variant='h5'>
                       Explaining...
                   </Typography>
               </Stack>
            </DialogContent>
        </Dialog>
    )
}