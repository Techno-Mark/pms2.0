import React, { useEffect, useState } from "react";
import { FilterType } from "../types/ReportsFilterType";
import { am_InitialFilter } from "@/utils/reports/getFilters";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import { getFormattedDate } from "@/utils/timerFunctions";
import { amReport } from "../Enum/Filtertype";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputBase,
  TextField,
  Tooltip,
  Popover,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { isWeekend } from "@/utils/commonFunction";
import dayjs from "dayjs";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import {
  getDeptData,
  getRMWiseUserDropdownData,
} from "@/utils/commonDropdownApiCall";

const AutoManualReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [reportingManager, setReportingManager] = useState<any>(null);
  const [depts, setDepts] = useState<any[]>([]);
  const [deptName, setDeptName] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string | number>("");
  const [endDate, setEndDate] = useState<string | number>("");

  const [filterName, setFilterName] = useState<string>("");
  const [saveFilter, setSaveFilter] = useState<boolean>(false);
  const [rmDropdown, setRMDropdown] = useState<any[]>([]);
  const [departmentDropdown, setDepartmentDropdown] = useState<any[]>([]);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currentFilterId, setCurrentFilterId] = useState<any>("");
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [defaultFilter, setDefaultFilter] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [idFilter, setIdFilter] = useState<any>(undefined);

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);

  useEffect(() => {
    openFilter ? setIdFilter("simple-popover") : setIdFilter(undefined);
  }, [openFilter]);

  const handleResetAll = () => {
    setReportingManager(null);
    setDepts([]);
    setDeptName([]);
    setStartDate("");
    setEndDate("");
    setError("");
    setFilterName("");
    setDefaultFilter(false);
    onDialogClose(false);
    setIdFilter(undefined);

    sendFilterToPage({
      ...am_InitialFilter,
    });
  };

  const handleClose = () => {
    setFilterName("");
    onDialogClose(false);
    setDefaultFilter(false);

    setReportingManager(null);
    setDepts([]);
    setDeptName([]);
    setStartDate("");
    setEndDate("");
    setError("");
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...am_InitialFilter,
      ReportingManagerId:
        reportingManager !== null ? reportingManager.value : null,
      DepartmentIds: deptName.length > 0 ? deptName : [],
      StartDate:
        startDate.toString().trim().length <= 0
          ? endDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(endDate)
          : getFormattedDate(startDate),
      EndDate:
        endDate.toString().trim().length <= 0
          ? startDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
    });

    onDialogClose(false);
  };

  const handleSavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...am_InitialFilter,
          ReportingManagerId:
            savedFilters[index].AppliedFilter.ReportingManagerId,
          DepartmentIds: savedFilters[index].AppliedFilter.DepartmentIds,
          StartDate: savedFilters[index].AppliedFilter.StartDate,
          EndDate: savedFilters[index].AppliedFilter.EndDate,
        });
      }
    }

    onDialogClose(false);
  };

  const handleSaveFilter = async () => {
    if (filterName.trim().length === 0) {
      setError("This is required field!");
      return;
    }
    if (filterName.trim().length > 15) {
      setError("Max 15 characters allowed!");
      return;
    }
    setError("");
    const params = {
      filterId: currentFilterId !== "" ? currentFilterId : null,
      name: filterName,
      AppliedFilter: {
        ReportingManagerId:
          reportingManager !== null ? reportingManager.value : null,
        DepartmentIds: deptName.length > 0 ? deptName : [],
        StartDate:
          startDate.toString().trim().length <= 0
            ? endDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(endDate)
            : getFormattedDate(startDate),
        EndDate:
          endDate.toString().trim().length <= 0
            ? startDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(startDate)
            : getFormattedDate(endDate),
      },
      type: amReport,
    };
    const url = `${process.env.worklog_api_url}/filter/savefilter`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been successully saved.");
        handleClose();
        getFilterList();
        handleFilterApply();
        setSaveFilter(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getFilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      reportingManager !== null ||
      deptName.length > 0 ||
      startDate.toString().trim().length > 0 ||
      endDate.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
    setSaveFilter(false);
  }, [reportingManager, deptName, startDate, endDate]);

  useEffect(() => {
    const filterDropdowns = async () => {
      setRMDropdown(await getRMWiseUserDropdownData());
      setDepartmentDropdown(await getDeptData());
    };
    filterDropdowns();
  }, []);

  const getFilterList = async () => {
    const params = {
      type: amReport,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setSavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSavedFilterEdit = async (index: number) => {
    setSaveFilter(true);
    setDefaultFilter(true);
    setFilterName(savedFilters[index].Name);
    setCurrentFilterId(savedFilters[index].FilterId);

    setReportingManager(
      savedFilters[index].AppliedFilter.ReportingManagerId !== null
        ? rmDropdown.filter(
            (item: any) =>
              item.value ===
              savedFilters[index].AppliedFilter.ReportingManagerId[0]
          )[0]
        : null
    );
    setDepts(
      savedFilters[index].AppliedFilter.DepartmentIds.length > 0
        ? departmentDropdown.filter((dept: any) =>
            savedFilters[index].AppliedFilter.departmentIds.includes(dept.value)
          )
        : []
    );
    setDeptName(savedFilters[index].AppliedFilter.DepartmentIds);
    setStartDate(
      savedFilters[index].AppliedFilter.startDate === null
        ? ""
        : savedFilters[index].AppliedFilter.startDate
    );
    setEndDate(
      savedFilters[index].AppliedFilter.endDate === null
        ? ""
        : savedFilters[index].AppliedFilter.endDate
    );
  };

  const handleSavedFilterDelete = async () => {
    const params = {
      filterId: currentFilterId,
    };
    const url = `${process.env.worklog_api_url}/filter/delete`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been deleted successfully.");
        handleClose();
        getFilterList();
        setCurrentFilterId("");
        sendFilterToPage({ ...am_InitialFilter });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <>
      {savedFilters.length > 0 && !defaultFilter ? (
        <Popover
          id={idFilter}
          open={isFiltering}
          anchorEl={anchorElFilter}
          onClose={() => onDialogClose(false)}
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
                setDefaultFilter(true);
                setCurrentFilterId(0);
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
                value={searchValue}
                onChange={(e: any) => setSearchValue(e.target.value)}
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {savedFilters.map((i: any, index: number) => {
              return (
                <>
                  <div
                    key={i.FilterId}
                    className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
                  >
                    <span
                      className="pl-1"
                      onClick={() => {
                        setCurrentFilterId(i.FilterId);
                        onDialogClose(false);
                        handleSavedFilterApply(index);
                      }}
                    >
                      {i.Name}
                    </span>
                    <span className="flex gap-[10px] pr-[10px]">
                      <span onClick={() => handleSavedFilterEdit(index)}>
                        <Tooltip title="Edit" placement="top" arrow>
                          <Edit className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                        </Tooltip>
                      </span>
                      <span
                        onClick={() => {
                          setIsDeleting(true);
                          setCurrentFilterId(i.FilterId);
                        }}
                      >
                        <Tooltip title="Delete" placement="top" arrow>
                          <Delete className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                        </Tooltip>
                      </span>
                    </span>
                  </div>
                </>
              );
            })}
            <hr className="text-lightSilver mt-2" />
            <Button onClick={handleResetAll} className="mt-2" color="error">
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
          onClose={() => onDialogClose(false)}
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
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={rmDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setReportingManager(data);
                    }}
                    value={reportingManager}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Reporting Manager"
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={departmentDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setDepts(data);
                      setDeptName(data.map((d: any) => d.value));
                    }}
                    value={depts}
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
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(endDate)}
                      value={startDate === "" ? null : dayjs(startDate)}
                      onChange={(newValue: any) => setStartDate(newValue)}
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
                      minDate={dayjs(startDate)}
                      maxDate={dayjs(Date.now())}
                      value={endDate === "" ? null : dayjs(endDate)}
                      onChange={(newValue: any) => setEndDate(newValue)}
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
                  onClick={handleFilterApply}
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
                  sx={{ marginRight: 3, minWidth: 420 }}
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
                    error={error.length > 0 ? true : false}
                    helperText={error}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleSaveFilter}
                  className={`${
                    filterName.length === 0 ? "" : "!bg-secondary"
                  }`}
                  disabled={filterName.length === 0}
                >
                  Save & Apply
                </Button>
              </>
            )}

            <Button
              variant="outlined"
              color="info"
              onClick={() =>
                currentFilterId > 0 || !!currentFilterId
                  ? handleResetAll()
                  : onDialogClose(false)
              }
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <DeleteDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onActionClick={handleSavedFilterDelete}
        Title={"Delete Filter"}
        firstContent={"Are you sure you want to delete this saved filter?"}
        secondContent={
          "If you delete this, you will permanently loose this saved filter and selected fields."
        }
      />
    </>
  );
};

export default AutoManualReportFilter;
