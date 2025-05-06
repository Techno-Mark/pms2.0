import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { DialogTitle, FormControl, IconButton, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";
import SearchIcon from "@/assets/icons/SearchIcon";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import Loading from "@/assets/icons/reports/Loading";
import ExportIcon from "@/assets/icons/ExportIcon";
import axios from "axios";
import { toast } from "react-toastify";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import Datatable_PeakPoductive from "../Datatables/Datatable_PeakPoductive";

interface PeakProductiveDialogProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData: DashboardInitialFilter;
  onSelectedData: number;
}

const Dialog_PeakPoductive = ({
  onOpen,
  onClose,
  currentFilterData,
  onSelectedData,
}: PeakProductiveDialogProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isClose, setIsClose] = useState<boolean>(false);
  const [canExport, setCanExport] = useState(false);

  useEffect(() => {
    onOpen && setIsClose(false);
  }, [onOpen]);

  const handleClose = () => {
    onClose();
    setSearchValue("");
    setIsClose(false);
    setCanExport(false);
  };

  const exportReport = async () => {
    try {
      setIsExporting(true);

      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const response = await axios.post(
        `${process.env.report_api_url}/dashboard/`,
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
          DepartmentIds: [onSelectedData],
          StartDate: currentFilterData.StartDate,
          EndDate: currentFilterData.EndDate,
          GlobalSearch: searchValue,
          IsDownload: true,
          AssigneeIds: currentFilterData.AssigneeIds,
          ReviewerIds: currentFilterData.ReviewerIds,
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
        a.download = `Dashboard_PeakProductive_report.xlsx`;
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
          <span className="font-semibold text-lg">Peak Productivity Hours</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-2 mt-[10px] !py-0">
          <div className="flex justify-between items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 220 }}>
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
            </FormControl>

            <div className="flex items-center justify-center">
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
          <Datatable_PeakPoductive
            currentFilterData={currentFilterData}
            onSelectedData={onSelectedData}
            onSearchValue={searchValue}
            isClose={isClose}
            onOpen={onOpen}
            onHandleExport={(e) => setCanExport(e)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_PeakPoductive;
