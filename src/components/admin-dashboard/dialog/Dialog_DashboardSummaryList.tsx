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
import Datatable_DashboardSummaryList from "../Datatables/Datatable_DashboardSummaryList";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { callAPI } from "@/utils/API/callAPI";
import Loading from "@/assets/icons/reports/Loading";
import ExportIcon from "@/assets/icons/ExportIcon";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { toast } from "react-toastify";
import axios from "axios";
import { KeyValueColorCodeSequence } from "@/utils/Types/types";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";

interface DashboardSummaryListProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData: DashboardInitialFilter;
  onClickedSummaryTitle: number;
}

const Dialog_DashboardSummaryList = ({
  onOpen,
  onClose,
  currentFilterData,
  onClickedSummaryTitle,
}: DashboardSummaryListProps) => {
  const [summaryList, setSummaryList] = useState<KeyValueColorCodeSequence[]>(
    []
  );
  const [summaryName, setSummaryName] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isClose, setIsClose] = useState<boolean>(false);

  useEffect(() => {
    onOpen && setIsClose(false);
  }, [onOpen]);

  const handleClose = () => {
    onClose();
    setSummaryName(0);
    setIsClose(true);
  };

  const getProjectSummary = async () => {
    const params = {
      Clients: currentFilterData.Clients,
      WorkTypeId:
        currentFilterData.WorkTypeId === null
          ? 0
          : currentFilterData.WorkTypeId,
      StartDate: currentFilterData.StartDate,
      EndDate: currentFilterData.EndDate,
    };
    const url = `${process.env.report_api_url}/dashboard/summary`;
    const successCallback = (
      ResponseData: KeyValueColorCodeSequence[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setSummaryList(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      await getProjectSummary();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData]);

  const exportTaskStatusReport = async () => {
    try {
      setIsExporting(true);

      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const response = await axios.post(
        `${process.env.report_api_url}/dashboard/dashboardsummarylist/export`,
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
          StartDate: currentFilterData.StartDate,
          EndDate: currentFilterData.EndDate,
          Key: summaryName ? summaryName : onClickedSummaryTitle,
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
        a.download = `Dashboard_Task_report.xlsx`;
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
          <span className="font-semibold text-lg">Task Status</span>
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
                labelId="summary list"
                id="summary list"
                value={summaryName > 0 ? summaryName : onClickedSummaryTitle}
                onChange={(e) => setSummaryName(Number(e.target.value))}
                sx={{ height: "36px" }}
              >
                {summaryList.map((i: KeyValueColorCodeSequence) => (
                  <MenuItem value={i.Sequence} key={i.Sequence}>
                    {i.Key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ColorToolTip title="Export" placement="top" arrow>
              <span
                className={`${
                  isExporting ? "cursor-default" : "cursor-pointer"
                } ml-5 mt-5`}
                onClick={exportTaskStatusReport}
              >
                {isExporting ? <Loading /> : <ExportIcon />}
              </span>
            </ColorToolTip>
          </div>
          <Datatable_DashboardSummaryList
            currentFilterData={currentFilterData}
            onClickedSummaryTitle={onClickedSummaryTitle}
            onCurrSelectedSummaryTitle={summaryName}
            isClose={isClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_DashboardSummaryList;
