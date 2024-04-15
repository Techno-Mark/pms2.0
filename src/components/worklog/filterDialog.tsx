import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { isWeekend } from "@/utils/commonFunction";
import {
  getProjectDropdownData,
  getStatusDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { getFormattedDate } from "@/utils/timerFunctions";
import { TaskFilter } from "@/utils/Types/clientWorklog";
import { LabelValue, LabelValueType } from "@/utils/Types/types";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData?: (data: TaskFilter) => void;
  isCompletedTaskClicked?: boolean;
}

interface FilterFields {
  ProjectIds: number[] | [];
  PriorityId: number | null;
  StatusId: number | null;
  WorkTypeId: number | null;
  DueDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
  AssignedTo: number | null;
  OverdueBy: number | null;
  IsSignedOff: boolean;
}

const initialFilter = {
  ProjectIds: [],
  PriorityId: null,
  StatusId: null,
  WorkTypeId: null,
  StartDate: null,
  EndDate: null,
  DueDate: null,
  AssignedTo: null,
  OverdueBy: null,
  IsSignedOff: false,
};

const FilterDialog = ({
  onOpen,
  onClose,
  currentFilterData,
  isCompletedTaskClicked,
}: FilterModalProps) => {
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [statusDropdownWorklogData, setStatusDropdownWorklogData] = useState(
    []
  );
  const [statusDropdownCompletedData, setStatusDropdownCompletedData] =
    useState([]);
  const [typeOfWorkDropdownData, setTypeOfWorkDropdownData] = useState([]);
  const [assigneeDropdownData, setAssigneeDropdownData] = useState<
    LabelValue[] | []
  >([]);

  const [typeOfWork, setTypeOfWork] = useState<LabelValue | null>(null);
  const [project, setProject] = useState<LabelValue | null>(null);
  const [status, setStatus] = useState<LabelValue | null>(null);
  const [priority, setPriority] = useState<LabelValue | null>(null);
  const [assignee, setAssignee] = useState<LabelValue | null>(null);
  const [overDue, setOverDue] = useState<LabelValue | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] =
    useState<FilterFields>(initialFilter);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    currentFilterData?.(initialFilter);
    handleResetAll();
  }, [isCompletedTaskClicked]);

  const handleResetAll = () => {
    setTypeOfWork(null);
    setProject(null);
    setStatus(null);
    setPriority(null);
    setDueDate(null);
    setStartDate(null);
    setEndDate(null);
    setAssignee(null);
    setOverDue(null);
    setIsChecked(false);
    setStatusDropdownWorklogData([]);
    setStatusDropdownCompletedData([]);
    currentFilterData?.(initialFilter);
  };

  useEffect(() => {
    const isAnyFieldSelected =
      project !== null ||
      priority !== null ||
      status !== null ||
      typeOfWork !== null ||
      dueDate !== null ||
      startDate !== null ||
      endDate !== null ||
      assignee !== null ||
      overDue !== null ||
      isChecked !== false;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [
    project,
    priority,
    status,
    typeOfWork,
    dueDate,
    startDate,
    endDate,
    assignee,
    overDue,
    isChecked,
  ]);

  useEffect(() => {
    const selectedFields = {
      ProjectIds: project !== null ? [project?.value] : [],
      PriorityId: priority !== null ? priority.value : null,
      StatusId: status !== null ? status.value : null,
      WorkTypeId: typeOfWork !== null ? typeOfWork.value : null,
      DueDate: dueDate !== null ? getFormattedDate(dueDate) || "" : null,
      StartDate: startDate !== null ? getFormattedDate(startDate) || "" : null,
      EndDate: endDate !== null ? getFormattedDate(endDate) || "" : null,
      AssignedTo: assignee !== null ? assignee.value : null,
      OverdueBy: overDue !== null ? overDue.value : null,
      IsSignedOff: isChecked,
    };
    setCurrSelectedFileds(selectedFields);
  }, [
    project,
    priority,
    status,
    typeOfWork,
    dueDate,
    startDate,
    endDate,
    assignee,
    overDue,
    isChecked,
  ]);

  const sendFilterToPage = () => {
    currentFilterData?.(currSelectedFields);
    onClose();
  };

  useEffect(() => {
    typeOfWork !== null && typeOfWork.value > 0 && getAllStatus();
    typeOfWork === null && setStatusDropdownWorklogData([]);
    typeOfWork === null && setStatusDropdownCompletedData([]);
  }, [typeOfWork]);

  const getAllStatus = async () => {
    const data = await getStatusDropdownData(typeOfWork?.value);
    data.length > 0 &&
      setStatusDropdownWorklogData(
        data.filter(
          (i: LabelValueType) =>
            i.Type !== "Accept" &&
            i.Type !== "AcceptWithNotes" &&
            i.Type !== "ReworkSubmitted" &&
            i.Type !== "ReworkAcceptWithNotes" &&
            i.Type !== "Reject" &&
            i.Type !== "SignedOff"
        )
      );
    data.length > 0 &&
      setStatusDropdownCompletedData(
        data
          .map((i: LabelValueType) =>
            i.Type === "Accept" ||
            i.Type === "AcceptWithNotes" ||
            i.Type === "ReworkSubmitted" ||
            i.Type === "ReworkAcceptWithNotes" ||
            i.Type === "SignedOff"
              ? i
              : false
          )
          .filter((j: LabelValueType | boolean) => j !== false)
      );
  };

  const getAssignee = async () => {
    const params = {};
    const url = `${process.env.api_url}/user/GetAssigneeFilterDropdown`;
    const successCallback = (
      ResponseData: LabelValue[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setAssigneeDropdownData(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  const getWorkTypeData = async () => {
    const clientId = await localStorage.getItem("clientId");
    setTypeOfWorkDropdownData(await getTypeOfWorkDropdownData(clientId));
    setProjectDropdownData(await getProjectDropdownData(clientId, null));
  };

  useEffect(() => {
    onOpen && getWorkTypeData();
    onOpen && getAssignee();
  }, [onOpen]);

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="md"
        onClose={() => onClose()}
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
                  options={typeOfWorkDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setTypeOfWork(data);
                    setStatus(null);
                  }}
                  value={typeOfWork}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Type Of Work"
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

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={
                    isCompletedTaskClicked
                      ? statusDropdownCompletedData
                      : statusDropdownWorklogData
                  }
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setStatus(data);
                    data !== null && data.value === 13 && setIsChecked(true);
                    data !== null && data.value !== 13 && setIsChecked(false);
                  }}
                  value={status}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Status" />
                  )}
                />
              </FormControl>
            </div>
            <div className="flex gap-[20px]">
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={[
                    { label: "High", value: 1 },
                    { label: "Medium", value: 2 },
                    { label: "Low", value: 3 },
                  ]}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setPriority(data);
                  }}
                  value={priority}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Priority"
                    />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={assigneeDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setAssignee(data);
                  }}
                  value={assignee}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Assignee"
                    />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={[
                    { label: "All", value: 1 },
                    { label: "Yesterday", value: 2 },
                    { label: "LastWeek", value: 3 },
                  ]}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setOverDue(data);
                  }}
                  value={overDue}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Overdue By"
                    />
                  )}
                />
              </FormControl>
            </div>
            <div className="flex gap-[20px]">
              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    value={startDate === null ? null : dayjs(startDate)}
                    onChange={(newDate: any) => setStartDate(newDate.$d)}
                    slotProps={{
                      textField: {
                        readOnly: true,
                      } as Record<string, any>,
                    }}
                  />
                </LocalizationProvider>
              </div>

              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    value={endDate === null ? null : dayjs(endDate)}
                    onChange={(newDate: any) => setEndDate(newDate.$d)}
                    slotProps={{
                      textField: {
                        readOnly: true,
                      } as Record<string, any>,
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Due Date"
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    value={dueDate === null ? null : dayjs(dueDate)}
                    onChange={(newDate: any) => setDueDate(newDate.$d)}
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
              {isCompletedTaskClicked && (
                <FormControlLabel
                  required
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                    />
                  }
                  className="ml-[0.5px]"
                  label="IsSignedOff"
                />
              )}
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

          <Button variant="outlined" color="info" onClick={() => onClose()}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilterDialog;
