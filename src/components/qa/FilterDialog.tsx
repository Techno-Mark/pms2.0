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
import {
  getClientDropdownData,
  getProjectDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { getFormattedDate } from "@/utils/timerFunctions";
import { LabelValue } from "@/utils/Types/types";
import { AppliedFilterQAPage, FilterQAPage } from "@/utils/Types/qaTypes";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onDataFetch: () => void;
  onCurrentFilterId: number;
  currentFilterData?: (data: AppliedFilterQAPage) => void;
}

const initialFilter = {
  ClientId: null,
  TypeOfWork: null,
  ProjectId: null,
  AssignedTo: null,
  AssignedBy: null,
  StartDate: null,
  EndDate: null,
};

const FilterDialog = ({
  onOpen,
  onClose,
  onDataFetch,
  onCurrentFilterId,
  currentFilterData,
}: FilterModalProps) => {
  const [saveFilter, setSaveFilter] = useState(false);
  const [client, setClient] = useState<LabelValue | null>(null);
  const [workType, setWorkType] = useState<LabelValue | null>(null);
  const [projectName, setProjectName] = useState<LabelValue | null>(null);
  const [assignedTo, setAssignedTo] = useState<LabelValue | null>(null);
  const [assignedBy, setAssignedBy] = useState<LabelValue | null>(null);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [filterName, setFilterName] = useState("");
  const [appliedFilterData, setAppliedFilterData] = useState<
    FilterQAPage[] | []
  >([]);
  const [clientDropdownData, setClientDropdownData] = useState<LabelValue[]>(
    []
  );
  const [worktypeDropdownData, setWorktypeDropdownData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [assignedByDropdownData, setAssignedByDropdownData] = useState<
    LabelValue[] | []
  >([]);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] =
    useState<AppliedFilterQAPage>(initialFilter);
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
    setClient(null);
    setWorkType(null);
    setProjectName(null);
    setAssignedTo(null);
    setAssignedBy(null);
    setStartDate(null);
    setEndDate(null);
    setSaveFilter(false);
    setFilterName("");
    setError("");
  };

  const handleResetAll = () => {
    setClient(null);
    setWorkType(null);
    setProjectName(null);
    setAssignedTo(null);
    setAssignedBy(null);
    setStartDate(null);
    setEndDate(null);
    setSaveFilter(false);
    setFilterName("");
    setAnyFieldSelected(false);
    currentFilterData?.(initialFilter);
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
        setAssignedByDropdownData([]);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  useEffect(() => {
    getClientData();
    getAssignee();
  }, []);

  useEffect(() => {
    if (client !== null && workType !== null) {
      getProjectData(client?.value, workType?.value);
    } else {
      setProjectDropdownData([]);
    }
  }, [client, workType]);

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
          ClientId: client !== null ? client.value : null,
          TypeOfWork: workType !== null ? workType.value : null,
          ProjectId: projectName !== null ? projectName.value : null,
          AssignedTo: assignedTo !== null ? assignedTo.value : null,
          AssignedBy: assignedBy !== null ? assignedBy.value : null,
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

  useEffect(() => {
    onCurrentFilterId === 0 && handleResetAll();
  }, [onCurrentFilterId]);

  const getFilterList = async (filterId: number) => {
    const params = {
      type: 21,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: FilterQAPage[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const filteredData = ResponseData.filter(
          (filter: FilterQAPage) => filter.FilterId === filterId
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
      client !== null ||
      workType !== null ||
      projectName !== null ||
      assignedTo !== null ||
      assignedBy !== null ||
      startDate !== null ||
      endDate !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [
    client,
    workType,
    projectName,
    assignedTo,
    assignedBy,
    startDate,
    endDate,
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
          AssignedTo,
          AssignedBy,
          StartDate,
          EndDate,
        } = appliedFilter;

        setClient(
          ClientId !== null && ClientId > 0
            ? clientDropdownData.filter(
                (item: LabelValue) => item.value === ClientId
              )[0]
            : null
        );

        setWorkType(
          TypeOfWork !== null && TypeOfWork > 0
            ? worktypeDropdownData.filter(
                (item: LabelValue) => item.value === TypeOfWork
              )[0]
            : null
        );

        setProjectName(
          ProjectId !== null &&
            ProjectId > 0 &&
            ClientId !== null &&
            ClientId > 0 &&
            TypeOfWork !== null &&
            TypeOfWork > 0
            ? (await getProjectDropdownData(ClientId, TypeOfWork))?.filter(
                (item: LabelValue) => item.value === ProjectId
              )[0] || null
            : null
        );

        setAssignedTo(
          AssignedTo !== null && AssignedTo > 0
            ? assignedByDropdownData.filter(
                (item: LabelValue) => item.value === AssignedTo
              )[0]
            : null
        );
        setAssignedBy(
          AssignedBy !== null && AssignedBy > 0
            ? assignedByDropdownData.filter(
                (item: LabelValue) => item.value === AssignedBy
              )[0]
            : null
        );
        setStartDate(StartDate ?? null);
        setEndDate(EndDate ?? null);
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
      ClientId: client !== null ? client?.value : null,
      TypeOfWork: workType !== null ? workType?.value : null,
      ProjectId: projectName !== null ? projectName.value : null,
      AssignedTo: assignedTo !== null ? assignedTo.value : null,
      AssignedBy: assignedBy !== null ? assignedBy.value : null,
      StartDate:
        startDate === null
          ? endDate === null
            ? null
            : getFormattedDate(endDate) || ""
          : getFormattedDate(startDate) || "",
      EndDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate) || ""
          : getFormattedDate(endDate) || "",
    };
    setCurrSelectedFileds(selectedFields);
  }, [
    client,
    workType,
    projectName,
    assignedTo,
    assignedBy,
    startDate,
    endDate,
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
                    setClient(data);
                    setProjectName(null);
                  }}
                  value={client}
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
                    setAssignedTo(data);
                  }}
                  value={assignedTo}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Assigned To"
                    />
                  )}
                />
              </FormControl>

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
            </div>

            <div className="flex gap-[20px]">
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
