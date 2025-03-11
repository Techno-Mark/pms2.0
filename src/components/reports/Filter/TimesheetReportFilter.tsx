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
import { timesheet } from "../Enum/Filtertype";
import { timeSheet_InitialFilter } from "@/utils/reports/getFilters";
import { getDates, getFormattedDate } from "@/utils/timerFunctions";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { isWeekend } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";
import { getCCDropdownData, getDeptData } from "@/utils/commonDropdownApiCall";
import { LabelValue, LabelValueProfileImage } from "@/utils/Types/types";

interface SavedFilter {
  FilterId: number;
  Name: string;
  AppliedFilter: {
    users: number[];
    departmentIds: number[];
    startDate: string | null;
    endDate: string | null;
  };
}

const TimesheetReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [timesheetUserNames, setTimesheetUserNames] = useState<number[]>([]);
  const [timesheetUsers, setTimesheetUsers] = useState<
    LabelValueProfileImage[]
  >([]);
  const [timesheetDeptNames, setTimesheetDeptNames] = useState<number[]>([]);
  const [timesheetDepts, setTimesheetDepts] = useState<LabelValue[]>([]);
  const [timesheetFilterName, setTimesheetFilterName] = useState<string>("");
  const [timesheetSaveFilter, setTimesheetSaveFilter] =
    useState<boolean>(false);
  const [timesheetUserDropdown, setTimesheetUserDropdown] = useState<
    LabelValueProfileImage[]
  >([]);
  const [timesheetDeptDropdown, setTimesheetDeptDropdown] = useState<
    LabelValue[]
  >([]);
  const [timesheetAnyFieldSelected, setTimesheetAnyFieldSelected] =
    useState(false);
  const [currentFilterId, setCurrentFilterId] = useState<number>(0);
  const [timesheetSavedFilters, setTimesheetSavedFilters] = useState<
    SavedFilter[]
  >([]);
  const [timesheetDefaultFilter, setTimesheetDefaultFilter] =
    useState<boolean>(false);
  const [timesheetSearchValue, setTimesheetSearchValue] = useState<string>("");
  const [timesheetIsDeleting, setTimesheetIsDeleting] =
    useState<boolean>(false);
  const [timesheetStartDate, setTimesheetStartDate] = useState<string | number>(
    ""
  );
  const [timesheetEndDate, setTimesheetEndDate] = useState<string | number>("");
  const [timesheetError, setTimesheetError] = useState("");
  const [idFilter, setIdFilter] = useState<string | undefined>(undefined);

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);

  useEffect(() => {
    openFilter ? setIdFilter("simple-popover") : setIdFilter(undefined);
  }, [openFilter]);

  const handleResetAll = (close: boolean) => {
    setTimesheetUserNames([]);
    setTimesheetUsers([]);
    setTimesheetDeptNames([]);
    setTimesheetDepts([]);
    setTimesheetStartDate("");
    setTimesheetEndDate("");
    setTimesheetError("");
    setTimesheetFilterName("");
    setTimesheetAnyFieldSelected(false);
    setIdFilter(undefined);
    close && setTimesheetDefaultFilter(false);
    close && onDialogClose(false);

    sendFilterToPage({
      ...timeSheet_InitialFilter,
    });
  };

  const handleTimesheetClose = () => {
    onDialogClose(false);
    setTimesheetFilterName("");
    setTimesheetDefaultFilter(false);
    setTimesheetUserNames([]);
    setTimesheetUsers([]);
    setTimesheetDeptNames([]);
    setTimesheetDepts([]);
    setTimesheetStartDate("");
    setTimesheetEndDate("");
    setTimesheetError("");
  };

  const handleTimesheetFilterApply = () => {
    sendFilterToPage({
      ...timeSheet_InitialFilter,
      users: timesheetUserNames,
      departmentIds: timesheetDeptNames,
      startDate:
        timesheetStartDate.toString().trim().length <= 0
          ? timesheetEndDate.toString().trim().length <= 0
            ? getDates()[0]
            : getFormattedDate(timesheetEndDate)
          : getFormattedDate(timesheetStartDate),
      endDate:
        timesheetEndDate.toString().trim().length <= 0
          ? timesheetStartDate.toString().trim().length <= 0
            ? getDates()[getDates().length - 1]
            : getFormattedDate(timesheetStartDate)
          : getFormattedDate(timesheetEndDate),
    });

    onDialogClose(false);
  };

  const handleTimesheetSavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...timeSheet_InitialFilter,
          users: filteredFilters[index].AppliedFilter.users,
          departmentIds:
          filteredFilters[index].AppliedFilter.departmentIds,
          startDate: filteredFilters[index].AppliedFilter.startDate,
          endDate: filteredFilters[index].AppliedFilter.endDate,
        });
      }
    }

    onDialogClose(false);
  };

  const handleTimesheetSaveFilter = async () => {
    if (timesheetFilterName.trim().length === 0) {
      setTimesheetError("This is required field!");
    } else if (timesheetFilterName.trim().length > 15) {
      setTimesheetError("Max 15 characters allowed!");
    } else {
      setTimesheetError("");
      const params = {
        filterId: currentFilterId > 0 ? currentFilterId : null,
        name: timesheetFilterName,
        AppliedFilter: {
          users: timesheetUserNames.length > 0 ? timesheetUserNames : [],
          departmentIds:
            timesheetDeptNames.length > 0 ? timesheetDeptNames : [],
          startDate:
            timesheetStartDate.toString().trim().length <= 0
              ? timesheetEndDate.toString().trim().length <= 0
                ? getDates()[0]
                : getFormattedDate(timesheetEndDate)
              : getFormattedDate(timesheetStartDate),
          endDate:
            timesheetEndDate.toString().trim().length <= 0
              ? timesheetStartDate.toString().trim().length <= 0
                ? getDates()[getDates().length - 1]
                : getFormattedDate(timesheetStartDate)
              : getFormattedDate(timesheetEndDate),
        },
        type: timesheet,
      };
      const url = `${process.env.worklog_api_url}/filter/savefilter`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Filter has been successully saved.");
          handleTimesheetClose();
          getTimesheetFilterList();
          handleTimesheetFilterApply();
          setTimesheetSaveFilter(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  useEffect(() => {
    getTimesheetFilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      timesheetUserNames.length > 0 ||
      timesheetDeptNames.length > 0 ||
      timesheetStartDate.toString().trim().length > 0 ||
      timesheetEndDate.toString().trim().length > 0;

    setTimesheetAnyFieldSelected(isAnyFieldSelected);
    setTimesheetSaveFilter(false);
  }, [
    timesheetDeptNames,
    timesheetUserNames,
    timesheetStartDate,
    timesheetEndDate,
  ]);

  useEffect(() => {
    const userDropdowns = async () => {
      setTimesheetDeptDropdown(await getDeptData());
      setTimesheetUserDropdown(await getCCDropdownData());
    };
    userDropdowns();
  }, []);

  const getTimesheetFilterList = async () => {
    const params = {
      type: timesheet,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: SavedFilter[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setTimesheetSavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleTimesheetSavedFilterEdit = (index: number) => {
    setTimesheetSaveFilter(true);
    setTimesheetDefaultFilter(true);

    const { Name, FilterId, AppliedFilter } = filteredFilters[index];
    setTimesheetFilterName(Name);
    setCurrentFilterId(FilterId);

    const users = AppliedFilter?.users || [];
    setTimesheetUsers(
      users.length > 0
        ? timesheetUserDropdown.filter((user: LabelValue) =>
            users.includes(user.value)
          )
        : []
    );
    setTimesheetUserNames(users);

    const department = AppliedFilter?.departmentIds || [];
    setTimesheetDepts(
      department.length > 0
        ? timesheetDeptDropdown.filter((dept: LabelValue) =>
            department.includes(dept.value)
          )
        : []
    );
    setTimesheetDeptNames(department);

    setTimesheetStartDate(AppliedFilter?.startDate || "");
    setTimesheetEndDate(AppliedFilter?.endDate || "");
  };

  const handleTimesheetSavedFilterDelete = async () => {
    const params = {
      filterId: currentFilterId,
    };
    const url = `${process.env.worklog_api_url}/filter/delete`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been deleted successfully.");
        handleTimesheetClose();
        getTimesheetFilterList();
        setCurrentFilterId(0);
        sendFilterToPage({ ...timeSheet_InitialFilter });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const filteredFilters = timesheetSavedFilters.filter((filter: any) =>
    filter.Name.toLowerCase().includes(timesheetSearchValue.toLowerCase())
  );

  return (
    <>
      {timesheetSavedFilters.length > 0 && !timesheetDefaultFilter ? (
        <Popover
          id={idFilter}
          open={isFiltering}
          anchorEl={anchorElFilter}
          onClose={() => onDialogClose(false)}
          anchorOrigin={{
            vertical: 110,
            horizontal: "right",
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
                setTimesheetDefaultFilter(true);
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
                value={timesheetSearchValue}
                onChange={(e) => setTimesheetSearchValue(e.target.value)}
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {filteredFilters.map((i: SavedFilter, index: number) => {
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
                        handleTimesheetSavedFilterApply(index);
                      }}
                    >
                      {i.Name}
                    </span>
                    <span className="flex gap-[10px] pr-[10px]">
                      <span
                        onClick={() => handleTimesheetSavedFilterEdit(index)}
                      >
                        <Tooltip title="Edit" placement="top" arrow>
                          <Edit className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                        </Tooltip>
                      </span>
                      <span
                        onClick={() => {
                          setTimesheetIsDeleting(true);
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
            <Button
              onClick={() => handleResetAll(true)}
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
          onClose={() => onDialogClose(false)}
        >
          <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
            <span className="text-lg font-medium">Filter</span>
            <Button color="error" onClick={() => handleResetAll(false)}>
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
                    multiple
                    id="tags-standard"
                    options={timesheetUserDropdown}
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage[]) => {
                      if (data.length <= 20) {
                        // Limit to 10 selections
                        setTimesheetUserNames(
                          data.map((d: LabelValueProfileImage) => d.value)
                        );
                        setTimesheetUsers(data);
                      }
                    }}
                    value={timesheetUsers}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="User Name"
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
                    options={timesheetDeptDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      setTimesheetDeptNames(
                        data.map((d: LabelValue) => d.value)
                      );
                      setTimesheetDepts(data);
                    }}
                    value={timesheetDepts}
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
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(timesheetEndDate)}
                      value={
                        timesheetStartDate === ""
                          ? null
                          : dayjs(timesheetStartDate)
                      }
                      onChange={(newValue: any) =>
                        setTimesheetStartDate(newValue)
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
                      // shouldDisableDate={isWeekend}
                      minDate={dayjs(timesheetStartDate)}
                      maxDate={dayjs(Date.now())}
                      value={
                        timesheetEndDate === "" ? null : dayjs(timesheetEndDate)
                      }
                      onChange={(newValue: any) =>
                        setTimesheetEndDate(newValue)
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
            {!timesheetSaveFilter ? (
              <>
                <Button
                  variant="contained"
                  color="info"
                  className={`${timesheetAnyFieldSelected && "!bg-secondary"}`}
                  disabled={!timesheetAnyFieldSelected}
                  onClick={handleTimesheetFilterApply}
                >
                  Apply Filter
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  className={`${timesheetAnyFieldSelected && "!bg-secondary"}`}
                  onClick={() => setTimesheetSaveFilter(true)}
                  disabled={!timesheetAnyFieldSelected}
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
                    value={timesheetFilterName}
                    onChange={(e) => {
                      setTimesheetFilterName(e.target.value);
                      setTimesheetError("");
                    }}
                    error={timesheetError.length > 0 ? true : false}
                    helperText={timesheetError}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleTimesheetSaveFilter}
                  className={`${
                    timesheetFilterName.length === 0 ? "" : "!bg-secondary"
                  }`}
                  disabled={timesheetFilterName.length === 0}
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
                  ? handleResetAll(true)
                  : (onDialogClose(false), setTimesheetDefaultFilter(false))
              }
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <DeleteDialog
        isOpen={timesheetIsDeleting}
        onClose={() => setTimesheetIsDeleting(false)}
        onActionClick={handleTimesheetSavedFilterDelete}
        Title={"Delete Filter"}
        firstContent={"Are you sure you want to delete this saved filter?"}
        secondContent={
          "If you delete this, you will permanently loose this saved filter and selected fields."
        }
      />
    </>
  );
};

export default TimesheetReportFilter;
