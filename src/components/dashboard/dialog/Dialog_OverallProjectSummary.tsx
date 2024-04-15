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
import Datatable_OverallProjectSummary from "../datatable/Datatable_OverallProjectSummary";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { callAPI } from "@/utils/API/callAPI";
import { ListOverallProject } from "@/utils/Types/dashboardTypes";

interface OverallProjectSummaryDialogProps {
  onOpen: boolean;
  onClose: () => void;
  onSelectedWorkType: number;
  onSelectedTaskStatus: string;
  onSelectedProjectIds: number[];
}

const Dialog_OverallProjectSummary = ({
  onOpen,
  onClose,
  onSelectedWorkType,
  onSelectedTaskStatus,
  onSelectedProjectIds,
}: OverallProjectSummaryDialogProps) => {
  const [allTaskList, setAllTaskList] = useState<{ name: string }[]>([]);
  const [taskStatusName, setTaskStatusName] = useState<string>("");

  const handleClose = () => {
    onClose();
    setTaskStatusName("");
  };

  const getTaskStatusList = () => {
    const params = {
      typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      ProjectIds: onSelectedProjectIds ? onSelectedProjectIds : [],
    };
    const url = `${process.env.report_api_url}/clientdashboard/overallprojectcompletion`;
    const successCallback = (
      ResponseData: { List: ListOverallProject[]; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const statusName: { name: string }[] = ResponseData.List.map(
          (item: { Key: string }) => ({
            name: item.Key,
          })
        );

        setAllTaskList(statusName);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      onOpen && getTaskStatusList();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [onSelectedWorkType, onSelectedProjectIds, onSelectedProjectIds, onOpen]);

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

        <DialogContent className="flex flex-col gap-5 mt-[10px] !py-0">
          <div className="flex justify-end items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="Project Staus"
                id="Project Staus"
                value={taskStatusName ? taskStatusName : onSelectedTaskStatus}
                onChange={(e) => setTaskStatusName(e.target.value)}
                sx={{ height: "36px" }}
              >
                {allTaskList.map((i: { name: string }) => (
                  <MenuItem value={i.name} key={i.name}>
                    {i.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Datatable_OverallProjectSummary
            onSelectedProjectIds={onSelectedProjectIds}
            onSelectedWorkType={onSelectedWorkType}
            onSelectedTaskStatus={onSelectedTaskStatus}
            onCurrselectedtaskStatus={taskStatusName}
            onOpen={onOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_OverallProjectSummary;
