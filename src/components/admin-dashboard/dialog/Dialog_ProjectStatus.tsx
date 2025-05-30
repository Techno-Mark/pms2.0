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
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import Loading from "@/assets/icons/reports/Loading";
import ExportIcon from "@/assets/icons/ExportIcon";
import { toast } from "react-toastify";
import axios from "axios";
import {
  DashboardInitialFilter,
  ListProjectStatusSequence,
} from "@/utils/Types/dashboardTypes";

interface Status {
  name: string;
  Sequence: number;
}

interface ProjectStatusDialogProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData: DashboardInitialFilter;
  onSelectedProjectStatus: number;
}

const Dialog_ProjectStatus = ({
  onOpen,
  onClose,
  currentFilterData,
  onSelectedProjectStatus,
}: ProjectStatusDialogProps) => {
  const [allProjectStatus, setAllProjectStatus] = useState<Status[]>([]);
  const [projectStatus, setProjectStatus] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isClose, setIsClose] = useState<boolean>(false);
  const [canExport, setCanExport] = useState(false);

  useEffect(() => {
    onOpen && setIsClose(false);
  }, [onOpen]);

  const handleClose = () => {
    onClose();
    setProjectStatus(0);
    setIsClose(false);
    setCanExport(false);
  };

  const getProjectStatusList = async () => {
    const workTypeIdFromLocalStorage =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("workTypeId")
        : 3;
    const params = {
      Clients: currentFilterData.Clients,
      WorkTypeId:
        currentFilterData.WorkTypeId === null
          ? Number(workTypeIdFromLocalStorage)
          : currentFilterData.WorkTypeId,
      DepartmentIds: currentFilterData.DepartmentIds,
      AssigneeIds: currentFilterData.AssigneeIds,
      ReviewerIds: currentFilterData.ReviewerIds,
      StartDate: currentFilterData.StartDate,
      EndDate: currentFilterData.EndDate,
      ProjectId: null,
    };
    const url = `${process.env.report_api_url}/dashboard/projectstatusgraph`;
    const successCallback = (
      ResponseData: { List: ListProjectStatusSequence[]; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        const statusName: Status[] | [] = ResponseData.List.map(
          (item: ListProjectStatusSequence) => ({
            name: item.Key,
            Sequence: item.Sequence,
          })
        );

        setAllProjectStatus(statusName);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (onOpen === true) {
        await getProjectStatusList();
      }
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData, onOpen]);

  const exportReport = async () => {
    try {
      setIsExporting(true);

      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const response = await axios.post(
        `${process.env.report_api_url}/dashboard/projectstatuslist/export`,
        {
          PageNo: 1,
          PageSize: 50000,
          SortColumn: null,
          IsDesc: true,
          Clients: currentFilterData.Clients,
          WorkTypeId:
            currentFilterData.WorkTypeId === null
              ? 0
              : currentFilterData.WorkTypeId,
          DepartmentIds: currentFilterData.DepartmentIds,
          StartDate: currentFilterData.StartDate,
          EndDate: currentFilterData.EndDate,
          ProjectId: null,
          Key: projectStatus > 0 ? projectStatus : onSelectedProjectStatus,
          IsDownload: true,
        },
        {
          headers: { Authorization: `bearer ${token}`, org_token: Org_Token },
          responseType: "arraybuffer",
        }
      );

      handleExportResponse(response);
    } catch (error: any) {
      setIsExporting(false);
      toast.error(error);
    }
  };

  const handleExportResponse = (response: any) => {
    if (response.status === 200) {
      if (response.data.ResponseStatus === "Failure") {
        setIsExporting(false);
        toast.error("Please try again later.");
      } else {
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Task_Status_report.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setIsExporting(false);
      }
    } else {
      setIsExporting(false);
      toast.error("Please try again.");
    }
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
          <span className="font-semibold text-lg">Project Status</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px] !py-0">
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
                value={
                  projectStatus > 0 ? projectStatus : onSelectedProjectStatus
                }
                onChange={(e) => setProjectStatus(Number(e.target.value))}
                sx={{ height: "36px" }}
              >
                {allProjectStatus.map((i: Status) => (
                  <MenuItem value={i.Sequence} key={i.name}>
                    {i.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ColorToolTip title="Export" placement="top" arrow>
              <span
                className={`${
                  canExport
                    ? "cursor-pointer"
                    : "pointer-events-none opacity-50"
                } ${isExporting ? "cursor-default" : "cursor-pointer"} ml-5`}
                onClick={canExport ? exportReport : undefined}
              >
                {isExporting ? <Loading /> : <ExportIcon />}
              </span>
            </ColorToolTip>
          </div>
          <Datatable_ProjectStatus
            currentFilterData={currentFilterData}
            onSelectedProjectStatus={onSelectedProjectStatus}
            onCurrSelectedProjectStatus={projectStatus}
            onOpen={onOpen}
            isClose={isClose}
            onHandleExport={(e) => setCanExport(e)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_ProjectStatus;
