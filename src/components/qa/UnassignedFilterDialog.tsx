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
  getStatusDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { getFormattedDate } from "@/utils/timerFunctions";
import { LabelValue, LabelValueType } from "@/utils/Types/types";
import {
  AppliedFilterQAPageTask,
  FilterQAPageTask,
} from "@/utils/Types/qaTypes";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onDataFetch: () => void;
  onCurrentFilterId: number;
  currentFilterData?: (data: AppliedFilterQAPageTask) => void;
}

const initialFilter = {
  ClientId: null,
  TypeOfWork: null,
  ProjectId: null,
  StatusId: null,
  DateFilter: null,
};

const TaskFilterDialog = ({
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
  const [status, setStatus] = useState<LabelValue | null>(null);
  const [statusDropdownData, setStatusDropdownData] = useState<
    LabelValueType[]
  >([]);
  const [date, setDate] = useState<null | string>(null);
  const [filterName, setFilterName] = useState("");
  const [appliedFilterData, setAppliedFilterData] = useState<
    FilterQAPageTask[] | []
  >([]);
  const [clientDropdownData, setClientDropdownData] = useState<LabelValue[]>(
    []
  );
  const [worktypeDropdownData, setWorktypeDropdownData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] =
    useState<AppliedFilterQAPageTask>(initialFilter);
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
    setStatus(null);
    setDate(null);
    setSaveFilter(false);
    setFilterName("");
    setError("");
  };

  const handleResetAll = () => {
    setClient(null);
    setWorkType(null);
    setProjectName(null);
    setStatus(null);
    setDate(null);
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

  const getStatus = async () => {
    const statusData = await getStatusDropdownData(1);
    statusData.length > 0
      ? setStatusDropdownData(
          statusData.filter(
            (item: LabelValueType) =>
              item.Type === "InQAErrorlog" ||
              item.Type === "QAInProgress" ||
              item.Type === "QACompleted" ||
              item.Type === "QASubmitted"
          )
        )
      : setStatusDropdownData([]);
  };

  useEffect(() => {
    getClientData();
    getStatus();
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
          StatusId: status !== null ? status.value : null,
          DateFilter: date === null ? null : getFormattedDate(date),
        },
        type: 22,
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
      type: 22,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: FilterQAPageTask[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const filteredData = ResponseData.filter(
          (filter: FilterQAPageTask) => filter.FilterId === filterId
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
      status !== null ||
      date !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [client, workType, projectName, status, date]);

  useEffect(() => {
    onOpen && getFilterList(onCurrentFilterId);
  }, [onCurrentFilterId, onOpen]);

  useEffect(() => {
    const getFilterData = async () => {
      const appliedFilter = appliedFilterData[0].AppliedFilter;

      if (appliedFilter) {
        const { ClientId, TypeOfWork, ProjectId, StatusId, DateFilter } =
          appliedFilter;

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

        setStatus(
          StatusId !== null && StatusId > 0
            ? statusDropdownData.filter(
                (item: LabelValue) => item.value === StatusId
              )[0]
            : null
        );

        setDate(DateFilter ?? null);
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
      StatusId: status !== null ? status.value : null,
      DateFilter: date === null ? null : getFormattedDate(date) || "",
    };
    setCurrSelectedFileds(selectedFields);
  }, [client, workType, projectName, status, date]);

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
              >
                <Autocomplete
                  id="tags-standard"
                  options={statusDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
                    setStatus(data);
                  }}
                  value={status}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Status" />
                  )}
                />
              </FormControl>

              <div
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date"
                    value={date === null ? null : dayjs(date)}
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    onChange={(newDate: any) => setDate(newDate.$d)}
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

export default TaskFilterDialog;
