import {useState} from "react";
import {Button, Snackbar} from "@mui/material";
import {CopyFilled} from "@ant-design/icons";

export const CopyToClipboardButton = (props) => {
    const [open, setOpen] = useState(false)

    const handleClick = () => {
        setOpen(true)
        navigator.clipboard.writeText(props.data)
    }

    return (
        <>
            <Button variant="outlined" size='small' onClick={handleClick} startIcon={<CopyFilled/>}>
                Copy
            </Button>
            <Snackbar
                open={open}
                onClose={() => setOpen(false)}
                autoHideDuration={2000}
                message="Copied to clipboard"
            />
        </>
    )
}