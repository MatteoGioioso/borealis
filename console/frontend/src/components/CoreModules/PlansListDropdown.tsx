import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {QueryPlanListItem} from "./types";

interface PlansListDropdownProps {
    items: QueryPlanListItem[]
    currentPlanId: string
    onClick?: (itemId: string) => void
}

export default function PlansListDropdown({items, onClick, currentPlanId}: PlansListDropdownProps) {
    const handleChange = (event: SelectChangeEvent) => {
        onClick(event.target.value)
    };

    return (
        <Box sx={{ minWidth: 300 }}>
            <FormControl>
                <InputLabel id="plans">Plan ID</InputLabel>
                <Select
                    labelId="plans"
                    id="plans"
                    sx={{width: '400px'}}
                    label="Plans"
                    value={currentPlanId}
                    onChange={handleChange}
                    size='small'
                >
                    {items.map(item => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.alias || item.id}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}
