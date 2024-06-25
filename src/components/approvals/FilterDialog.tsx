import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Autocomplete, FormControl, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { isWeekend } from "@/utils/commonFunction";
import {
  getCCDropdownData,
  getClientDropdownData,
  getDepartmentDropdownData,
  getProcessDropdownData,
  getProjectDropdownData,
  getStatusDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { getFormattedDate } from "@/utils/timerFunctions";
import {
  AppliedFilterApprovals,
  IdNameEstimatedHour,
  LabelValue,
  LabelValueProfileImage,
  LabelValueType,
} from "@/utils/Types/types";
import { FilterWorklogsPage } from "@/utils/Types/worklogsTypes";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onDataFetch: () => void;
  onCurrentFilterId: number;
  //   currentFilterData?: (data: AppliedFilterWorklogsPage) => void;
  currentFilterData?: any;
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

const FilterDialog = ({
  onOpen,
  onClose,
  onDataFetch,
  onCurrentFilterId,
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
  const [userDropdownData, setUserDropdownData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [statusDropdownData, setStatusDropdownData] = useState([]);
  const [processDropdownData, setProcessDropdownData] = useState([]);
  const [date, setDate] = useState<null | string>(null);
  const [dueDate, setDueDate] = useState<null | string>(null);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [startDateReview, setStartDateReview] = useState<null | string>(null);
  const [endDateReview, setEndDateReview] = useState<null | string>(null);
  const [reviewer, setReviewer] = useState<LabelValue | null>({
    label: "Yes",
    value: 1,
  });
  const [reviewerDropdown, setReviewerDropdown] = useState<LabelValue[]>([
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
  ]);

  let isHaveManageAssignee: undefined | string | boolean | null;
  const [filterName, setFilterName] = useState("");
  const [appliedFilterData, setAppliedFilterData] = useState<any>([]);
  const [saveFilter, setSaveFilter] = useState(false);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] =
    useState<AppliedFilterApprovals>(initialFilter);
  const [error, setError] = useState("");

  if (typeof localStorage !== "undefined") {
    isHaveManageAssignee = localStorage.getItem("IsHaveManageAssignee");
  }

  const sendFilterToPage = () => {
    currentFilterData?.(currSelectedFields);
    onClose();
  };

  const clearData = () => {
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
    setReviewer({ label: "Yes", value: 1 });
    setSaveFilter(false);
    setFilterName("");
    setError("");
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
    setReviewer({ label: "Yes", value: 1 });
    setProjectDropdownData([]);
    setProcessDropdownData([]);
    setStatusDropdownData([]);
    setSaveFilter(false);
    setFilterName("");
    setAnyFieldSelected(false);
    currentFilterData?.(initialFilter);
    setStatusDropdownData([]);
    setError("");
  };

  const handleResetAllClose = () => {
    handleResetAll();
    onClose();
  };

  useEffect(() => {
    onCurrentFilterId === 0 && handleResetAll();
  }, [onCurrentFilterId]);

  const getDropdownData = async () => {
    setClientDropdownData(await getClientDropdownData());
    setUserDropdownData(await getCCDropdownData());
    setWorktypeDropdownData(await getTypeOfWorkDropdownData(0));
    const department = await getDepartmentDropdownData();
    setDepartmentDropdownData(department.DepartmentList);
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
      ? setStatusDropdownData(statusData)
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

  const saveCurrentFilter = async () => {
    if (filterName.trim().length === 0) {
      setError("This is required field!");
    } else if (filterName.trim().length > 15) {
      setError("Max 15 characters allowed!");
    } else {
      setError("");
      const params = {
        filterId: onCurrentFilterId !== 0 ? onCurrentFilterId : null,
        name: filterName,
        AppliedFilter: {
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
        },
        type: 21,
      };
      const url = `${process.env.worklog_api_url}/filter/savefilter`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(
            `Filter has been ${
              onCurrentFilterId > 0 ? "updated" : "saved"
            } successully.`
          );
          setSaveFilter(false);
          onDataFetch();
          sendFilterToPage();
          clearData();
          onClose();
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const getFilterList = async (filterId: number) => {
    const params = {
      type: 21,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: FilterWorklogsPage[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const filteredData = ResponseData.filter(
          (filter: FilterWorklogsPage) => filter.FilterId === filterId
        );

        if (filteredData.length > 0) {
          setAppliedFilterData(filteredData);
        }
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const isAnyFieldSelected =
      clientName !== null ||
      workType !== null ||
      userName !== null ||
      projectName !== null ||
      (reviewer !== null && reviewer.value !== 1) ||
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
    onOpen && getFilterList(onCurrentFilterId);
  }, [onCurrentFilterId, onOpen]);

  useEffect(() => {
    const getFilterData = async () => {
      const appliedFilter = appliedFilterData[0].AppliedFilter;

      if (appliedFilter) {
        const {
          ClientId,
          TypeOfWork,
          userId,
          ProjectId,
          IsShowAll,
          DepartmentId,
          ProcessId,
          StatusId,
          dueDate,
          startDate,
          endDate,
          DateFilter,
          startDateReview,
          endDateReview,
        } = appliedFilter;

        setClientName(
          ClientId !== null && ClientId > 0
            ? clientDropdownData.filter(
                (item: LabelValue) => item.value === ClientId
              )[0]
            : null
        );
        setUser(
          userId !== null && userId > 0
            ? (await getCCDropdownData()).filter(
                (item: LabelValue) => item.value === userId
              )[0]
            : null
        );
        setWorkType(
          TypeOfWork !== null && TypeOfWork > 0
            ? (await getTypeOfWorkDropdownData(0)).filter(
                (item: LabelValue) => item.value === TypeOfWork
              )[0]
            : null
        );
        setProjectName(
          ClientId !== null &&
            ClientId > 0 &&
            TypeOfWork !== null &&
            TypeOfWork > 0 &&
            ProjectId !== null &&
            ProjectId > 0
            ? (await getProjectDropdownData(ClientId, TypeOfWork)).filter(
                (item: LabelValue) => item.value === ProjectId
              )[0]
            : null
        );
        setReviewer(
          IsShowAll !== null
            ? reviewerDropdown.filter(
                (item: LabelValue) => item.value === IsShowAll
              )[0]
            : null
        );
        setDepartment(
          DepartmentId !== null && DepartmentId > 0
            ? (await getDepartmentDropdownData()).DepartmentList.filter(
                (item: LabelValue) => item.value === DepartmentId
              )[0]
            : null
        );
        setProcessName(
          ClientId !== null &&
            ClientId > 0 &&
            TypeOfWork !== null &&
            TypeOfWork > 0 &&
            DepartmentId !== null &&
            DepartmentId > 0 &&
            ProcessId !== null &&
            ProcessId > 0
            ? (await getProcessDropdownData(ClientId, TypeOfWork, DepartmentId))
                .map(
                  (i: IdNameEstimatedHour) =>
                    new Object({ label: i.Name, value: i.Id })
                )
                .filter((item: LabelValue) => item.value === ProcessId)[0]
            : null
        );
        setStatus(
          TypeOfWork !== null && TypeOfWork > 0 && StatusId !== null
            ? (await getStatusDropdownData(TypeOfWork)).filter(
                (item: LabelValueType) => item.value === StatusId
              )[0]
            : null
        );
        setDate(DateFilter ?? null);
        setDueDate(dueDate ?? null);
        setStartDate(startDate ?? null);
        setEndDate(endDate ?? null);
        setStartDateReview(startDateReview ?? null);
        setEndDateReview(endDateReview ?? null);
        onCurrentFilterId > 0
          ? setFilterName(appliedFilterData[0].Name)
          : setFilterName("");
        setSaveFilter(true);
      }
    };

    if (appliedFilterData.length > 0) {
      getFilterData();
    }
  }, [appliedFilterData]);

  useEffect(() => {
    const selectedFields = {
      ClientId: clientName !== null ? clientName?.value : null,
      TypeOfWork: workType !== null ? workType?.value : null,
      userId: userName !== null ? userName?.value : null,
      DepartmentId: department !== null ? department?.value : null,
      ProjectId: projectName !== null ? projectName?.value : null,
      IsShowAll: reviewer !== null ? reviewer?.value : null,
      StatusId: status !== null ? status?.value : null,
      ProcessId: processName !== null ? processName?.value : null,
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
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={reviewerDropdown}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
                    data === null
                      ? setReviewer({
                          label: "Yes",
                          value: 1,
                        })
                      : setReviewer(data);
                  }}
                  value={reviewer}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="See All Reviewer"
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
            </div>
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
                    value={endDateReview === null ? null : dayjs(endDateReview)}
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
          </div>
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
          {!saveFilter ? (
            <>
              <Button
                variant="contained"
                color="info"
                className={`${anyFieldSelected && "!bg-secondary"}`}
                disabled={!anyFieldSelected}
                onClick={sendFilterToPage}
              >
                Apply Filter
              </Button>

              <Button
                variant="contained"
                color="info"
                className={`${anyFieldSelected && "!bg-secondary"}`}
                onClick={() => setSaveFilter(true)}
                disabled={!anyFieldSelected}
              >
                Save Filter
              </Button>
            </>
          ) : (
            <>
              <FormControl
                variant="standard"
                sx={{ marginRight: 3, minWidth: 400 }}
              >
                <TextField
                  placeholder="Enter Filter Name"
                  fullWidth
                  required
                  variant="standard"
                  value={filterName}
                  onChange={(e) => {
                    setFilterName(e.target.value);
                    setError("");
                  }}
                  error={Boolean(error)}
                  helperText={error}
                />
              </FormControl>
              <Button
                variant="contained"
                color="info"
                onClick={() => {
                  saveCurrentFilter();
                }}
                className="!bg-secondary"
              >
                Save & Apply
              </Button>
            </>
          )}

          <Button
            variant="outlined"
            color="info"
            onClick={() =>
              onCurrentFilterId > 0 || !!onCurrentFilterId
                ? handleResetAllClose()
                : onClose()
            }
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilterDialog;
