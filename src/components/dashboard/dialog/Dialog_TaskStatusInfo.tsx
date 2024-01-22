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
import Datatable_TaskStatusInfo from "../datatable/Datatable_TaskStatusInfo";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { getStatusDropdownData } from "@/utils/commonDropdownApiCall";

interface Status {
  Type: string;
  label: string;
  value: number;
}

interface TaskStatusInfoDialogProps {
  onOpen: boolean;
  onClose: () => void;
  onWorkTypeData: string[];
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
  onSelectedStatusName: string;
}

const Dialog_TaskStatusInfo: React.FC<TaskStatusInfoDialogProps> = ({
  onOpen,
  onClose,
  onWorkTypeData,
  onSelectedProjectIds,
  onSelectedStatusName,
}) => {
  const [workType, setWorkType] = useState<number | any>(0);
  const [allStatus, setAllStatus] = useState<Status[]>([]);
  const [status, setStatus] = useState<number | any>(0);
  const [clickedStatusName, setClickedStatusName] = useState<string>("");

  const handleClose = () => {
    onClose();
    setStatus(0);
    setWorkType(0);
    setClickedStatusName("");
  };

  function getValueByLabelOrType(labelOrType: any): number {
    const status = allStatus.find(
      (status: Status) =>
        status.Type === labelOrType || status.label === labelOrType
    );
    if (status) {
      return status.value;
    } else {
      return 0;
    }
  }

  useEffect(() => {
    setClickedStatusName(onSelectedStatusName);
    const statusValue: number = getValueByLabelOrType(clickedStatusName);
    setStatus(statusValue);
  }, [clickedStatusName, onSelectedStatusName]);

  const getAllStatus = async () => {
    setAllStatus(await getStatusDropdownData());
  };

  useEffect(() => {
    getAllStatus();
  }, []);

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
          <span className="font-semibold text-lg">Task Status</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px]">
          <div className="flex justify-end items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="status"
                id="status"
                value={status ? status : 0}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ height: "36px" }}
              >
                <MenuItem value={0}>All</MenuItem>
                {allStatus.map((i: any) => (
                  <MenuItem value={i.value} key={i.value}>
                    {i.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
          <Datatable_TaskStatusInfo
            onSelectedProjectIds={onSelectedProjectIds}
            onSelectedWorkType={workType}
            onSelectedStatusId={status}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_TaskStatusInfo;
