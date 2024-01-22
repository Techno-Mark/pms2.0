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

interface Status {
  Type: string;
  label: string;
  value: number;
}

interface DashboardSummaryListProps {
  onOpen: boolean;
  onClose: () => void;
  onSelectedWorkType: number;
  onClickedSummaryTitle: string;
}

const Dialog_DashboardSummaryList: React.FC<DashboardSummaryListProps> = ({
  onOpen,
  onClose,
  onSelectedWorkType,
  onClickedSummaryTitle,
}) => {
  const [summaryList, setSummaryList] = useState<Status[]>([]);
  const [summaryName, setSummaryName] = useState<string>("");

  const handleClose = () => {
    onClose();
    setSummaryName("");
  };

  const getProjectSummary = async () => {
    const params = {
      WorkTypeId: onSelectedWorkType === 0 ? null : onSelectedWorkType,
    };
    const url = `${process.env.report_api_url}/dashboard/summary`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setSummaryList(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getProjectSummary();
  }, [onSelectedWorkType]);

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
                value={summaryName ? summaryName : onClickedSummaryTitle}
                onChange={(e) => setSummaryName(e.target.value)}
                sx={{ height: "36px" }}
              >
                {summaryList.map((i: any) => (
                  <MenuItem value={i.Key} key={i.Key}>
                    {i.Key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Datatable_DashboardSummaryList
            onSelectedWorkType={onSelectedWorkType}
            onClickedSummaryTitle={onClickedSummaryTitle}
            onCurrSelectedSummaryTitle={summaryName}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_DashboardSummaryList;
