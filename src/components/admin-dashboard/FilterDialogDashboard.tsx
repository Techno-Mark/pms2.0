import { callAPI } from "@/utils/API/callAPI";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { LabelValue, LabelValueType } from "@/utils/Types/types";
import {
  getAssigneeDropdownDataByHierarchy,
  getCCDropdownData,
  getClientDropdownData,
  getDepartmentDropdownData,
  getGroupWiseRMDropdownData,
  getReviewerDropdownDataByHierarchy,
  getStatusDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
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
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface FilterModalProps {
  activeTab: number;
  dashboardActiveTab: number;
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  currentFilterData?: (data: DashboardInitialFilter) => void;
  onCurrentFilterId: number;
  getFilterList: () => void;
}

const ALL = -1;
const ALLDepartment = -1;

const FilterDialogDashboard = ({
  activeTab,
  dashboardActiveTab,
  onOpen,
  onClose,
  currentFilterData,
  onCurrentFilterId,
  getFilterList,
}: FilterModalProps) => {
  const workTypeIdFromLocalStorage =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("workTypeId")
      : 3;
  const initialFilter = {
    Clients: [],
    WorkTypeId: activeTab === 1 ? Number(workTypeIdFromLocalStorage) : null,
    DepartmentIds: [],
    AssigneeIds: [],
    ReviewerIds: [],
    StatusIds: [],
    StartDate: null,
    EndDate: null,
  };

  const [clients, setClients] = useState<LabelValue[] | []>([]);
  const [clientName, setClientName] = useState<number[] | []>([]);
  const [clientDropdown, setClientDropdown] = useState<LabelValue[] | []>([]);
  const [workType, setWorkType] = useState<number>(3);
  const [workTypeActive, setWorkTypeActive] = useState<LabelValue | null>(null);
  const [worktypeDropdownData, setWorktypeDropdownData] = useState<
    LabelValue[]
  >([]);
  const [departments, setDepartments] = useState<LabelValueType[]>([]);
  const [departmentName, setDepartmentName] = useState<number[]>([]);
  const [departmentDropdownData, setDepartmentDropdownData] = useState<
    LabelValueType[]
  >([]);
  const [assignees, setAssignees] = useState<LabelValue[] | []>([]);
  const [assigneeName, setAssigneeName] = useState<number[] | []>([]);
  const [assigneeDropdown, setAssigneeDropdown] = useState<LabelValue[] | []>(
    []
  );
  const [reviewerDropdown, setReviewerDropdown] = useState<LabelValue[]>([]);
  const [reviewers, setReviewers] = useState<LabelValue[] | []>([]);
  const [reviewerName, setReviewerName] = useState<number[] | []>([]);
  const [status, setStatus] = useState<LabelValueType[] | []>([]);
  const [statusName, setStatusName] = useState<number[] | []>([]);
  const [statusDropdown, setStatusDropdown] = useState<LabelValueType[] | []>(
    []
  );
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [anyFieldSelected, setAnyFieldSelected] = useState<boolean>(false);
  const [currSelectedFields, setCurrSelectedFileds] =
    useState<DashboardInitialFilter>(initialFilter);
  const [filterName, setFilterName] = useState("");
  const [saveFilter, setSaveFilter] = useState(false);
  const [error, setError] = useState("");

  const sendFilterToPage = () => {
    currentFilterData?.(currSelectedFields);
    onClose();
  };

  const handleReset = () => {
    const workTypeIdFromLocalStorage =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("workTypeId")
        : 3;
    setClientName([]);
    setClients([]);
    setWorkType(activeTab === 1 ? Number(workTypeIdFromLocalStorage) : 0);
    setWorkTypeActive(activeTab === 1 ? { label: "Tax", value: 3 } : null);
    setDepartmentName([]);
    setDepartments([]);
    setAssigneeName([]);
    setAssignees([]);
    setReviewerName([]);
    setReviewers([]);
    setStatusName([]);
    setStatus([]);
    setStatusDropdown([]);
    setStartDate(null);
    setEndDate(null);
    setFilterName("");
    setSaveFilter(false);
    setError("");
  };

  const handleResetAll = () => {
    handleReset();
    currentFilterData?.(initialFilter);
  };

  const getDropdownData = async () => {
    const typeOfWorkData = await getTypeOfWorkDropdownData(0);
    setClientDropdown([
      { label: "Select All", value: ALL },
      ...(await getClientDropdownData()),
    ]);
    setWorktypeDropdownData(typeOfWorkData);
    const departmentData = await getDepartmentDropdownData();
    setDepartmentDropdownData([
      { label: "Select All", value: ALLDepartment, Type: "All" },
      ...departmentData.DepartmentList,
    ]);
  };

  const getDropdowns = async (workType: number) => {
    setAssigneeDropdown(await getAssigneeDropdownDataByHierarchy(workType));
    setReviewerDropdown(await getReviewerDropdownDataByHierarchy(workType));
  };

  const getDropdownsForEmailbox = async () => {
    setAssigneeDropdown(await getCCDropdownData());
    setReviewerDropdown(await getGroupWiseRMDropdownData(0, 0));
  };

  useEffect(() => {
    const customDropdowns = async () => {
      setStatusDropdown(await getStatusDropdownData(workTypeActive?.value));
      getDropdowns(Number(workTypeActive?.value));
    };
    workTypeActive !== null &&
      workTypeActive?.value > 0 &&
      activeTab === 2 &&
      customDropdowns();
  }, [workTypeActive]);

  useEffect(() => {
    workTypeActive !== null &&
      workType > 0 &&
      dashboardActiveTab === 1 &&
      getDropdowns(workType);
  }, [workTypeActive, workType, dashboardActiveTab]);

  useEffect(() => {
    dashboardActiveTab === 2 && getDropdownsForEmailbox();
  }, [dashboardActiveTab]);

  useEffect(() => {
    onOpen && getDropdownData();

    onCurrentFilterId > 0 && onOpen && getFilterListById(onCurrentFilterId);
  }, [onOpen, onCurrentFilterId]);

  useEffect(() => {
    const isAnyFieldSelected: boolean =
      clientName.length > 0 ||
      workType > 0 ||
      departmentName.length > 0 ||
      startDate !== null ||
      endDate !== null;

    const isAnyFieldSelectedActive: boolean =
      clientName.length > 0 ||
      workTypeActive !== null ||
      departmentName.length > 0 ||
      assigneeName.length > 0 ||
      reviewerName.length > 0 ||
      statusName.length > 0 ||
      startDate !== null ||
      endDate !== null;

    setAnyFieldSelected(
      activeTab === 1 ? isAnyFieldSelected : isAnyFieldSelectedActive
    );
  }, [
    clientName,
    workType,
    workTypeActive,
    departmentName,
    assigneeName,
    reviewerName,
    statusName,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    const selectedFields: DashboardInitialFilter = {
      Clients: clientName,
      WorkTypeId: workType > 0 ? workType : null,
      DepartmentIds: departmentName,
      AssigneeIds: assigneeName,
      ReviewerIds: reviewerName,
      StatusIds: statusName,
      StartDate: startDate !== null ? getFormattedDate(startDate) : null,
      EndDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
    };

    const selectedFieldsActive: DashboardInitialFilter = {
      Clients: clientName,
      WorkTypeId: workTypeActive !== null ? workTypeActive.value : null,
      DepartmentIds: departmentName,
      AssigneeIds: assigneeName,
      ReviewerIds: reviewerName,
      StatusIds: statusName,
      StartDate: startDate !== null ? getFormattedDate(startDate) : null,
      EndDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
    };
    setCurrSelectedFileds(
      activeTab === 1 ? selectedFields : selectedFieldsActive
    );
  }, [
    clientName,
    workType,
    workTypeActive,
    departmentName,
    assigneeName,
    reviewerName,
    statusName,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    handleResetAll();
  }, [activeTab]);

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
        AppliedFilter: currSelectedFields,
        type: activeTab === 1 ? 23 : 24,
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
          sendFilterToPage();
          getFilterList();
          handleReset();
          onClose();
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const getFilterListById = async (filterId: number) => {
    const params = {
      type: activeTab === 1 ? 23 : 24,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = async (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const filteredData = ResponseData.filter(
          (filter: any) => filter.FilterId === filterId
        );

        if (filteredData.length > 0) {
          const data = filteredData[0].AppliedFilter;
          setFilterName(filteredData[0].Name);
          const typeOfWorkData = await getTypeOfWorkDropdownData(0);
          const clientDropdown = [
            { label: "Select All", value: ALL },
            ...(await getClientDropdownData()),
          ];
          setClients(
            data.Clients.length > 0
              ? clientDropdown.filter((client: LabelValue) =>
                  data.Clients.includes(client.value)
                )
              : []
          );
          setClientName(data.Clients);
          activeTab === 1
            ? setWorkType(
                !!data.WorkTypeId && data.WorkTypeId > 0 ? data.WorkTypeId : 0
              )
            : setWorkType(
                activeTab === 1 ? Number(workTypeIdFromLocalStorage) : 0
              );
          activeTab === 2
            ? setWorkTypeActive(
                !!data.WorkTypeId &&
                  data.WorkTypeId > 0 &&
                  typeOfWorkData.length > 0
                  ? typeOfWorkData.filter(
                      (w: LabelValue) => w.value == data.WorkTypeId
                    )[0]
                  : null
              )
            : setWorkTypeActive(null);
          const departmentData = await getDepartmentDropdownData();
          setDepartments(
            data.DepartmentIds.length > 0
              ? departmentData.filter((dep: LabelValue) =>
                  data.DepartmentIds.includes(dep.value)
                )
              : []
          );
          setDepartmentName(data.DepartmentIds);
          setAssignees(
            data.AssigneeIds.length > 0
              ? assigneeDropdown.filter((a: LabelValue) =>
                  data.AssigneeIds.includes(a.value)
                )
              : []
          );
          setAssigneeName(data.AssigneeIds);
          setReviewers(
            data.ReviewerIds.length > 0
              ? reviewerDropdown.filter((r: LabelValue) =>
                  data.ReviewerIds.includes(r.value)
                )
              : []
          );
          setReviewerName(data.ReviewerIds);
          const statusDropdown =
            activeTab === 2 && data.WorkTypeId > 0
              ? await getStatusDropdownData(data.WorkTypeId)
              : [];
          setStatus(
            activeTab === 2 &&
              data.WorkTypeId > 0 &&
              data.StatusIds.length > 0 &&
              statusDropdown.length > 0
              ? statusDropdown.filter((s: LabelValue) =>
                  data.StatusIds.includes(s.value)
                )
              : []
          );
          setStatusName(data.StatusIds);
          setStartDate(data.StartDate !== null ? data.StartDate : null);
          setEndDate(data.EndDate !== null ? data.EndDate : null);
        }
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleResetAllClose = () => {
    handleResetAll();
    onClose();
  };

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
                sx={{ mx: 0.75, mt: 0.5, width: 210 }}
              >
                <Autocomplete
                  multiple
                  id="tags-standard"
                  options={
                    clientDropdown.length - 1 === clients.length
                      ? []
                      : clientDropdown.filter(
                          (option) =>
                            !clients.find(
                              (client) => client.value === option.value
                            )
                        )
                  }
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue[] | []
                  ) => {
                    if (data.some((d: LabelValue) => d.value === -1)) {
                      setClients(
                        clientDropdown.filter((d: LabelValue) => d.value !== -1)
                      );
                      setClientName(
                        clientDropdown
                          .filter((d: LabelValue) => d.value !== -1)
                          .map((d: LabelValue) => d.value)
                      );
                    } else {
                      setClients(data);
                      setClientName(data.map((d: LabelValue) => d.value));
                    }
                  }}
                  value={clients}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Client Name"
                    />
                  )}
                />
              </FormControl>

              {activeTab === 1 && dashboardActiveTab === 1 && (
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, mt: 0, width: 210 }}
                >
                  <InputLabel id="demo-simple-select-standard-label">
                    Type of Work
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    value={workType === 0 ? "" : workType}
                    onChange={(e) => setWorkType(Number(e.target.value))}
                  >
                    {worktypeDropdownData.map(
                      (i: LabelValue, index: number) => (
                        <MenuItem value={i.value} key={index}>
                          {i.label}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              )}
              {activeTab === 2 && (
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, mt: 0.5, width: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={worktypeDropdownData}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(
                      e: React.ChangeEvent<{}>,
                      data: LabelValue | null
                    ) => {
                      setWorkTypeActive(data);
                      setStatus([]);
                      setStatusName([]);
                    }}
                    value={workTypeActive}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Type Of Work"
                      />
                    )}
                  />
                </FormControl>
              )}
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, width: 210 }}
              >
                <Autocomplete
                  multiple
                  id="tags-standard"
                  options={
                    departmentDropdownData.length - 1 === departments.length
                      ? []
                      : departmentDropdownData.filter(
                          (option) =>
                            !departments.find(
                              (department) => department.value === option.value
                            )
                        )
                  }
                  getOptionLabel={(option: LabelValueType) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValueType[] | []
                  ) => {
                    if (data.some((d: LabelValueType) => d.value === -1)) {
                      setDepartments(
                        departmentDropdownData.filter(
                          (d: LabelValueType) => d.value !== -1
                        )
                      );
                      setDepartmentName(
                        departmentDropdownData
                          .filter((d: LabelValueType) => d.value !== -1)
                          .map((d: LabelValueType) => d.value)
                      );
                    } else {
                      setDepartments(data);
                      setDepartmentName(
                        data.map((d: LabelValueType) => d.value)
                      );
                    }
                  }}
                  value={departments}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Department"
                    />
                  )}
                />
              </FormControl>
              {dashboardActiveTab === 2 && (
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, mt: 0.5, width: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={assigneeDropdown.filter(
                      (option) =>
                        !assignees.find(
                          (assignee) => assignee.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(
                      e: React.ChangeEvent<{}>,
                      data: LabelValue[] | []
                    ) => {
                      setAssignees(data);
                      setAssigneeName(data.map((d: LabelValue) => d.value));
                    }}
                    value={assignees}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Preparer/Assignee"
                      />
                    )}
                  />
                </FormControl>
              )}
            </div>
            <div className="flex gap-[20px]">
              {dashboardActiveTab !== 2 && (
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, mt: 0.5, width: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={assigneeDropdown.filter(
                      (option) =>
                        !assignees.find(
                          (assignee) => assignee.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(
                      e: React.ChangeEvent<{}>,
                      data: LabelValue[] | []
                    ) => {
                      setAssignees(data);
                      setAssigneeName(data.map((d: LabelValue) => d.value));
                    }}
                    value={assignees}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Preparer/Assignee"
                      />
                    )}
                  />
                </FormControl>
              )}
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, width: 210 }}
              >
                <Autocomplete
                  multiple
                  id="tags-standard"
                  options={reviewerDropdown.filter(
                    (option) =>
                      !reviewers.find(
                        (reviewer) => reviewer.value === option.value
                      )
                  )}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue[] | []
                  ) => {
                    setReviewers(data);
                    setReviewerName(data.map((d: LabelValue) => d.value));
                  }}
                  value={reviewers}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Reviewer"
                    />
                  )}
                />
              </FormControl>
              {activeTab === 2 && (
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, mt: 0.5, width: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={
                      statusDropdown.length - 1 === status.length
                        ? []
                        : statusDropdown.filter(
                            (option) =>
                              !status.find((sta) => sta.value === option.value)
                          )
                    }
                    getOptionLabel={(option: LabelValueType) => option.label}
                    onChange={(
                      e: React.ChangeEvent<{}>,
                      data: LabelValueType[] | []
                    ) => {
                      setStatus(data);
                      setStatusName(data.map((d: LabelValueType) => d.value));
                    }}
                    value={status}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Status Name"
                      />
                    )}
                  />
                </FormControl>
              )}
              {activeTab === 1 && (
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From"
                      value={startDate === null ? null : dayjs(startDate)}
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(endDate) || dayjs(Date.now())}
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
              )}
              {dashboardActiveTab === 2 && (
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="To"
                      value={endDate === null ? null : dayjs(endDate)}
                      // shouldDisableDate={isWeekend}
                      minDate={dayjs(startDate)}
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
              )}
            </div>
            <div className="flex gap-[20px]">
              {dashboardActiveTab === 1 && (
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="To"
                      value={endDate === null ? null : dayjs(endDate)}
                      // shouldDisableDate={isWeekend}
                      minDate={dayjs(startDate)}
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
              )}
              {activeTab === 2 && (
                <>
                  <div
                    className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="From"
                        value={startDate === null ? null : dayjs(startDate)}
                        // shouldDisableDate={isWeekend}
                        maxDate={dayjs(endDate) || dayjs(Date.now())}
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
                        label="To"
                        value={endDate === null ? null : dayjs(endDate)}
                        // shouldDisableDate={isWeekend}
                        minDate={dayjs(startDate)}
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
                </>
              )}
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

export default FilterDialogDashboard;
