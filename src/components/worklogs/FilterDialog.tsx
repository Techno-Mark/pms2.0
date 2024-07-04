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
  getClientDropdownData,
  getProjectDropdownData,
  getStatusDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { getFormattedDate } from "@/utils/timerFunctions";
import { LabelValue, LabelValueType } from "@/utils/Types/types";
import {
  AppliedFilterWorklogsPage,
  FilterWorklogsPage,
} from "@/utils/Types/worklogsTypes";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onDataFetch: () => void;
  onCurrentFilterId: number;
  currentFilterData?: (data: AppliedFilterWorklogsPage) => void;
}

const initialFilter = {
  ClientId: [],
  TypeOfWork: null,
  ProjectId: null,
  StatusId: [],
  AssignedTo: null,
  AssignedBy: null,
  DueDate: null,
  StartDate: null,
  EndDate: null,
  ReviewStatus: null,
};

const FilterDialog = ({
  onOpen,
  onClose,
  onDataFetch,
  onCurrentFilterId,
  currentFilterData,
}: FilterModalProps) => {
  const [saveFilter, setSaveFilter] = useState(false);
  const [clients, setClients] = useState<LabelValue[]>([]);
  const [clientName, setClientName] = useState<number[]>([]);
  const [workType, setWorkType] = useState<LabelValue | null>(null);
  const [projectName, setProjectName] = useState<LabelValue | null>(null);
  const [status, setStatus] = useState<LabelValueType[]>([]);
  const [statusName, setStatusName] = useState<number[]>([]);
  const [assignedTo, setAssignedTo] = useState<number | string>(0);
  const [assignedBy, setAssignedBy] = useState<LabelValue | null>(null);
  const [dueDate, setDueDate] = useState<null | string>(null);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [ReviewStatus, setReviewStatus] = useState<number>(0);
  const [filterName, setFilterName] = useState("");
  const [appliedFilterData, setAppliedFilterData] = useState<
    FilterWorklogsPage[] | []
  >([]);
  const [clientDropdownData, setClientDropdownData] = useState<LabelValue[]>(
    []
  );
  const [worktypeDropdownData, setWorktypeDropdownData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [statusDropdownData, setStatusDropdownData] = useState<
    LabelValueType[]
  >([]);
  const [assignedByDropdownData, setAssignedByDropdownData] = useState<
    LabelValue[] | []
  >([]);
  const [assignedToDropdownData, setAssignedToDropdownData] = useState<
    LabelValue[] | []
  >([]);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] =
    useState<AppliedFilterWorklogsPage>(initialFilter);
  const [error, setError] = useState("");
  let isHaveManageAssignee: undefined | string | boolean | null;
  if (typeof localStorage !== "undefined") {
    isHaveManageAssignee = localStorage.getItem("IsHaveManageAssignee");
  }

  const sendFilterToPage = () => {
    currentFilterData?.(currSelectedFields);
    onClose();
  };

  const clearData = () => {
    setClientName([]);
    setClients([]);
    setWorkType(null);
    setProjectName(null);
    setStatusName([]);
    setStatus([]);
    setAssignedTo(0);
    setAssignedBy(null);
    setDueDate(null);
    setStartDate(null);
    setEndDate(null);
    setReviewStatus(0);
    setSaveFilter(false);
    setFilterName("");
    setError("");
  };

  const handleResetAll = () => {
    setClientName([]);
    setClients([]);
    setWorkType(null);
    setProjectName(null);
    setStatusName([]);
    setStatus([]);
    setAssignedTo(0);
    setAssignedBy(null);
    setDueDate(null);
    setStartDate(null);
    setEndDate(null);
    setReviewStatus(0);
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

  const getClientData = async () => {
    setClientDropdownData(await getClientDropdownData());
    setWorktypeDropdownData(await getTypeOfWorkDropdownData(0));
  };

  const getProjectData = async (
    clientName: string | number,
    workType: string | number
  ) => {
    setProjectDropdownData(await getProjectDropdownData(clientName, workType));
  };

  const getAllStatus = async (workType: number) => {
    workType > 0 &&
      setStatusDropdownData(await getStatusDropdownData(workType));
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
        const userId = localStorage.getItem("UserId");
        setAssignedByDropdownData(
          ResponseData.length > 0
            ? [
                {
                  label: "Me",
                  value: Number(userId),
                },
                ...ResponseData,
              ]
            : []
        );
      } else {
        setAssignedToDropdownData([]);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  useEffect(() => {
    getClientData();
    getAssignee();
  }, []);

  useEffect(() => {
    workType !== null && getAllStatus(workType?.value);
  }, [workType]);

  useEffect(() => {
    if (clientName.length === 1 && workType !== null) {
      getProjectData(clientName[0], workType?.value);
    } else {
      setProjectDropdownData([]);
    }
  }, [clientName, workType]);

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
          ClientId: clientName,
          TypeOfWork: workType !== null ? workType.value : null,
          ProjectId: projectName !== null ? projectName.value : null,
          StatusId: statusName,
          AssignedTo: assignedTo || 0,
          AssignedBy: assignedBy !== null ? assignedBy.value : null,
          DueDate: dueDate !== null ? getFormattedDate(dueDate) : null,
          StartDate: startDate !== null ? getFormattedDate(startDate) : null,
          EndDate:
            endDate === null
              ? startDate === null
                ? null
                : getFormattedDate(startDate)
              : getFormattedDate(endDate),
          ReviewStatus: ReviewStatus || 0,
        },
        type: 1,
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

  useEffect(() => {
    onCurrentFilterId === 0 && handleResetAll();
  }, [onCurrentFilterId]);

  const getFilterList = async (filterId: number) => {
    const params = {
      type: 1,
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
      clientName.length > 0 ||
      workType !== null ||
      projectName !== null ||
      statusName.length > 0 ||
      assignedTo !== 0 ||
      assignedBy !== null ||
      dueDate !== null ||
      startDate !== null ||
      endDate !== null ||
      ReviewStatus !== 0;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [
    clientName,
    workType,
    projectName,
    statusName,
    assignedTo,
    assignedBy,
    dueDate,
    startDate,
    endDate,
    ReviewStatus,
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
          ProjectId,
          Status,
          StatusId,
          AssignedTo,
          AssignedBy,
          DueDate,
          StartDate,
          EndDate,
          ReviewStatus,
        } = appliedFilter;

        const clients = ClientId || [];
        setClients(
          clients.length > 0
            ? clientDropdownData.filter((client: LabelValue) =>
                clients.includes(client.value)
              )
            : []
        );
        setClientName(clients);

        setWorkType(
          TypeOfWork !== null && TypeOfWork > 0
            ? worktypeDropdownData.filter(
                (item: LabelValue) => item.value === TypeOfWork
              )[0]
            : null
        );
        setProjectName(
          ProjectId !== null && ProjectId > 0 && clients.length === 1
            ? projectDropdownData.filter(
                (item: LabelValue) => item.value === ProjectId
              )[0]
            : null
        );

        const statusid = StatusId || [];
        setStatus(
          TypeOfWork !== null && TypeOfWork > 0 && StatusId !== null
            ? (await getStatusDropdownData(TypeOfWork)).filter(
                (item: LabelValueType) => statusid.includes(item.value)
              )
            : []
        );
        setStatusName(statusid);

        setAssignedTo(AssignedTo !== null && AssignedTo > 0 ? AssignedTo : "");
        setAssignedBy(
          AssignedBy !== null && AssignedBy > 0
            ? assignedByDropdownData.filter(
                (item: LabelValue) => item.value === AssignedBy
              )[0]
            : null
        );
        setDueDate(DueDate ?? null);
        setStartDate(StartDate ?? null);
        setEndDate(EndDate ?? null);
        setReviewStatus(
          ReviewStatus !== null && ReviewStatus > 0 ? ReviewStatus : 0
        );
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
      ClientId: clientName,
      TypeOfWork: workType !== null ? workType?.value : null,
      ProjectId: projectName !== null ? projectName.value : null,
      StatusId: statusName,
      AssignedTo: null,
      AssignedBy: assignedBy !== null ? assignedBy.value : null,
      DueDate: dueDate !== null ? getFormattedDate(dueDate) || "" : null,
      StartDate: startDate !== null ? getFormattedDate(startDate) || "" : null,
      EndDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate) || ""
          : getFormattedDate(endDate) || "",
      ReviewStatus: ReviewStatus || null,
    };
    setCurrSelectedFileds(selectedFields);
  }, [
    clientName,
    workType,
    projectName,
    statusName,
    assignedTo,
    assignedBy,
    dueDate,
    startDate,
    endDate,
    ReviewStatus,
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
                  multiple
                  id="tags-standard"
                  options={clientDropdownData.filter(
                    (option) =>
                      !clients.find((client) => client.value === option.value)
                  )}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue[]) => {
                    setClients(data);
                    setClientName(data.map((d: LabelValue) => d.value));
                    setProjectName(null);
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
                    setStatus([]);
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
            </div>

            <div className="flex gap-[20px]">
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  multiple
                  id="tags-standard"
                  options={statusDropdownData.filter(
                    (option) => !status.find((s) => s.value === option.value)
                  )}
                  getOptionLabel={(option: LabelValueType) => option.label}
                  onChange={(e, data: LabelValueType[]) => {
                    setStatus(data);
                    setStatusName(data.map((d: LabelValueType) => d.value));
                  }}
                  value={status}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Status" />
                  )}
                />
              </FormControl>

              {/* <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 200 }}>
                <InputLabel id="assignedTo">Assigned To</InputLabel>
                <Select
                  labelId="assignedTo"
                  id="assignedTo"
                  value={assignedTo === 0 ? "" : assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  disabled={!isHaveManageAssignee}
                >
                  {assignedToDropdownData.map((i: any, index: number) => (
                    <MenuItem value={i.value} key={index}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}

              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
                disabled={!isHaveManageAssignee}
              >
                <Autocomplete
                  id="tags-standard"
                  options={assignedByDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
                    setAssignedBy(data);
                  }}
                  value={assignedBy}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Assigned By"
                    />
                  )}
                />
              </FormControl>

              <div
                className={`inline-flex mx-[6px] muiDatepickerCustomizer ${
                  status.length > 2 ? "min-w-[210px]" : "w-[210px]"
                } max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Due Date"
                    value={dueDate === null ? null : dayjs(dueDate)}
                    onChange={(newDate: any) => setDueDate(newDate.$d)}
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
                    label="From"
                    value={startDate === null ? null : dayjs(startDate)}
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    onChange={(newDate: any) => setStartDate(newDate.$d)}
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
                    maxDate={dayjs(Date.now())}
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

            {/* <div className="flex gap-[20px]">
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 200 }}>
                <InputLabel id="review_Status">Review Status</InputLabel>
                <Select
                  labelId="review_Status"
                  id="review_Status"
                  value={ReviewStatus === 0 ? "" : ReviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                >
                  {revwStatusDropdownData.map((i: any, index: number) => (
                    <MenuItem value={i.value} key={index}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div> */}
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
