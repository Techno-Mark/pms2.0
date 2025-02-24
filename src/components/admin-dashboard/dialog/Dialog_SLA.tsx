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
import Datatable_SLA from "../Datatables/Datatable_SLA";

interface ErrorlogDialogProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData: DashboardInitialFilter;
  onSelectedSLA: number;
}

const Dialog_SLA = ({
  onOpen,
  onClose,
  currentFilterData,
  onSelectedSLA,
}: ErrorlogDialogProps) => {
  const [slaStatus, setSLAStatus] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    onOpen && onSelectedSLA > 0 && setSLAStatus(onSelectedSLA);
  }, [onOpen]);

  const handleClose = () => {
    onClose();
    setSLAStatus(null);
  };

  const exportTaskStatusListReport = async () => {
    try {
      setIsExporting(true);

      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const response = await axios.post(
        `${process.env.emailbox_api_url}/dashboard/GetSLATypeDetailsForDashboard/export`,
        {
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
          Type: slaStatus !== null ? slaStatus : onSelectedSLA,
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
        a.download = `EmailBox_SLA_report.xlsx`;
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
          <span className="font-semibold text-lg">SLA Tickets</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px] !py-0">
          <div className="flex justify-end items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="SLA Type"
                id="SLA Type"
                value={slaStatus !== null ? slaStatus : null}
                onChange={(e) => setSLAStatus(Number(e.target.value))}
                sx={{ height: "36px" }}
              >
                {[
                  { label: "All", value: 0 },
                  { label: "SLA Achieved", value: 1 },
                  { label: "At Risk", value: 3 },
                  { label: "SLA Not Achieved", value: 2 },
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
                onClick={exportTaskStatusListReport}
              >
                {isExporting ? <Loading /> : <ExportIcon />}
              </span>
            </ColorToolTip>
          </div>
          <Datatable_SLA
            currentFilterData={currentFilterData}
            onSelectedSLA={
              slaStatus !== null
                ? slaStatus
                : onSelectedSLA > 0
                ? onSelectedSLA
                : null
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_SLA;
