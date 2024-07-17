import { LabelValue } from "@/utils/Types/types";
import {
  getClientDropdownData,
  getProjectDropdownData,
} from "@/utils/commonDropdownApiCall";
import { isWeekend } from "@/utils/commonFunction";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { getFormattedDate } from "@/utils/timerFunctions";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData?: any;
}

const initialFilter = {
  ClientId: null,
  ProjectId: null,
  StartDate: null,
  EndDate: null,
  ReceivedFrom: null,
  ReceivedTo: null,
};

const TimelineFilterDialog = ({
  onOpen,
  onClose,
  currentFilterData,
}: FilterModalProps) => {
  const [clientDropdownData, setClientDropdownData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);

  const [clientName, setClientName] = useState<LabelValue | null>(null);
  const [project, setProject] = useState<LabelValue | null>(null);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [receivedFromDate, setReceivedFromDate] = useState<null | string>(null);
  const [receivedToDate, setReceivedToDate] = useState<null | string>(null);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<
    | {
        ClientId: number | null;
        ProjectId: number | null;
        StartDate: string | null | undefined;
        EndDate: string | null | undefined;
        ReceivedFrom: string | null | undefined;
        ReceivedTo: string | null | undefined;
      }
    | []
  >([]);

  const handleClose = () => {
    handleResetAll();
    onClose();
  };

  const handleResetAll = () => {
    setClientName(null);
    setProject(null);
    setStartDate(null);
    setEndDate(null);
    setReceivedFromDate(null);
    setReceivedToDate(null);
    currentFilterData?.(initialFilter);
  };

  useEffect(() => {
    const isAnyFieldSelected =
      clientName !== null ||
      project !== null ||
      startDate !== null ||
      endDate !== null ||
      receivedFromDate !== null ||
      receivedToDate !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [
    clientName,
    project,
    startDate,
    endDate,
    receivedFromDate,
    receivedToDate,
  ]);

  useEffect(() => {
    const selectedFields = {
      ClientId: clientName !== null ? clientName.value : null,
      ProjectId: project !== null ? project.value : null,
      StartDate:
        startDate === null
          ? endDate === null
            ? null
            : getFormattedDate(endDate)
          : getFormattedDate(startDate),
      EndDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
      ReceivedFrom:
        receivedFromDate === null
          ? receivedToDate === null
            ? null
            : getFormattedDate(receivedToDate)
          : getFormattedDate(receivedFromDate),
      ReceivedTo:
        receivedToDate === null
          ? receivedFromDate === null
            ? null
            : getFormattedDate(receivedFromDate)
          : getFormattedDate(receivedToDate),
    };
    setCurrSelectedFileds(selectedFields);
  }, [
    clientName,
    project,
    startDate,
    endDate,
    receivedFromDate,
    receivedToDate,
  ]);

  const sendFilterToPage = () => {
    currentFilterData(currSelectedFields);
    onClose();
  };

  const getClientData = async () => {
    setClientDropdownData(await getClientDropdownData());
  };

  const getProjectData = async (clientName: string | number) => {
    setProjectDropdownData(await getProjectDropdownData(clientName, null));
  };

  useEffect(() => {
    if (onOpen === true) {
      getClientData();
    }
  }, [onOpen]);

  useEffect(() => {
    clientName !== null && getProjectData(clientName?.value);
  }, [clientName]);

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="md"
        onClose={handleClose}
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
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={clientDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setClientName(data);
                    setProject(null);
                  }}
                  value={clientName}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Client Name"
                    />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={projectDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setProject(data);
                  }}
                  value={project}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Project" />
                  )}
                />
              </FormControl>
              <div
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Received From"
                    value={
                      receivedFromDate === null ? null : dayjs(receivedFromDate)
                    }
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    onChange={(newDate: any) => {
                      setReceivedFromDate(newDate.$d);
                    }}
                    slotProps={{
                      textField: {
                        readOnly: true,
                      } as Record<string, any>,
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            <div className="flex gap-[20px]">
              <div
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Received To"
                    value={
                      receivedToDate === null ? null : dayjs(receivedToDate)
                    }
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    onChange={(newDate: any) => {
                      setReceivedToDate(newDate.$d);
                    }}
                    slotProps={{
                      textField: {
                        readOnly: true,
                      } as Record<string, any>,
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Logged From"
                    value={startDate === null ? null : dayjs(startDate)}
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    onChange={(newDate: any) => {
                      setStartDate(newDate.$d);
                    }}
                    slotProps={{
                      textField: {
                        readOnly: true,
                      } as Record<string, any>,
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Logged To"
                    value={endDate === null ? null : dayjs(endDate)}
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    onChange={(newDate: any) => {
                      setEndDate(newDate.$d);
                    }}
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
            onClick={sendFilterToPage}
          >
            Apply Filter
          </Button>

          <Button variant="outlined" color="info" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TimelineFilterDialog;
