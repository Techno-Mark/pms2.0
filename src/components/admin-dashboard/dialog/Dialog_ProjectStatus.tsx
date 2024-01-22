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
import Datatable_ProjectStatus from "../Datatables/Datatable_ProjectStatus";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { callAPI } from "@/utils/API/callAPI";

interface Status {
  Type: string;
  label: string;
  value: number;
}

interface ProjectStatusDialogProps {
  onOpen: boolean;
  onClose: () => void;
  onSelectedWorkType: number;
  onSelectedProjectStatus: string;
  onSelectedProjectIds: number[];
}

const Dialog_ProjectStatus: React.FC<ProjectStatusDialogProps> = ({
  onOpen,
  onClose,
  onSelectedWorkType,
  onSelectedProjectStatus,
  onSelectedProjectIds,
}) => {
  const [allProjectStatus, setAllProjectStatus] = useState<Status[]>([]);
  const [projectStatus, setProjectStatus] = useState<string>("");

  const handleClose = () => {
    onClose();
    setProjectStatus("");
  };

  const getProjectStatusList = async () => {
    const params = {
      WorkTypeId: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      ProjectId:
        onSelectedProjectIds.length === 0 ? null : onSelectedProjectIds,
    };
    const url = `${process.env.report_api_url}/dashboard/projectstatusgraph`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        const statusName: any = ResponseData.List.map((item: { Key: any }) => ({
          name: item.Key,
        }));

        setAllProjectStatus(statusName);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    if (onOpen === true) {
      getProjectStatusList();
    }
  }, [onSelectedWorkType, onSelectedProjectIds, onOpen]);

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
          <span className="font-semibold text-lg">Project Status</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px]">
          <div className="flex justify-end items-center">
            {/* <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <div className="flex items-center h-full relative">
                <TextField
                  className="m-0"
                  placeholder="Search"
                  fullWidth
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  margin="normal"
                  variant="standard"
                  sx={{ mx: 0.75, maxWidth: 300 }}
                />
                <span className="absolute right-1 pl-1">
                  <SearchIcon />
                </span>
              </div>
            </FormControl> */}

            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="Project Staus"
                id="Project Staus"
                value={projectStatus ? projectStatus : onSelectedProjectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
                sx={{ height: "36px" }}
              >
                {allProjectStatus.map((i: any) => (
                  <MenuItem value={i.name} key={i.name}>
                    {i.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Datatable_ProjectStatus
            onSelectedWorkType={onSelectedWorkType}
            onSelectedProjectStatus={onSelectedProjectStatus}
            onSelectedProjectIds={onSelectedProjectIds}
            onCurrSelectedProjectStatus={projectStatus}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_ProjectStatus;
