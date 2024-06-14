import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { LabelValue, LabelValueType } from "@/utils/Types/types";
import {
  getCCDropdownData,
  getClientDropdownData,
  getDepartmentDropdownData,
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

interface FilterModalProps {
  activeTab: number;
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  currentFilterData?: (data: DashboardInitialFilter) => void;
}

const ALL = -1;
const ALLDepartment = -1;

const FilterDialogDashboard = ({
  activeTab,
  onOpen,
  onClose,
  currentFilterData,
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
  const [worktypeDropdownData, setWorktypeDropdownData] = useState([]);
  const [departments, setDepartments] = useState<LabelValueType[]>([]);
  const [departmentName, setDepartmentName] = useState<number[]>([]);
  const [departmentDropdownData, setDepartmentDropdownData] = useState<
    LabelValueType[]
  >([]);
  const [assignees, setAssignees] = useState<LabelValue[] | []>([]);
  const [assigneeName, setAssigneeName] = useState<number[] | []>([]);
  const [userDropdown, setUserDropdown] = useState<LabelValue[] | []>([]);
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

  const sendFilterToPage = () => {
    currentFilterData?.(currSelectedFields);
    onClose();
  };

  const handleResetAll = () => {
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
    setUserDropdown(await getCCDropdownData());
  };

  useEffect(() => {
    const customDropdowns = async () => {
      setStatusDropdown(await getStatusDropdownData(workTypeActive?.value));
    };
    workTypeActive !== null &&
      workTypeActive?.value > 0 &&
      activeTab === 2 &&
      customDropdowns();
  }, [workTypeActive]);

  useEffect(() => {
    if (onOpen === true) {
      getDropdownData();
    }
  }, [onOpen]);

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

              {activeTab === 1 && (
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
            </div>
            <div className="flex gap-[20px]">
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, width: 210 }}
              >
                <Autocomplete
                  multiple
                  id="tags-standard"
                  options={
                    userDropdown.length - 1 === assignees.length
                      ? []
                      : userDropdown.filter(
                          (option) =>
                            !assignees.find(
                              (assignee) => assignee.value === option.value
                            )
                        )
                  }
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
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, width: 210 }}
              >
                <Autocomplete
                  multiple
                  id="tags-standard"
                  options={
                    userDropdown.length - 1 === reviewers.length
                      ? []
                      : userDropdown.filter(
                          (option) =>
                            !reviewers.find(
                              (reviewer) => reviewer.value === option.value
                            )
                        )
                  }
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
            </div>
            <div className="flex gap-[20px]">
              {activeTab === 1 && (
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

export default FilterDialogDashboard;
