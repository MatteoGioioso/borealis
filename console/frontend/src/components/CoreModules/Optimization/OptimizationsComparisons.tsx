import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import MainCard from "../MainCard";
import {QueryPlanListItem} from "../types";
import Typography from "@mui/material/Typography";
import {ButtonAction} from "../Buttons";
import {Box} from "@mui/material";
import clone from "just-clone";


interface OptimizationsComparisonsProps {
    optimizations: QueryPlanListItem[]
    onClickCompare: (planId: string, planIdToCompare: string) => void
}

function not(a: QueryPlanListItem[], b: QueryPlanListItem[]) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: QueryPlanListItem[], b: QueryPlanListItem[]) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

export function OptimizationsComparisons({optimizations, onClickCompare}: OptimizationsComparisonsProps) {
    const [checked, setChecked] = React.useState<QueryPlanListItem[]>([]);
    const [left, setLeft] = React.useState<QueryPlanListItem[]>(optimizations);
    const [right, setRight] = React.useState<QueryPlanListItem[]>([]);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const onClick = () => {
        const queryPlansToCompare = clone(right);
        onClickCompare(queryPlansToCompare[0].id, queryPlansToCompare[1].id)
    }

    const handleToggle = (value: QueryPlanListItem) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleAllRight = () => {
        setRight(right.concat(left));
        setLeft([]);
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllLeft = () => {
        setLeft(left.concat(right));
        setRight([]);
    };

    const customList = (items: QueryPlanListItem[]) => (
        <Paper sx={{maxWidth: 300, height: 250, overflow: 'auto'}} elevation={0}>
            <List dense component="div" role="list">
                {items.map((opt: QueryPlanListItem, index) => {
                    const labelId = `transfer-list-item-${opt.id}-label`;

                    return (
                        <ListItem
                            key={opt.id}
                            role="listitem"
                            button
                            onClick={handleToggle(opt)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(opt) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{
                                        'aria-labelledby': labelId,
                                    }}
                                />
                            </ListItemIcon>
                            <Typography
                                variant='h5'
                                color={(theme) => theme.palette.primary.main}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        color: (theme) => theme.palette.primary.dark,
                                    }
                                }}
                            >
                                {opt.id}
                            </Typography>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );

    return (
        <MainCard>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item>{customList(left)}</Grid>
                <Grid item>
                    <Grid container direction="column" alignItems="center">
                        <ButtonAction
                            title=">>"
                            sx={{my: 0.5}}
                            variant="outlined"
                            size="small"
                            onClick={handleAllRight}
                            disabled={left.length === 0}
                            aria-label="move all right"
                        />
                        <ButtonAction
                            title="&gt;"
                            sx={{my: 0.5}}
                            variant="outlined"
                            size="small"
                            onClick={handleCheckedRight}
                            disabled={leftChecked.length === 0}
                            aria-label="move selected right"
                        />
                        <ButtonAction
                            title="&lt;"
                            sx={{my: 0.5}}
                            variant="outlined"
                            size="small"
                            onClick={handleCheckedLeft}
                            disabled={rightChecked.length === 0}
                            aria-label="move selected left"
                        />

                        <ButtonAction
                            title="<<"
                            sx={{my: 0.5}}
                            variant="outlined"
                            size="small"
                            onClick={handleAllLeft}
                            disabled={right.length === 0}
                            aria-label="move all left"
                        />
                    </Grid>
                </Grid>
                <Grid item>{customList(right)}</Grid>
            </Grid>
            {right.length === 2 && (
                <Box>
                    <Grid container justifyContent="center" alignItems="center">
                        <ButtonAction
                            title="Compare"
                            variant='contained'
                            onClick={onClick}
                        />
                    </Grid>
                </Box>
            )}
        </MainCard>
    );
}