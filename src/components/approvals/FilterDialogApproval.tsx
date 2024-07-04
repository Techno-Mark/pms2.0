import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Autocomplete, FormControl, TextField } from "@mui/material";
import {
  getCCDropdownData,
  getClientDropdownData,
  getDepartmentDropdownData,
  getProcessDropdownData,
  getProjectDropdownData,
  getStatusDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { isWeekend } from "@/utils/commonFunction";
import { getFormattedDate } from "@/utils/timerFunctions";
import {
  AppliedFilterApprovals,
  IdNameEstimatedHour,
  LabelValue,
  LabelValueProfileImage,
  LabelValueType,
} from "@/utils/Types/types";

interface FilterModalProps {
  activeTab: number;
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onDataFetch: () => void;
  currentFilterData?: (data: AppliedFilterApprovals) => void;
}

const initialFilter = {
  ClientId: null,
  TypeOfWork: null,
  userId: null,
  ProjectId: null,
  IsShowAll: 1,
  DepartmentId: null,
  ProcessId: null,
  StatusId: null,
  dueDate: null,
  startDate: null,
  endDate: null,
  DateFilter: null,
  startDateReview: null,
  endDateReview: null,
};

const FilterDialogApproval = ({
  activeTab,
  onOpen,
  onClose,
  currentFilterData,
}: FilterModalProps) => {
  const [clientName, setClientName] = useState<LabelValue | null>(null);
  const [workType, setWorkType] = useState<LabelValue | null>(null);
  const [userName, setUser] = useState<LabelValue | null>(null);
  const [projectName, setProjectName] = useState<LabelValue | null>(null);
  const [status, setStatus] = useState<LabelValueType | null>(null);
  const [department, setDepartment] = useState<LabelValueType | null>(null);
  const [processName, setProcessName] = useState<LabelValue | null>(null);
  const [clientDropdownData, setClientDropdownData] = useState([]);
  const [worktypeDropdownData, setWorktypeDropdownData] = useState([]);
  const [departmentDropdownData, setDepartmentDropdownData] = useState([]);
  const [userDropdownData, setUserData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [statusDropdownData, setStatusDropdownData] = useState([]);
  const [processDropdownData, setProcessDropdownData] = useState([]);
  const [date, setDate] = useState<null | string>(null);
  const [dueDate, setDueDate] = useState<null | string>(null);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [startDateReview, setStartDateReview] = useState<null | string>(null);
  const [endDateReview, setEndDateReview] = useState<null | string>(null);
  const [reviewer, setReviewer] = useState<LabelValueProfileImage | null>(null);
  const [reviewerDropdown, setReviewerDropdown] = useState<
    LabelValueProfileImage[]
  >([]);

  const [anyFieldSelected, setAnyFieldSelected] = useState<boolean>(false);
  const [currSelectedFields, setCurrSelectedFileds] =
    useState<AppliedFilterApprovals>(initialFilter);

  const sendFilterToPage = () => {
    currentFilterData?.(currSelectedFields);
    onClose();
  };

  const handleResetAll = () => {
    setClientName(null);
    setWorkType(null);
    setUser(null);
    setProjectName(null);
    setDepartment(null);
    setProcessName(null);
    setStatus(null);
    setDate(null);
    setDueDate(null);
    setStartDate(null);
    setEndDate(null);
    setStartDateReview(null);
    setEndDateReview(null);
    setReviewer(null);
    setProjectDropdownData([]);
    setProcessDropdownData([]);
    setStatusDropdownData([]);
    setAnyFieldSelected(false);
    currentFilterData?.(initialFilter);
  };

  const getDropdownData = async () => {
    setClientDropdownData(await getClientDropdownData());
    setUserData(await getCCDropdownData());
    setWorktypeDropdownData(await getTypeOfWorkDropdownData(0));
    const department = await getDepartmentDropdownData();
    setDepartmentDropdownData(department.DepartmentList);
    const userData = await getCCDropdownData();
    userData.length > 0
      ? setReviewerDropdown(userData)
      : setReviewerDropdown([]);
  };

  const getProjectData = async (clientName: number, workType: number) => {
    setProjectDropdownData(await getProjectDropdownData(clientName, workType));
  };

  const getProcessData = async (
    clientName: number,
    workType: number,
    department: number
  ) => {
    const processData = await getProcessDropdownData(
      clientName,
      workType,
      department
    );
    processData.length > 0
      ? setProcessDropdownData(
          processData?.map(
            (i: IdNameEstimatedHour) =>
              new Object({ label: i.Name, value: i.Id })
          )
        )
      : setProcessDropdownData([]);
  };

  const getAllStatusData = async (workType: number) => {
    const statusData = await getStatusDropdownData(workType);

    statusData.length > 0
      ? setStatusDropdownData(
          activeTab === 1
            ? statusData.filter(
                (item: LabelValueType) =>
                  item.Type === "InReview" ||
                  item.Type === "ReworkInReview" ||
                  item.Type === "PartialSubmitted" ||
                  item.Type === "Submitted" ||
                  item.Type === "ReworkSubmitted" ||
                  item.Type === "SecondManagerReview"
              )
            : statusData
        )
      : setStatusDropdownData([]);
  };

  useEffect(() => {
    if (onOpen === true) {
      getDropdownData();
    }
  }, [onOpen]);

  useEffect(() => {
    clientName !== null &&
      workType !== null &&
      getProjectData(clientName?.value, workType?.value);
  }, [clientName, workType]);

  useEffect(() => {
    clientName !== null &&
      workType !== null &&
      department !== null &&
      getProcessData(clientName?.value, workType?.value, department?.value);
  }, [clientName, workType, department]);

  useEffect(() => {
    workType !== null && getAllStatusData(workType?.value);
  }, [workType]);

  useEffect(() => {
    const isAnyFieldSelected: boolean =
      clientName !== null ||
      workType !== null ||
      userName !== null ||
      projectName !== null ||
      reviewer !== null ||
      status !== null ||
      department != null ||
      processName !== null ||
      date !== null ||
      dueDate !== null ||
      startDate !== null ||
      endDate !== null ||
      startDateReview !== null ||
      endDateReview !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [
    clientName,
    workType,
    userName,
    projectName,
    reviewer,
    department,
    processName,
    status,
    date,
    dueDate,
    startDate,
    endDate,
    startDateReview,
    endDateReview,
  ]);

  useEffect(() => {
    const selectedFields = {
      ClientId: clientName !== null ? clientName.value : null,
      TypeOfWork: workType !== null ? workType.value : null,
      userId: userName !== null ? userName.value : null,
      DepartmentId: department !== null ? department.value : null,
      ProjectId: projectName !== null ? projectName.value : null,
      IsShowAll: reviewer !== null ? reviewer.value : null,
      StatusId: status !== null ? status.value : null,
      ProcessId: processName !== null ? processName.value : null,
      DateFilter: date !== null ? getFormattedDate(date) : null,
      dueDate: dueDate !== null ? getFormattedDate(dueDate) : null,
      startDate:
        startDate === null
          ? endDate === null
            ? null
            : getFormattedDate(endDate)
          : getFormattedDate(startDate),
      endDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
      startDateReview:
        startDateReview === null
          ? endDateReview === null
            ? null
            : getFormattedDate(endDateReview)
          : getFormattedDate(startDateReview),
      endDateReview:
        endDateReview === null
          ? startDateReview === null
            ? null
            : getFormattedDate(startDateReview)
          : getFormattedDate(endDateReview),
    };
    setCurrSelectedFileds(selectedFields);
  }, [
    clientName,
    workType,
    userName,
    projectName,
    reviewer,
    department,
    processName,
    status,
    date,
    dueDate,
    startDate,
    endDate,
    startDateReview,
    endDateReview,
  ]);

  useEffect(() => {
    handleResetAll();
  }, [activeTab]);

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
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={clientDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
                    setClientName(data);
                    setProjectName(null);
                    setProcessName(null);
                    setProcessName(null);
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

              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={worktypeDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
                    setWorkType(data);
                    setProjectName(null);
                    setProcessName(null);
                    setStatus(null);
                  }}
                  value={workType}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Type Of Work"
                    />
                  )}
                />
              </FormControl>

              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={userDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
                    setUser(data);
                  }}
                  value={userName}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Employee Name"
                    />
                  )}
                />
              </FormControl>
            </div>
            <div className="flex gap-[20px]">
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={projectDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
                    setProjectName(data);
                  }}
                  value={projectName}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Project Name"
                    />
                  )}
                />
              </FormControl>

              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={departmentDropdownData}
                  getOptionLabel={(option: LabelValueType) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValueType | null
                  ) => {
                    setDepartment(data);
                    setProcessName(null);
                  }}
                  value={department}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Department"
                    />
                  )}
                />
              </FormControl>

              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={processDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
                    setProcessName(data);
                  }}
                  value={processName}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Process Name"
                    />
                  )}
                />
              </FormControl>
            </div>
            <div className="flex gap-[20px]">
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={statusDropdownData}
                  getOptionLabel={(option: LabelValueType) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValueType | null
                  ) => {
                    setStatus(data);
                  }}
                  value={status}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Status" />
                  )}
                />
              </FormControl>

              {activeTab === 1 && (
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={date === null ? null : dayjs(date)}
                      onChange={(newDate: any) => {
                        setDate(newDate.$d);
                      }}
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
              )}
              {activeTab === 2 && (
                <>
                  <FormControl
                    variant="standard"
                    sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
                  >
                    <Autocomplete
                      id="tags-standard"
                      options={reviewerDropdown}
                      getOptionLabel={(option: LabelValueProfileImage) =>
                        option.label
                      }
                      onChange={(
                        e: React.ChangeEvent<{}>,
                        data: LabelValueProfileImage | null
                      ) => {
                        setReviewer(data);
                      }}
                      value={reviewer}
                      renderInput={(params: any) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label="Reviewer"
                        />
                      )}
                    />
                  </FormControl>
                  <div
                    className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Due Date"
                        value={dueDate === null ? null : dayjs(dueDate)}
                        onChange={(newDate: any) => {
                          setDueDate(newDate.$d);
                        }}
                        // shouldDisableDate={isWeekend}
                        maxDate={dayjs(Date.now())}
                        slotProps={{
                          textField: {
                            readOnly: true,
                          } as Record<string, any>,
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </>
              )}
            </div>
            {activeTab === 2 && (
              <div className="flex gap-[20px]">
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Preparation From"
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
                      label="Preparation To"
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
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Review From"
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(endDateReview)}
                      value={
                        startDateReview === null ? null : dayjs(startDateReview)
                      }
                      onChange={(newValue: any) => setStartDateReview(newValue)}
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            )}
            {activeTab === 2 && (
              <div className="flex gap-[20px]">
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Review To"
                      // shouldDisableDate={isWeekend}
                      minDate={dayjs(startDateReview)}
                      maxDate={dayjs(Date.now())}
                      value={
                        endDateReview === null ? null : dayjs(endDateReview)
                      }
                      onChange={(newValue: any) => setEndDateReview(newValue)}
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            )}
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

export default FilterDialogApproval;
