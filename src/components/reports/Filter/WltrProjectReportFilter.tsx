import React, { useEffect, useState } from "react";
import { FilterType } from "../types/ReportsFilterType";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { isWeekend } from "@/utils/commonFunction";
import dayjs from "dayjs";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { getFormattedDate } from "@/utils/timerFunctions";

const InitialFilter = {
  StartDate: null,
  EndDate: null,
};

const WltrProjectReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [startDate, setStartDate] = useState<string | number>("");
  const [endDate, setEndDate] = useState<string | number>("");
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);

  const handleResetAll = () => {
    setStartDate("");
    setEndDate("");
    onDialogClose(false);

    sendFilterToPage({
      ...InitialFilter,
    });
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...InitialFilter,
      StartDate:
        startDate.toString().trim().length <= 0
          ? endDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(endDate)
          : getFormattedDate(startDate),
      EndDate:
        endDate.toString().trim().length <= 0
          ? startDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
    });

    onDialogClose(false);
  };

  useEffect(() => {
    const isAnyFieldSelected =
      startDate.toString().trim().length > 0 ||
      endDate.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [startDate, endDate]);

  return (
    <Dialog
      open={isFiltering}
      TransitionComponent={DialogTransition}
      keepMounted
      maxWidth="md"
      onClose={() => onDialogClose(false)}
    >
      <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
        <span className="text-lg font-medium">Filter</span>
        <Button color="error" onClick={handleResetAll}>
          Reset all
        </Button>
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-[20px] pt-[15px]">
          <div className="flex gap-[20px]">
            <div
              className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  shouldDisableDate={isWeekend}
                  maxDate={dayjs(Date.now()) || dayjs(endDate)}
                  value={startDate === "" ? null : dayjs(startDate)}
                  onChange={(newValue: any) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      readOnly: true,
                    } as Record<string, any>,
                  }}
                />
              </LocalizationProvider>
            </div>
            <div
              className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  shouldDisableDate={isWeekend}
                  minDate={dayjs(startDate)}
                  maxDate={dayjs(Date.now())}
                  value={endDate === "" ? null : dayjs(endDate)}
                  onChange={(newValue: any) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      readOnly: true,
                    } as Record<string, any>,
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
        <Button
          variant="contained"
          color="info"
          className={`${anyFieldSelected && "!bg-secondary"}`}
          disabled={!anyFieldSelected}
          onClick={handleFilterApply}
        >
          Apply Filter
        </Button>

        <Button
          variant="outlined"
          color="info"
          onClick={() => onDialogClose(false)}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WltrProjectReportFilter;
