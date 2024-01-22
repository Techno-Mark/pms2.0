import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
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

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData?: any;
  isCompletedTaskClicked?: any;
}

const initialFilter = {
  ProjectIds: null,
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

const FilterDialog: React.FC<FilterModalProps> = ({
  onOpen,
  onClose,
  currentFilterData,
  isCompletedTaskClicked,
}) => {
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [statusDropdownWorklogData, setStatusDropdownWorklogData] = useState(
    []
  );
  const [statusDropdownCompletedData, setStatusDropdownCompletedData] =
    useState([]);
  const [typeOfWorkDropdownData, setTypeOfWorkDropdownData] = useState([]);
  const [assigneeDropdownData, setAssigneeDropdownData] = useState([]);

  const [project, setProject] = useState<null | number>(0);
  const [priority, setPriority] = useState<null | number>(0);
  const [status, setStatus] = useState<null | number>(0);
  const [typeOfWork, setTypeOfWork] = useState<null | number>(0);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [dueDate, setDueDate] = useState<null | string>(null);
  const [assignee, setAssignee] = useState<null | number>(0);
  const [overDue, setOverDue] = useState<null | number>(0);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<any | any[]>([]);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    currentFilterData(initialFilter);
    handleResetAll();
  }, [isCompletedTaskClicked]);

  const handleClose = () => {
    handleResetAll();
    onClose();
  };

  const handleResetAll = () => {
    setProject(0);
    setPriority(0);
    setStatus(0);
    setTypeOfWork(0);
    setDueDate(null);
    setStartDate(null);
    setEndDate(null);
    setAssignee(0);
    setOverDue(0);
    setIsChecked(false);
    currentFilterData(initialFilter);
  };

  useEffect(() => {
    const isAnyFieldSelected =
      project !== 0 ||
      priority !== 0 ||
      status !== 0 ||
      typeOfWork !== 0 ||
      dueDate !== null ||
      startDate !== null ||
      endDate !== null ||
      assignee !== 0 ||
      overDue !== 0 ||
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
      ProjectIds: project === 0 ? [] : [project] || null,
      PriorityId: priority || null,
      StatusId: status || null,
      WorkTypeId: typeOfWork || null,
      DueDate:
        dueDate !== null
          ? new Date(
              new Date(dueDate).getTime() + 24 * 60 * 60 * 1000
            ).toISOString()
          : null,
      StartDate:
        startDate !== null
          ? new Date(
              new Date(startDate).getTime() + 24 * 60 * 60 * 1000
            ).toISOString()
          : null,
      EndDate:
        endDate !== null
          ? new Date(
              new Date(endDate).getTime() + 24 * 60 * 60 * 1000
            ).toISOString()
          : null,
      AssignedTo: assignee || null,
      OverdueBy: overDue || null,
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
    currentFilterData(currSelectedFields);
    onClose();
  };

  const getProjectData = async () => {
    const clientId = await localStorage.getItem("clientId");
    setProjectDropdownData(await getProjectDropdownData(clientId));
    getWorkTypeData();
  };

  const getWorkTypeData = async () => {
    const clientId = await localStorage.getItem("clientId");
    setTypeOfWorkDropdownData(await getTypeOfWorkDropdownData(clientId));
    getAllStatus();
  };

  const getAllStatus = async () => {
    const data = await getStatusDropdownData();
    data.length > 0 &&
      setStatusDropdownWorklogData(
        data.filter(
          (i: any) =>
            i.Type !== "Accept" &&
            i.Type !== "AcceptWithNotes" &&
            i.Type !== "Reject" &&
            i.Type !== "SignedOff"
        )
      );
    data.length > 0 &&
      setStatusDropdownCompletedData(
        data.filter(
          (i: any) =>
            i.Type !== "PendingFromAccounting" &&
            i.Type !== "Assigned" &&
            i.Type !== "Errorlogs" &&
            i.Type !== "InProgress" &&
            i.Type !== "InReview" &&
            i.Type !== "OnHoldFromClient" &&
            i.Type !== "ReworkInReview" &&
            i.Type !== "ReworkInProgress" &&
            i.Type !== "ReworkPrepCompleted" &&
            i.Type !== "ReworkSubmitted" &&
            i.Type !== "SecondManagerReview" &&
            i.Type !== "Submitted" &&
            i.Type !== "SecondManagerReview" &&
            i.Type !== "NotStarted" &&
            i.Type !== "OnHoldFromClient" &&
            i.Type !== "PartialSubmitted" &&
            i.Type !== "Rework" &&
            i.Type !== "Reject" &&
            i.Type !== "Stop" &&
            i.Type !== "WithdrawnbyClient" &&
            i.Type !== "WithDraw"
        )
      );
    getAssignee();
  };

  const getAssignee = async () => {
    const params = {};
    const url = `${process.env.api_url}/user/GetAssigneeFilterDropdown`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setAssigneeDropdownData(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  useEffect(() => {
    onOpen && getProjectData();
  }, [onOpen]);

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
                <InputLabel id="project">Project</InputLabel>
                <Select
                  labelId="project"
                  id="project"
                  value={project === 0 ? "" : project}
                  onChange={(e: any) => setProject(e.target.value)}
                >
                  {projectDropdownData.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <InputLabel id="priority">Priority</InputLabel>
                <Select
                  labelId="priority"
                  id="priority"
                  value={priority === 0 ? "" : priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                >
                  <MenuItem value={1}>High</MenuItem>
                  <MenuItem value={2}>Medium</MenuItem>
                  <MenuItem value={3}>Low</MenuItem>
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <InputLabel id="status">Status</InputLabel>
                <Select
                  labelId="status"
                  id="status"
                  value={status === 0 ? "" : status}
                  onChange={(e: any) => {
                    setStatus(e.target.value);
                    e.target.value === 13
                      ? setIsChecked(true)
                      : setIsChecked(false);
                  }}
                >
                  {isCompletedTaskClicked
                    ? statusDropdownCompletedData.map((i: any) => (
                        <MenuItem value={i.value} key={i.value}>
                          {i.label}
                        </MenuItem>
                      ))
                    : statusDropdownWorklogData.map((i: any) => (
                        <MenuItem value={i.value} key={i.value}>
                          {i.label}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </div>
            <div className="flex gap-[20px]">
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <InputLabel id="workTypes-label">Types of Work</InputLabel>
                <Select
                  labelId="workTypes-label"
                  id="workTypes-select"
                  value={typeOfWork === 0 ? "" : typeOfWork}
                  onChange={(e: any) => setTypeOfWork(e.target.value)}
                >
                  {typeOfWorkDropdownData.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    shouldDisableDate={isWeekend}
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
                    shouldDisableDate={isWeekend}
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
            </div>
            <div className="flex gap-[20px]">
              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Due Date"
                    shouldDisableDate={isWeekend}
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

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <InputLabel id="assignee-label">Assignee</InputLabel>
                <Select
                  labelId="assignee-label"
                  id="assignee-select"
                  value={assignee === 0 ? "" : assignee}
                  onChange={(e: any) => setAssignee(e.target.value)}
                >
                  {assigneeDropdownData.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <InputLabel id="overdueBy-label">Overdue By</InputLabel>
                <Select
                  labelId="overdueBy-label"
                  id="overdueBy-select"
                  value={overDue === 0 ? "" : overDue}
                  onChange={(e: any) => setOverDue(e.target.value)}
                >
                  <MenuItem value={1}>All</MenuItem>
                  <MenuItem value={2}>Yesterday</MenuItem>
                  <MenuItem value={3}>LastWeek</MenuItem>
                </Select>
              </FormControl>
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

          <Button variant="outlined" color="info" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilterDialog;
