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
import { getEmailTypeData } from "@/utils/commonDropdownApiCall";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import Loading from "@/assets/icons/reports/Loading";
import ExportIcon from "@/assets/icons/ExportIcon";
import axios from "axios";
import { toast } from "react-toastify";
import { LabelValue } from "@/utils/Types/types";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import Datatable_EmailType from "../Datatables/Datatable_EmailType";

interface EmailTypeDialogProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData: DashboardInitialFilter;
  onSelectedStatusName: string;
}

const Dialog_EmailType = ({
  onOpen,
  onClose,
  currentFilterData,
  onSelectedStatusName,
}: EmailTypeDialogProps) => {
  const [allEmailType, setAllEmailType] = useState<LabelValue[]>([]);
  const [emailType, setEmailType] = useState<number | null>(null);
  const [clickedStatusName, setClickedStatusName] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isClose, setIsClose] = useState<boolean>(false);
  const [canExport, setCanExport] = useState(false);

  useEffect(() => {
    onOpen && setIsClose(false);
  }, [onOpen]);

  const handleClose = () => {
    onClose();
    setEmailType(null);
    setClickedStatusName("");
    setIsClose(true);
    setCanExport(false);
  };

  function getValueByLabelOrType(labelOrType: string): number | null {
    const email = allEmailType.find(
      (email: LabelValue) => email.label === labelOrType
    );
    if (email) {
      return email.value;
    } else {
      return null;
    }
  }

  useEffect(() => {
    setClickedStatusName(onSelectedStatusName);
    const emailTypeValue: number | null =
      getValueByLabelOrType(clickedStatusName);
    setEmailType(emailTypeValue);
  }, [clickedStatusName, onSelectedStatusName]);

  const handleChangeValue = (e: number) => {
    setEmailType(e);
  };

  const getAllStatus = async () => {
    const data = await getEmailTypeData();
    setAllEmailType([
      {
        label: "All",
        value: 0,
      },
      ...data,
      {
        label: "Un-categorized",
        value: -1,
      },
    ]);
  };

  useEffect(() => {
    getAllStatus();
  }, []);

  const exportReport = async () => {
    try {
      setIsExporting(true);

      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const response = await axios.post(
        `${process.env.emailbox_api_url}/dashboard/GetEmailTypeDetailsForDashboard`,
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
          Type:
            emailType !== null
              ? emailType
              : getValueByLabelOrType(onSelectedStatusName),
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
        a.download = `EmailBox_EmailType_report.xlsx`;
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
          <span className="font-semibold text-lg">Email Type</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-2 mt-[10px] !py-0">
          <div className="flex justify-end items-center">
            <div className="flex items-center justify-center">
              <FormControl sx={{ mx: 0.75, minWidth: 220 }}>
                <Select
                  labelId="Email Type"
                  id="Email Type"
                  value={emailType !== null ? emailType : null}
                  onChange={(e) => handleChangeValue(Number(e.target.value))}
                  sx={{ height: "36px" }}
                >
                  {allEmailType.map((i: LabelValue) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
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
          </div>
          <Datatable_EmailType
            currentFilterData={currentFilterData}
            onCurrentSelectedEmailType={
              emailType !== null
                ? emailType
                : getValueByLabelOrType(onSelectedStatusName)
            }
            isClose={isClose}
            onHandleExport={(e) => setCanExport(e)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_EmailType;
