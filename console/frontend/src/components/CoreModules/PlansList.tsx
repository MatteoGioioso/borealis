import {Box, List, ListItem, ListItemIcon, ListItemText, Theme, Typography} from "@mui/material";
import {GenericDetailsPopover} from "./GenericDetailsPopover";
import {CopyToClipboardButton} from "./CopyToClipboard";
import Highlight from "react-highlight";
import {ConsoleSqlOutlined, DeleteOutlined} from "@ant-design/icons";
import React from "react";
import {formatDate} from "./utils";
import {QueryPlanListItem} from "./types";
import {SxProps} from "@mui/system";

interface PlansListProps {
    items: QueryPlanListItem[]
    clusterId?: string
    onClick: (item: QueryPlanListItem) => void
    onDelete?: (item: QueryPlanListItem) => void
    sx?: SxProps<Theme>
}

export function PlansList(props: PlansListProps) {
    const getPrimaryText = (item: QueryPlanListItem) => {
        if (item.alias) {
            return <>{item.alias} ({item.id})</>
        }

        return <>{item.id}</>
    }

    return (
        <List
            sx={{width: '100%', bgcolor: 'background.paper', height: '75vh', overflow: 'auto', ...props.sx}}
        >
            {props.items.map(item => (
                <ListItem key={item.id} alignItems='flex-start'>
                    <ListItemText
                        primary={
                            <Typography
                                onClick={() => props.onClick(item)}
                                sx={{
                                    cursor: 'pointer',
                                    color: (theme) => theme.palette.primary.main,
                                    '&:hover': {
                                        color: (theme) => theme.palette.primary.dark,
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                {getPrimaryText(item)}
                            </Typography>
                        }
                        secondary={formatDate(item.period_start)}
                    />
                    {Boolean(props.onDelete) && (
                        <ListItemIcon sx={{pr: 4}}>
                            <DeleteOutlined onClick={() => props.onDelete(item)} />
                        </ListItemIcon>
                    )}
                    <GenericDetailsPopover
                        name={"query"}
                        content={
                            <>
                                <Box sx={{pb: 2}}>
                                    <CopyToClipboardButton data={item.query}/>
                                </Box>
                                <Highlight className='sql'>
                                    {item.query}
                                </Highlight>
                            </>
                        }
                    >
                        <ListItemIcon>
                            <ConsoleSqlOutlined/>
                        </ListItemIcon>
                    </GenericDetailsPopover>

                </ListItem>
            ))}
        </List>
    );
}