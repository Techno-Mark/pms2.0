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

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onDataFetch: () => void;
  onCurrentFilterId: number;
  currentFilterData?: any;
}

const initialFilter = {
  ClientId: null,
  TypeOfWork: null,
  ProjectId: null,
  StatusId: null,
  AssignedTo: null,
  AssignedBy: null,
  DueDate: null,
  StartDate: null,
  EndDate: null,
  ReviewStatus: null,
};

const FilterDialog: React.FC<FilterModalProps> = ({
  onOpen,
  onClose,
  onDataFetch,
  onCurrentFilterId,
  currentFilterData,
}) => {
  const [saveFilter, setSaveFilter] = useState(false);
  const [clientName, setClientName] = useState<any>(null);
  const [workType, setWorkType] = useState<any>(null);
  const [projectName, setProjectName] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [assignedTo, setAssignedTo] = useState<number | string>(0);
  const [assignedBy, setAssignedBy] = useState<any>(null);
  const [dueDate, setDueDate] = useState<null | string>(null);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [ReviewStatus, setReviewStatus] = useState<number | string>(0);
  const [filterName, setFilterName] = useState("");
  const [appliedFilterData, setAppliedFilterData] = useState<any | any[]>([]);
  const [clientDropdownData, setClientDropdownData] = useState([]);
  const [worktypeDropdownData, setWorktypeDropdownData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [statusDropdownData, setStatusDropdownData] = useState([]);
  const [assignedByDropdownData, setAssignedByDropdownData] = useState([]);
  const [assignedToDropdownData, setAssignedToDropdownData] = useState([]);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<any | any[]>([]);
  const [error, setError] = useState("");

  let isHaveManageAssignee: any;
  if (typeof localStorage !== "undefined") {
    isHaveManageAssignee = localStorage.getItem("IsHaveManageAssignee");
  }

  const sendFilterToPage = () => {
    currentFilterData(currSelectedFields);
    onClose();
  };

  const handleResetAll = () => {
    setClientName(null);
    setWorkType(null);
    setProjectName(null);
    setStatus(null);
    setAssignedTo(0);
    setAssignedBy(null);
    setDueDate(null);
    setStartDate(null);
    setEndDate(null);
    setReviewStatus(0);
    setSaveFilter(false);
    setFilterName("");
    currentFilterData(initialFilter);
    setError("");
  };

  const getClientData = async () => {
    setClientDropdownData(await getClientDropdownData());
  };

  const getWorkTypeData = async (clientName: string | number) => {
    setWorktypeDropdownData(await getTypeOfWorkDropdownData(clientName));
  };

  const getProjectData = async (
    clientName: string | number,
    workType: string | number
  ) => {
    setProjectDropdownData(await getProjectDropdownData(clientName, workType));
  };

  const getAllStatus = async (workType: any) => {
    workType > 0 &&
      setStatusDropdownData(await getStatusDropdownData(workType));
  };

  const getAssignee = async () => {
    const params = {};
    const url = `${process.env.api_url}/user/GetAssigneeFilterDropdown`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setAssignedByDropdownData(ResponseData);
        setAssignedToDropdownData(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  useEffect(() => {
    if (onOpen === true) {
      getClientData();
      getAssignee();
    }
  }, [onOpen]);

  useEffect(() => {
    clientName !== null && getWorkTypeData(clientName?.value);
  }, [clientName]);

  useEffect(() => {
    clientName !== null &&
      workType !== null &&
      getProjectData(clientName?.value, workType?.value);

    clientName !== null && workType !== null && getAllStatus(workType?.value);
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
          ClientId: clientName !== null ? clientName.value : null,
          TypeOfWork: workType !== null ? workType.value : null,
          ProjectId: projectName !== null ? projectName.value : null,
          Status: status !== null ? status.value : null,
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
        ResponseData: any,
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
          onClose();
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const getFilterList = async (filterId: number) => {
    const params = {
      type: 1,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const filteredData = ResponseData.filter(
          (filter: any) => filter.FilterId === filterId
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
      projectName !== null ||
      status !== null ||
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
    status,
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
    if (appliedFilterData.length > 0) {
      const appliedFilter = appliedFilterData[0].AppliedFilter;

      if (appliedFilter) {
        const {
          ClientId,
          TypeOfWork,
          ProjectId,
          Status,
          AssignedTo,
          AssignedBy,
          DueDate,
          StartDate,
          EndDate,
          ReviewStatus,
        } = appliedFilter;

        setClientName(
          ClientId !== null && ClientId > 0
            ? clientDropdownData.filter(
                (item: any) => item.value === ClientId
              )[0]
            : null
        );
        setWorkType(
          TypeOfWork !== null && TypeOfWork > 0
            ? worktypeDropdownData.filter(
                (item: any) => item.value === TypeOfWork
              )[0]
            : null
        );
        setProjectName(
          ProjectId !== null && ProjectId > 0
            ? projectDropdownData.filter(
                (item: any) => item.value === ProjectId
              )[0]
            : null
        );
        setStatus(
          Status !== null && Status > 0
            ? statusDropdownData.filter((item: any) => item.value === Status)[0]
            : null
        );
        setAssignedTo(AssignedTo > 0 ? AssignedTo : "");
        setAssignedBy(
          AssignedBy !== null && AssignedBy > 0
            ? assignedByDropdownData.filter(
                (item: any) => item.value === AssignedBy
              )[0]
            : null
        );
        setDueDate(DueDate ?? null);
        setStartDate(StartDate ?? null);
        setEndDate(EndDate ?? null);
        setReviewStatus(ReviewStatus > 0 ? ReviewStatus : "");
        onCurrentFilterId > 0
          ? setFilterName(appliedFilterData[0].Name)
          : setFilterName("");
        setSaveFilter(true);
      }
    }
  }, [appliedFilterData]);

  useEffect(() => {
    const selectedFields = {
      ClientId: clientName !== null ? clientName.value : null,
      TypeOfWork: workType !== null ? workType.value : null,
      ProjectId: projectName !== null ? projectName.value : null,
      StatusId: status !== null ? status.value : null,
      AssignedTo: assignedTo || null,
      AssignedBy: assignedBy !== null ? assignedBy.value : null,
      DueDate: dueDate !== null ? getFormattedDate(dueDate) : null,
      StartDate: startDate !== null ? getFormattedDate(startDate) : null,
      EndDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
      ReviewStatus: ReviewStatus || null,
    };
    setCurrSelectedFileds(selectedFields);
  }, [
    clientName,
    workType,
    projectName,
    status,
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
                  id="tags-standard"
                  options={clientDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setClientName(data);
                    setWorkType(null);
                    setProjectName(null);
                    setStatus(null);
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
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setWorkType(data);
                    setProjectName(null);
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
                  options={projectDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
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
                  id="tags-standard"
                  options={statusDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setStatus(data);
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
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
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
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[200px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Due Date"
                    value={dueDate === null ? null : dayjs(dueDate)}
                    onChange={(newDate: any) => {
                      setDueDate(newDate.$d);
                    }}
                    shouldDisableDate={isWeekend}
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
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[200px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    value={startDate === null ? null : dayjs(startDate)}
                    shouldDisableDate={isWeekend}
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
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[200px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    value={endDate === null ? null : dayjs(endDate)}
                    shouldDisableDate={isWeekend}
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
                ? handleResetAll()
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
