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
import {
  KeyValueColorCode,
  KeyValueColorCodeSequenceStatusId,
} from "@/utils/Types/types";
import { callAPI } from "@/utils/API/callAPI";

interface TaskStatusInfoDialogProps {
  onOpen: boolean;
  onClose: () => void;
  onWorkTypeData: string[];
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
  onSelectedStatusName: number;
}

const Dialog_TaskStatusInfo = ({
  onOpen,
  onClose,
  onWorkTypeData,
  onSelectedProjectIds,
  onSelectedStatusName,
  onSelectedWorkType,
}: TaskStatusInfoDialogProps) => {
  const [workType, setWorkType] = useState<number | any>(0);
  const [allStatus, setAllStatus] = useState<
    KeyValueColorCodeSequenceStatusId[] | []
  >([]);
  const [status, setStatus] = useState<number>(0);
  const [clickedStatusName, setClickedStatusName] = useState<number>(0);

  const handleClose = () => {
    onClose();
    setStatus(0);
    setWorkType(0);
    setClickedStatusName(0);
  };

  function getValueByLabelOrType(labelOrType: any): number {
    const status = allStatus.find(
      (status: KeyValueColorCodeSequenceStatusId) =>
        status.StatusId === labelOrType
    );

    if (status) {
      return status.StatusId;
    } else {
      return 0;
    }
  }

  useEffect(() => {
    setClickedStatusName(onSelectedStatusName);
    const statusValue: number = getValueByLabelOrType(clickedStatusName);
    setStatus(statusValue);
  }, [clickedStatusName, onSelectedStatusName]);

  const getData = () => {
    const params = {
      projectIds: onSelectedProjectIds,
      typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
    };
    const url = `${process.env.report_api_url}/clientdashboard/taskstatuscount`;
    const successCallback = (
      ResponseData: KeyValueColorCodeSequenceStatusId[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setAllStatus([
          {
            Key: "All",
            ColorCode: "#000000",
            Value: 2,
            Sequence: 0,
            StatusId: 0,
          },
          ...ResponseData,
        ]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      onOpen && getData();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [onOpen]);

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
                labelId="status"
                id="status"
                value={status ? status : clickedStatusName}
                onChange={(e) => setStatus(Number(e.target.value))}
                sx={{ height: "36px" }}
              >
                {allStatus.map((i: KeyValueColorCodeSequenceStatusId) => (
                  <MenuItem value={i.StatusId} key={i.Value}>
                    {i.Key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* <FormControl sx={{ mx: 0.75, minWidth: 150, marginTop: 1 }}>
              <Select
                labelId="workType"
                id="workType"
                value={workType === 0 ? 0 : workType}
                onChange={(e) => setWorkType(e.target.value)}
                sx={{ height: "36px" }}
              >
                <MenuItem value={0}>All</MenuItem>
                {onWorkTypeData?.map((i: any) => (
                  <MenuItem value={i.value} key={i.value}>
                    {i.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
          </div>
          <Datatable_TaskStatusInfo
            onSelectedProjectIds={onSelectedProjectIds}
            onSelectedWorkType={onSelectedWorkType}
            onSelectedStatusId={status}
            onOpen={onOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_TaskStatusInfo;
