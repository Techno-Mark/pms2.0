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
import Datatable_Errorlog from "../Datatables/Datatable_Errorlog";

interface ErrorlogDialogProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData: DashboardInitialFilter;
  onSelectedErrorlog: number;
}

const Dialog_Errorlog = ({
  onOpen,
  onClose,
  currentFilterData,
  onSelectedErrorlog,
}: ErrorlogDialogProps) => {
  const [errorlogImportStatus, setErrorlogImportStatus] = useState<number>(0);
  const [errorlogStatus, setErrorlogStatus] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isClose, setIsClose] = useState<boolean>(false);
  const allErrorlogStatus = [
    { label: "Resolved", value: 2 },
    { label: "Unresolved", value: 1 },
  ];
  const allErrorlogImportStatus = [
    { label: "None", value: 0 },
    { label: "Imported", value: 1 },
    { label: "Not Imported", value: 2 },
  ];
  const [canExport, setCanExport] = useState(false);

  useEffect(() => {
    onOpen && setIsClose(false);
    onOpen &&
      !!onSelectedErrorlog &&
      setErrorlogStatus(onSelectedErrorlog.toString() == "Resolved" ? 2 : 1);
  }, [onOpen]);

  const handleClose = () => {
    onClose();
    setErrorlogStatus(0);
    setIsClose(false);
    setCanExport(false);
  };

  const exportReport = async () => {
    try {
      setIsExporting(true);

      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const response = await axios.post(
        `${process.env.report_api_url}/dashboard/errorloglist/export`,
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
          Key: errorlogStatus !== null ? errorlogStatus : onSelectedErrorlog,
          IsDownload: true,
          IsImported:
            errorlogImportStatus > 0
              ? errorlogImportStatus == 2
                ? 0
                : errorlogImportStatus
              : null,
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
          <span className="font-semibold text-lg">Errorlog</span>
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
                labelId="Errorlog import Staus"
                id="Errorlog import Staus"
                value={errorlogImportStatus}
                onChange={(e) =>
                  setErrorlogImportStatus(Number(e.target.value))
                }
                sx={{ height: "36px" }}
              >
                {allErrorlogImportStatus.map(
                  (i: { label: string; value: number }) => (
                    <MenuItem value={i.value} key={i.label}>
                      {i.label}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="Errorlog Staus"
                id="Errorlog Staus"
                value={errorlogStatus > 0 ? errorlogStatus : onSelectedErrorlog}
                onChange={(e) => setErrorlogStatus(Number(e.target.value))}
                sx={{ height: "36px" }}
              >
                {allErrorlogStatus.map(
                  (i: { label: string; value: number }) => (
                    <MenuItem value={i.value} key={i.label}>
                      {i.label}
                    </MenuItem>
                  )
                )}
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
          <Datatable_Errorlog
            currentFilterData={currentFilterData}
            onSelectedErrorlog={onSelectedErrorlog}
            onCurrSelectedProjectStatus={errorlogStatus}
            errorlogImportStatus={errorlogImportStatus}
            onOpen={onOpen}
            isClose={isClose}
            onHandleExport={(e) => setCanExport(e)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_Errorlog;
