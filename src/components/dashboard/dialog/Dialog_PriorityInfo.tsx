import React, { useEffect, useState } from "react";
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
import Datatable_PriorityInfo from "../datatable/Datatable_PriorityInfo";
import { DialogTransition } from "@/utils/style/DialogTransition";

interface Priority {
  Type: string;
  label: string;
  value: number;
}

interface DialogProps {
  onOpen: boolean;
  onClose: () => void;
  onSelectedProjectIds: number[];
  onSelectedPriorityName: string;
  onSelectedWorkType: number;
}

const Dialog_PriorityInfo = ({
  onOpen,
  onClose,
  onSelectedProjectIds,
  onSelectedPriorityName,
  onSelectedWorkType,
}: DialogProps) => {
  const [priority, setPriority] = useState<number>(0);
  const [clickedPriorityName, setClickedPriorityName] = useState<string>("");

  const priority_Data = [
    {
      Type: "Low",
      label: "Low",
      value: 3,
    },
    {
      Type: "Medium",
      label: "Medium",
      value: 2,
    },
    {
      Type: "High",
      label: "High",
      value: 1,
    },
  ];

  const handleClose = () => {
    onClose();
    setPriority(0);
    setClickedPriorityName("");
  };

  function getValueByLabelOrType(labelOrType: string | undefined): number {
    const priority = priority_Data.find(
      (priority: Priority) =>
        priority.Type === labelOrType || priority.label === labelOrType
    );
    if (priority) {
      return priority.value;
    } else {
      return 0;
    }
  }

  useEffect(() => {
    setClickedPriorityName(onSelectedPriorityName);
    const priorityValue: number = getValueByLabelOrType(clickedPriorityName);
    setPriority(priorityValue);
  }, [onSelectedPriorityName, clickedPriorityName]);

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
            <FormControl sx={{ mx: 0.75, minWidth: 150, marginTop: 1 }}>
              <Select
                labelId="status"
                id="status"
                value={priority ? priority : 0}
                onChange={(e) => setPriority(Number(e.target.value))}
                sx={{ height: "36px" }}
              >
                <MenuItem value={0}>All</MenuItem>
                {priority_Data.map(
                  (i: { Type: string; label: string; value: number }) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </div>

          <Datatable_PriorityInfo
            onSelectedProjectIds={onSelectedProjectIds}
            onSelectedPriorityId={priority}
            onSelectedWorkType={onSelectedWorkType}
            onOpen={onOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_PriorityInfo;
