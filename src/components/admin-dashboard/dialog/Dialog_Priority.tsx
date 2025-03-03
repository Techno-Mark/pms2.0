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
import { DialogTransition } from "@/utils/style/DialogTransition";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import Loading from "@/assets/icons/reports/Loading";
import ExportIcon from "@/assets/icons/ExportIcon";
import { toast } from "react-toastify";
import axios from "axios";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import Datatable_Priority from "../Datatables/Datatable_Priority";
import { priorityOptions } from "@/utils/staticDropdownData";

interface ErrorlogDialogProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData: DashboardInitialFilter;
  onSelectedPriority: number;
}

const Dialog_Priority = ({
  onOpen,
  onClose,
  currentFilterData,
  onSelectedPriority,
}: ErrorlogDialogProps) => {
  const [priority, setPriority] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isClose, setIsClose] = useState<boolean>(false);

  useEffect(() => {
    onOpen && onSelectedPriority > 0 && setPriority(onSelectedPriority);
    onOpen && setIsClose(false);
  }, [onOpen]);

  const handleClose = () => {
    onClose();
    setPriority(null);
    setIsClose(true);
  };

  const exportTaskPriorityListReport = async () => {
    try {
      setIsExporting(true);

      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const response = await axios.post(
        `${process.env.emailbox_api_url}/dashboard/GetPriorityDetailsForDashboard`,
        {
          PageNo: 1,
          PageSize: 50000,
          ClientId:
            !!currentFilterData.Clients && currentFilterData.Clients.length > 0
              ? currentFilterData.Clients
              : null,
          DepartmentId:
            !!currentFilterData.DepartmentIds &&
            currentFilterData.DepartmentIds.length > 0
              ? currentFilterData.DepartmentIds
              : null,
          AssignTo:
            !!currentFilterData.AssigneeIds &&
            currentFilterData.AssigneeIds.length > 0
              ? currentFilterData.AssigneeIds
              : null,
          ReportingManagerId:
            !!currentFilterData.ReviewerIds &&
            currentFilterData.ReviewerIds.length > 0
              ? currentFilterData.ReviewerIds
              : null,
          StartDate: currentFilterData.StartDate,
          EndDate: currentFilterData.EndDate,
          IsDownload: true,
          Type: priority !== null ? priority : onSelectedPriority,
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
        a.download = `EmailBox_Priority_report.xlsx`;
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
          <span className="font-semibold text-lg">
            Ticket Created - By Priority
          </span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px] !py-0">
          <div className="flex justify-end items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="Priority"
                id="Priority"
                value={priority !== null ? priority : null}
                onChange={(e) => setPriority(Number(e.target.value))}
                sx={{ height: "36px" }}
              >
                {[
                  { label: "All", value: 0 },
                  ...priorityOptions,
                  { value: 4, label: "NoPriority" },
                ].map((i: { label: string; value: number }) => (
                  <MenuItem value={i.value} key={i.label}>
                    {i.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ColorToolTip title="Export" placement="top" arrow>
              <span
                className={`${
                  isExporting ? "cursor-default" : "cursor-pointer"
                } ml-5 mt-5`}
                onClick={exportTaskPriorityListReport}
              >
                {isExporting ? <Loading /> : <ExportIcon />}
              </span>
            </ColorToolTip>
          </div>
          <Datatable_Priority
            currentFilterData={currentFilterData}
            onSelectedPriority={
              priority !== null
                ? priority
                : onSelectedPriority > 0
                ? onSelectedPriority
                : null
            }
            isClose={isClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_Priority;
