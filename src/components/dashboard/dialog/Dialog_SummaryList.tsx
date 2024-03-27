import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import {
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Datatable_SummaryList from "../datatable/Datatable_SummaryList";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { KeyValueColorCodeSequence } from "@/utils/Types/types";

interface SummaryListProps {
  onOpen: boolean;
  onClose: () => void;
  onSelectedWorkType: number;
  onSelectedProjectIds: number[];
  onSelectedSummaryStatus: number;
  onCurrProjectSummary: KeyValueColorCodeSequence[] | [];
}

const Dialog_SummaryList = ({
  onOpen,
  onClose,
  onSelectedWorkType,
  onSelectedProjectIds,
  onSelectedSummaryStatus,
  onCurrProjectSummary,
}: SummaryListProps) => {
  const [taskStatusName, setTaskStatusName] = useState<number>(0);

  const handleClose = () => {
    onClose();
    setTaskStatusName(0);
  };

  return (
    <div>
      <Dialog
        fullWidth
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="xl"
        onClose={handleClose}
      >
        <DialogTitle className="flex items-center justify-between p-2 bg-whiteSmoke">
          <span className="font-semibold text-lg">Task Status</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px]">
          <div className="flex justify-end items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="Project Staus"
                id="Project Staus"
                value={
                  taskStatusName > 0 ? taskStatusName : onSelectedSummaryStatus
                }
                onChange={(e) => setTaskStatusName(Number(e.target.value))}
                sx={{ height: "36px" }}
              >
                {onCurrProjectSummary.map((i: KeyValueColorCodeSequence) => (
                  <MenuItem value={i.Sequence} key={i.Key}>
                    {i.Key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Datatable_SummaryList
            onSelectedProjectIds={onSelectedProjectIds}
            onSelectedWorkType={onSelectedWorkType}
            onSelectedSummaryStatus={onSelectedSummaryStatus}
            onCurrSelectedSummaryStatus={taskStatusName}
            onOpen={onOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_SummaryList;
