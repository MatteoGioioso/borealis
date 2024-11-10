import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from "../MainCard";
import {QueryPlanListItem} from "../types";
import {ButtonAction} from "../Buttons";
import {Box, Typography} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import {SwapRightOutlined} from "@ant-design/icons";

interface OptimizationsComparisonsProps {
    optimizations: QueryPlanListItem[]
    onClickCompare: (planId: string, planIdToCompare: string) => void
}

export function OptimizationsComparisonsSelects({optimizations, onClickCompare}: OptimizationsComparisonsProps) {
    const [plansToCompareIds, setPlansToCompareIds] = React.useState<{ [key: string]: string }>({id: "", idToCompare: ""});

    const onClick = () => {
        onClickCompare(plansToCompareIds.id, plansToCompareIds.idToCompare)
    }

    const handleChange = (e: SelectChangeEvent) => {
        setPlansToCompareIds(prevState => ({...prevState, id: e.target.value}))
    }

    const handleChangeToCompare = (e: SelectChangeEvent) => {
        setPlansToCompareIds(prevState => ({...prevState, idToCompare: e.target.value}))
    }

    return (
        <MainCard>
            <Typography sx={{pb: 2, pl: 2}} variant="h5">
                Compare plans
            </Typography>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={5.5}>
                    <FormControl fullWidth>
                        <InputLabel id="optimizations-comparison">Plan</InputLabel>
                        <Select
                            labelId="optimizations-comparison"
                            id="demo-simple-select"
                            label="Plan"
                            onChange={handleChange}
                            defaultValue=""
                        >
                            {optimizations.map(opt => (
                                <MenuItem key={opt.id} value={opt.id}>{opt.id}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <SwapRightOutlined style={{fontSize: '1.2rem'}}/>
                </Grid>
                <Grid item xs={5.5}>
                    <FormControl fullWidth>
                        <InputLabel id="optimizations-comparison">Plan to compare</InputLabel>
                        <Select
                            labelId="optimizations-comparison"
                            id="demo-simple-select"
                            label="Plan to compare"
                            onChange={handleChangeToCompare}
                            defaultValue=""
                        >
                            {optimizations.map(opt => (
                                <MenuItem key={opt.id} value={opt.id}>{opt.id}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            {Boolean(plansToCompareIds.id && plansToCompareIds.idToCompare && plansToCompareIds.id !== plansToCompareIds.idToCompare) && (
                <Box sx={{pt: 2}}>
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

export const SelectInputs = ({optimizations, handleChange, handleChangeToCompare}) => {
  return (
      <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid item xs={5.5}>
              <FormControl fullWidth>
                  <InputLabel id="optimizations-comparison">Plan</InputLabel>
                  <Select
                      labelId="optimizations-comparison"
                      id="demo-simple-select"
                      label="Plan"
                      onChange={handleChange}
                  >
                      {optimizations.map(opt => (
                          <MenuItem value={opt.id}>{opt.id}</MenuItem>
                      ))}
                  </Select>
              </FormControl>
          </Grid>
          <Grid item>
              <SwapRightOutlined style={{fontSize: '1.2rem'}}/>
          </Grid>
          <Grid item xs={5.5}>
              <FormControl fullWidth>
                  <InputLabel id="optimizations-comparison">Plan to compare</InputLabel>
                  <Select
                      labelId="optimizations-comparison"
                      id="demo-simple-select"
                      label="Plan to compare"
                      onChange={handleChangeToCompare}
                  >
                      {optimizations.map(opt => (
                          <MenuItem value={opt.id}>{opt.id}</MenuItem>
                      ))}
                  </Select>
              </FormControl>
          </Grid>
      </Grid>
  )
}