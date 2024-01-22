import dayjs from "dayjs";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputBase,
  Popover,
  TextField,
  Tooltip,
} from "@mui/material";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { FilterType } from "../types/ReportsFilterType";
import { logReport } from "../Enum/Filtertype";
import { logReport_InitialFilter } from "@/utils/reports/getFilters";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Edit, Delete } from "@mui/icons-material";
import { getFormattedDate } from "@/utils/timerFunctions";
import { isWeekend } from "@/utils/commonFunction";
import {
  getAllProcessDropdownData,
  getClientDropdownData,
  getCommentUserDropdownData,
  getProjectDropdownData,
} from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";

const LogReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [logReport_clients, setLogReport_Clients] = useState<any[]>([]);
  const [logReport_clientName, setLogReport_ClientName] = useState<any[]>([]);
  const [logReport_projectName, setLogReport_ProjectName] = useState<any>(null);
  const [logReport_process, setLogReport_Process] = useState<any>(null);
  const [logReport_updatedBy, setLogReport_UpdatedBy] = useState<any>(null);
  const [logReport_startDate, setLogReport_StartDate] = useState<
    string | number
  >("");
  const [logReport_endDate, setLogReport_EndDate] = useState<string | number>(
    ""
  );

  const [logReport_clientDropdown, setLogReport_ClientDropdown] = useState<
    any[]
  >([]);
  const [logReport_projectDropdown, setLogReport_ProjectDropdown] = useState<
    any[]
  >([]);
  const [logReport_processDropdown, setLogReport_ProcessDropdown] = useState<
    any[]
  >([]);
  const [logReport_updatedByDropdown, setLogReport_UpdatedByDropdown] =
    useState<any[]>([]);

  const [logReport_filterName, setLogReport_FilterName] = useState<string>("");
  const [logReport_saveFilter, setLogReport_SaveFilter] =
    useState<boolean>(false);
  const [logReport_anyFieldSelected, setLogReport_AnyFieldSelected] =
    useState(false);
  const [logReport_currentFilterId, setLogReport_CurrentFilterId] =
    useState<any>("");
  const [logReport_savedFilters, setLogReport_SavedFilters] = useState<any[]>(
    []
  );
  const [logReport_defaultFilter, setLogReport_DefaultFilter] =
    useState<boolean>(false);
  const [logReport_searchValue, setLogReport_SearchValue] =
    useState<string>("");
  const [logReport_isDeleting, setLogReport_IsDeleting] =
    useState<boolean>(false);
  const [logReport_resetting, setLogReport_Resetting] =
    useState<boolean>(false);
  const [logReport_error, setLogReport_Error] = useState("");

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;

  const handleLogReport_ResetAll = () => {
    setLogReport_ClientName([]);
    setLogReport_Clients([]);
    setLogReport_UpdatedByDropdown([]);
    setLogReport_ProjectName(null);
    setLogReport_Process(null);
    setLogReport_UpdatedBy(null);
    setLogReport_StartDate("");
    setLogReport_EndDate("");
    setLogReport_Error("");
    setLogReport_Resetting(true);

    sendFilterToPage({
      ...logReport_InitialFilter,
    });
  };

  const handleLogReport_Close = () => {
    onDialogClose(false);
    setLogReport_Resetting(false);
    setLogReport_FilterName("");
    setLogReport_DefaultFilter(false);
    setLogReport_ClientName([]);
    setLogReport_Clients([]);
    setLogReport_UpdatedByDropdown([]);
    setLogReport_ProjectName(null);
    setLogReport_Process(null);
    setLogReport_UpdatedBy(null);
    setLogReport_StartDate("");
    setLogReport_EndDate("");
    setLogReport_Error("");
  };

  const handleLogReport_FilterApply = () => {
    sendFilterToPage({
      ...logReport_InitialFilter,
      clientFilter: logReport_clientName.length > 0 ? logReport_clientName : [],
      projectFilter:
        logReport_projectName === null || logReport_projectName === ""
          ? []
          : [logReport_projectName.value],
      processFilter:
        logReport_process === null || logReport_process === ""
          ? null
          : [logReport_process.value],
      updatedByFilter:
        logReport_updatedBy === null || logReport_updatedBy === ""
          ? []
          : [logReport_updatedBy.value],
      startDate:
        logReport_startDate.toString().trim().length <= 0
          ? logReport_endDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(logReport_endDate)
          : getFormattedDate(logReport_startDate),
      endDate:
        logReport_endDate.toString().trim().length <= 0
          ? logReport_startDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(logReport_startDate)
          : getFormattedDate(logReport_endDate),
    });

    onDialogClose(false);
  };

  const handleLogReport_SavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...logReport_InitialFilter,
          clientFilter:
            logReport_savedFilters[index].AppliedFilter.clientFilter,
          projectFilter:
            logReport_savedFilters[index].AppliedFilter.projectFilter,
          processFilter:
            logReport_savedFilters[index].AppliedFilter.processFilter,
          updatedByFilter:
            logReport_savedFilters[index].AppliedFilter.updatedByFilter,
          startDate: logReport_savedFilters[index].AppliedFilter.startDate,
          endDate: logReport_savedFilters[index].AppliedFilter.endDate,
        });
      }
    }

    onDialogClose(false);
  };

  const handleLogReport_SaveFilter = async () => {
    if (logReport_filterName.trim().length === 0) {
      setLogReport_Error("This is required field!");
    } else if (logReport_filterName.trim().length > 15) {
      setLogReport_Error("Max 15 characters allowed!");
    } else {
      setLogReport_Error("");
      const params = {
        filterId:
          logReport_currentFilterId !== "" ? logReport_currentFilterId : null,
        name: logReport_filterName,
        AppliedFilter: {
          clientFilter:
            logReport_clientName.length > 0 ? logReport_clientName : [],
          projectFilter:
            logReport_projectName === null ? [] : [logReport_projectName.value],
          processFilter:
            logReport_process === null ? null : [logReport_process.value],
          updatedByFilter:
            logReport_updatedBy === null ? [] : [logReport_updatedBy.value],
          startDate:
            logReport_startDate.toString().trim().length <= 0
              ? logReport_endDate.toString().trim().length <= 0
                ? null
                : getFormattedDate(logReport_endDate)
              : getFormattedDate(logReport_startDate),
          endDate:
            logReport_endDate.toString().trim().length <= 0
              ? logReport_startDate.toString().trim().length <= 0
                ? null
                : getFormattedDate(logReport_startDate)
              : getFormattedDate(logReport_endDate),
        },
        type: logReport,
      };
      const url = `${process.env.worklog_api_url}/filter/savefilter`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Filter has been successully saved.");
          handleLogReport_Close();
          getLogReport_FilterList();
          handleLogReport_FilterApply();
          setLogReport_SaveFilter(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  useEffect(() => {
    getLogReport_FilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      logReport_clientName.length > 0 ||
      logReport_projectName !== null ||
      logReport_process !== null ||
      logReport_updatedBy !== null ||
      logReport_startDate.toString().trim().length > 0 ||
      logReport_endDate.toString().trim().length > 0;

    setLogReport_AnyFieldSelected(isAnyFieldSelected);
    setLogReport_SaveFilter(false);
    setLogReport_Resetting(false);
  }, [
    logReport_process,
    logReport_updatedBy,
    logReport_clientName,
    logReport_projectName,
    logReport_startDate,
    logReport_endDate,
  ]);

  useEffect(() => {
    const filterDropdowns = async () => {
      setLogReport_UpdatedByDropdown(
        await getCommentUserDropdownData({
          ClientId: null,
          GetClientUser: true,
        })
      );
      setLogReport_ClientDropdown(await getClientDropdownData());
      setLogReport_ProjectDropdown(
        await getProjectDropdownData(
          logReport_clientName.length > 0 ? logReport_clientName[0] : 0
        )
      );
      setLogReport_ProcessDropdown(await getAllProcessDropdownData());
    };
    filterDropdowns();

    if (logReport_clientName.length > 0 || logReport_resetting) {
      onDialogClose(true);
    }
  }, [logReport_clientName]);

  const getLogReport_FilterList = async () => {
    const params = {
      type: logReport,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setLogReport_SavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleLogReport_SavedFilterEdit = async (index: number) => {
    setLogReport_SaveFilter(true);
    setLogReport_DefaultFilter(true);
    setLogReport_FilterName(logReport_savedFilters[index].Name);
    setLogReport_CurrentFilterId(logReport_savedFilters[index].FilterId);

    setLogReport_Clients(
      logReport_savedFilters[index].AppliedFilter.clientFilter.length > 0
        ? logReport_clientDropdown.filter((client: any) =>
            logReport_savedFilters[index].AppliedFilter.clientFilter.includes(
              client.value
            )
          )
        : []
    );
    setLogReport_ClientName(
      logReport_savedFilters[index].AppliedFilter.clientFilter
    );
    setLogReport_ProjectName(
      logReport_savedFilters[index].AppliedFilter.projectFilter.length > 0
        ? (
            await getProjectDropdownData(
              logReport_savedFilters[index].AppliedFilter.clientFilter[0]
            )
          ).filter(
            (item: any) =>
              item.value ===
              logReport_savedFilters[index].AppliedFilter.projectFilter[0]
          )[0]
        : null
    );
    setLogReport_Process(
      logReport_savedFilters[index].AppliedFilter.processFilter.length > 0
        ? logReport_processDropdown.filter(
            (item: any) =>
              item.value ===
              logReport_savedFilters[index].AppliedFilter.processFilter[0]
          )[0]
        : null
    );
    setLogReport_UpdatedBy(
      logReport_savedFilters[index].AppliedFilter.updatedByFilter.length > 0
        ? logReport_updatedByDropdown.filter(
            (item: any) =>
              item.value ===
              logReport_savedFilters[index].AppliedFilter.updatedByFilter[0]
          )[0]
        : null
    );
    setLogReport_StartDate(
      logReport_savedFilters[index].AppliedFilter.startDate ?? ""
    );
    setLogReport_EndDate(
      logReport_savedFilters[index].AppliedFilter.endDate ?? ""
    );
  };

  const handleLogReport_SavedFilterDelete = async () => {
    const params = {
      filterId: logReport_currentFilterId,
    };
    const url = `${process.env.worklog_api_url}/filter/delete`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been deleted successfully.");
        handleLogReport_Close();
        getLogReport_FilterList();
        setLogReport_CurrentFilterId("");
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <>
      {logReport_savedFilters.length > 0 && !logReport_defaultFilter ? (
        <Popover
          id={idFilter}
          open={isFiltering}
          anchorEl={anchorElFilter}
          onClose={handleLogReport_Close}
          anchorOrigin={{
            vertical: 130,
            horizontal: 1290,
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <div className="flex flex-col py-2 w-[250px] ">
            <span
              className="p-2 cursor-pointer hover:bg-lightGray"
              onClick={() => {
                setLogReport_DefaultFilter(true);
                setLogReport_CurrentFilterId(0);
              }}
            >
              Default Filter
            </span>
            <hr className="text-lightSilver mt-2" />

            <span className="py-3 px-2 relative">
              <InputBase
                className="pr-7 border-b border-b-slatyGrey w-full"
                placeholder="Search saved filters"
                inputProps={{ "aria-label": "search" }}
                value={logReport_searchValue}
                onChange={(e: any) => setLogReport_SearchValue(e.target.value)}
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {logReport_savedFilters.map((i: any, index: number) => {
              return (
                <div
                  key={i.FilterId}
                  className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
                >
                  <span
                    className="pl-1"
                    onClick={() => {
                      setLogReport_CurrentFilterId(i.FilterId);
                      onDialogClose(false);
                      handleLogReport_SavedFilterApply(index);
                    }}
                  >
                    {i.Name}
                  </span>
                  <span className="flex gap-[10px] pr-[10px]">
                    <span
                      onClick={() => handleLogReport_SavedFilterEdit(index)}
                    >
                      <Tooltip title="Edit" placement="top" arrow>
                        <Edit className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                      </Tooltip>
                    </span>
                    <span
                      onClick={() => {
                        setLogReport_IsDeleting(true);
                        setLogReport_CurrentFilterId(i.FilterId);
                      }}
                    >
                      <Tooltip title="Delete" placement="top" arrow>
                        <Delete className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                      </Tooltip>
                    </span>
                  </span>
                </div>
              );
            })}
            <hr className="text-lightSilver mt-2" />
            <Button
              onClick={handleLogReport_ResetAll}
              className="mt-2"
              color="error"
            >
              clear all
            </Button>
          </div>
        </Popover>
      ) : (
        <Dialog
          open={isFiltering}
          TransitionComponent={DialogTransition}
          keepMounted
          maxWidth="md"
          onClose={handleLogReport_Close}
        >
          <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
            <span className="text-lg font-medium">Filter</span>
            <Button color="error" onClick={handleLogReport_ResetAll}>
              Reset all
            </Button>
          </DialogTitle>
          <DialogContent>
            <div className="flex flex-col gap-[20px] pt-[15px]">
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, my: 0.4, minWidth: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={logReport_clientDropdown.filter(
                      (option) =>
                        !logReport_clients.find(
                          (client) => client.value === option.value
                        )
                    )}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setLogReport_Clients(data);
                      setLogReport_ClientName(data.map((d: any) => d.value));
                      setLogReport_ProjectName(null);
                    }}
                    value={logReport_clients}
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
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={logReport_projectDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setLogReport_ProjectName(data);
                    }}
                    value={logReport_projectName}
                    disabled={logReport_clientName.length > 1}
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
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={logReport_processDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setLogReport_Process(data);
                    }}
                    value={logReport_process}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Process"
                      />
                    )}
                  />
                </FormControl>
              </div>
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={logReport_updatedByDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setLogReport_UpdatedBy(data);
                    }}
                    value={logReport_updatedBy}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Updated By"
                      />
                    )}
                  />
                </FormControl>
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(logReport_endDate)}
                      value={
                        logReport_startDate === ""
                          ? null
                          : dayjs(logReport_startDate)
                      }
                      onChange={(newValue: any) =>
                        setLogReport_StartDate(newValue)
                      }
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
                      label="End Date"
                      shouldDisableDate={isWeekend}
                      minDate={dayjs(logReport_startDate)}
                      maxDate={dayjs(Date.now())}
                      value={
                        logReport_endDate === ""
                          ? null
                          : dayjs(logReport_endDate)
                      }
                      onChange={(newValue: any) =>
                        setLogReport_EndDate(newValue)
                      }
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
            {!logReport_saveFilter ? (
              <>
                <Button
                  variant="contained"
                  color="info"
                  className={`${logReport_anyFieldSelected && "!bg-secondary"}`}
                  disabled={!logReport_anyFieldSelected}
                  onClick={handleLogReport_FilterApply}
                >
                  Apply Filter
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  className={`${logReport_anyFieldSelected && "!bg-secondary"}`}
                  onClick={() => setLogReport_SaveFilter(true)}
                  disabled={!logReport_anyFieldSelected}
                >
                  Save Filter
                </Button>
              </>
            ) : (
              <>
                <FormControl
                  variant="standard"
                  sx={{ marginRight: 3, minWidth: 420 }}
                >
                  <TextField
                    placeholder="Enter Filter Name"
                    fullWidth
                    required
                    variant="standard"
                    value={logReport_filterName}
                    onChange={(e) => {
                      setLogReport_FilterName(e.target.value);
                      setLogReport_Error("");
                    }}
                    error={logReport_error.length > 0 ? true : false}
                    helperText={logReport_error}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleLogReport_SaveFilter}
                  className={`${
                    logReport_filterName.trim().length === 0
                      ? ""
                      : "!bg-secondary"
                  }`}
                  disabled={logReport_filterName.trim().length === 0}
                >
                  Save & Apply
                </Button>
              </>
            )}

            <Button
              variant="outlined"
              color="info"
              onClick={handleLogReport_Close}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <DeleteDialog
        isOpen={logReport_isDeleting}
        onClose={() => setLogReport_IsDeleting(false)}
        onActionClick={handleLogReport_SavedFilterDelete}
        Title={"Delete Filter"}
        firstContent={"Are you sure you want to delete this saved filter?"}
        secondContent={
          "If you delete this, you will permanently loose this saved filter and selected fields."
        }
      />
    </>
  );
};

export default LogReportFilter;
