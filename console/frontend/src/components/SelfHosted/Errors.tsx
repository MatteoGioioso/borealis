import {Button} from "@mui/material";
import React from "react";
import {useNavigate} from "react-router-dom";

export const PlanNotFoundErrorDescription = () => {
    const navigate = useNavigate();
    return (
        <div> Not found
            <Button
                variant='outlined'
                onClick={() => navigate('/')}
            >
                + New Plan
            </Button>
        </div>
    )
}

export const PlanUploadErrorDescription = () => {
  return (
      <div>Make sure that the plan was exported correctly</div>
  )
}