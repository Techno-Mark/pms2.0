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
import Datatable_TotalHoursInfo from "../datatable/Datatable_TotalHoursInfo";
import { DialogTransition } from "@/utils/style/DialogTransition";

interface TotalHoursInfoDialogProps {
  onOpen: boolean;
  onClose: () => void;
  onWorkTypeData: string[] | any;
  onSelectedProjectIds: number[];
  onSelectedWorkTypeName: string;
}
interface WorkType {
  label: string;
  value: number | any;
}

const Dialog_TotalHoursInfo: React.FC<TotalHoursInfoDialogProps> = ({
  onOpen,
  onClose,
  onWorkTypeData,
  onSelectedProjectIds,
  onSelectedWorkTypeName,
}) => {
  const [workType, setWorkType] = useState<number | any>(0);
  const [clickedWorkTypeName, setClickedWorkTypeName] = useState<string>("");

  function getValueByLabelOrType(labelOrType: any): number {
    const workType = onWorkTypeData.find(
      (workType: WorkType) => workType.label === labelOrType
    );
    if (workType) {
      return workType.value;
    } else {
      return 0;
    }
  }

  useEffect(() => {
    setClickedWorkTypeName(onSelectedWorkTypeName);
    const workTypeValue: number = getValueByLabelOrType(clickedWorkTypeName);
    setWorkType(workTypeValue);
  }, [onSelectedWorkTypeName, clickedWorkTypeName]);

  const handleClose = () => {
    setWorkType(0);
    setClickedWorkTypeName("");
    onClose();
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
        <DialogTitle className="flex justify-between p-5 bg-whiteSmoke">
          <span className="font-semibold text-lg">Total Hours</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px]">
          <div className="flex justify-end items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 150, marginTop: 1 }}>
              <Select
                labelId="workType"
                id="workType"
                value={workType === 0 ? 0 : workType}
                onChange={(e) => setWorkType(e.target.value)}
                sx={{ height: "36px" }}
              >
                <MenuItem value={0}>All</MenuItem>
                {onWorkTypeData.map((i: any) => (
                  <MenuItem value={i.value} key={i.value}>
                    {i.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Datatable_TotalHoursInfo
            onSelectedProjectIds={onSelectedProjectIds}
            onSelectedWorkType={workType}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_TotalHoursInfo;
