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
  InputLabel,
  MenuItem,
  Popover,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { FilterType } from "../types/ReportsFilterType";
import { user } from "../Enum/Filtertype";
import { userLogs_InitialFilter } from "@/utils/reports/getFilters";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { getFormattedDate } from "@/utils/timerFunctions";
import { isWeekend } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";
import { getCCDropdownData, getDeptData } from "@/utils/commonDropdownApiCall";

const isLoggedIn = 2;
const isLoggedOut = 3;

const UserLogsFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [userlogs_users, setUserlogs_Users] = useState<any[]>([]);
  const [userlogs_userNames, setUserlogs_UserNames] = useState<number[]>([]);
  const [userlogs_dept, setUserlogs_Dept] = useState<any>(null);
  const [userlogs_dateFilter, setUserlogs_DateFilter] = useState<any>("");
  const [userlogs_filterName, setUserlogs_FilterName] = useState<string>("");
  const [userlogs_isloggedIn, setUserlogs_IsloggedIn] = useState<
    number | string
  >(0);
  const [userlogs_saveFilter, setUserlogs_SaveFilter] =
    useState<boolean>(false);
  const [userlogs_deptDropdown, setUserlogs_DeptDropdown] = useState<any[]>([]);
  const [userlogs_userDropdown, setUserlogs_UserDropdown] = useState<any[]>([]);
  const [userlogs_anyFieldSelected, setUserlogs_AnyFieldSelected] =
    useState(false);
  const [userlogs_currentFilterId, setUserlogs_CurrentFilterId] =
    useState<any>("");
  const [userlogs_savedFilters, setUserlogs_SavedFilters] = useState<any[]>([]);
  const [userlogs_defaultFilter, setUserlogs_DefaultFilter] =
    useState<boolean>(false);
  const [userlogs_searchValue, setUserlogs_SearchValue] = useState<string>("");
  const [userlogs_isDeleting, setUserlogs_IsDeleting] =
    useState<boolean>(false);
  const [userlogs_error, setUserlogs_Error] = useState("");

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;

  const handleResetAll = () => {
    setUserlogs_UserNames([]);
    setUserlogs_Users([]);
    setUserlogs_Dept(null);
    setUserlogs_IsloggedIn(0);
    setUserlogs_DateFilter("");
    setUserlogs_Error("");

    sendFilterToPage({
      ...userLogs_InitialFilter,
    });
  };

  const handleClose = () => {
    onDialogClose(false);
    setUserlogs_FilterName("");
    setUserlogs_DefaultFilter(false);
    setUserlogs_UserNames([]);
    setUserlogs_Users([]);
    setUserlogs_Dept(null);
    setUserlogs_IsloggedIn(0);
    setUserlogs_DateFilter("");
    setUserlogs_Error("");
  };

  const getLoggedInFilterValue = () => {
    if (userlogs_isloggedIn === isLoggedIn) return 1;
    if (userlogs_isloggedIn === isLoggedOut) return 0;
    return null;
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...userLogs_InitialFilter,
      users: userlogs_userNames,
      departmentId:
        userlogs_dept === null || userlogs_dept === ""
          ? null
          : userlogs_dept.value,
      dateFilter:
        userlogs_dateFilter === null ||
        userlogs_dateFilter.toString().trim().length <= 0
          ? null
          : getFormattedDate(userlogs_dateFilter),
      isLoggedInFilter: getLoggedInFilterValue(),
    });

    onDialogClose(false);
  };

  const handleSavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...userLogs_InitialFilter,
          users: userlogs_savedFilters[index].AppliedFilter.users,
          department: userlogs_savedFilters[index].AppliedFilter.Department,
          isLoggedInFilter:
            userlogs_savedFilters[index].AppliedFilter.isLoggedInFilter,
        });
      }
    }

    onDialogClose(false);
  };

  const handleSaveFilter = async () => {
    if (userlogs_filterName.trim().length === 0) {
      setUserlogs_Error("This is required field!");
    } else if (userlogs_filterName.trim().length > 15) {
      setUserlogs_Error("Max 15 characters allowed!");
    } else {
      setUserlogs_Error("");
      const params = {
        filterId:
          userlogs_currentFilterId !== "" ? userlogs_currentFilterId : null,
        name: userlogs_filterName,
        AppliedFilter: {
          users: userlogs_userNames.length > 0 ? userlogs_userNames : [],
          Department: userlogs_dept === null ? null : userlogs_dept.value,
          dateFilter:
            userlogs_dateFilter === null || userlogs_dateFilter === ""
              ? null
              : userlogs_dateFilter,
          isLoggedInFilter: getLoggedInFilterValue(),
        },
        type: user,
      };
      const url = `${process.env.worklog_api_url}/filter/savefilter`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Filter has been successully saved.");
          handleClose();
          getFilterList();
          handleFilterApply();
          setUserlogs_SaveFilter(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  useEffect(() => {
    getFilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      userlogs_userNames.length > 0 ||
      userlogs_dept !== null ||
      userlogs_dateFilter !== "" ||
      userlogs_isloggedIn !== 0;

    setUserlogs_AnyFieldSelected(isAnyFieldSelected);
    setUserlogs_SaveFilter(false);
  }, [
    userlogs_dept,
    userlogs_userNames,
    userlogs_dateFilter,
    userlogs_isloggedIn,
  ]);

  useEffect(() => {
    const userDropdowns = async () => {
      setUserlogs_DeptDropdown(await getDeptData());
      setUserlogs_UserDropdown(await getCCDropdownData());
    };
    userDropdowns();
  }, []);

  const getFilterList = async () => {
    const params = {
      type: user,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setUserlogs_SavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSavedFilterEdit = (index: number) => {
    setUserlogs_CurrentFilterId(userlogs_savedFilters[index].FilterId);
    setUserlogs_FilterName(userlogs_savedFilters[index].Name);
    setUserlogs_Users(
      userlogs_savedFilters[index].AppliedFilter.users.length > 0
        ? userlogs_userDropdown.filter((user: any) =>
            userlogs_savedFilters[index].AppliedFilter.users.includes(
              user.value
            )
          )
        : []
    );
    setUserlogs_UserNames(userlogs_savedFilters[index].AppliedFilter.users);
    setUserlogs_Dept(
      userlogs_savedFilters[index].AppliedFilter.Department === null
        ? null
        : userlogs_deptDropdown.filter(
            (item: any) =>
              item.value ===
              userlogs_savedFilters[index].AppliedFilter.Department
          )[0]
    );
    setUserlogs_IsloggedIn(
      userlogs_savedFilters[index].AppliedFilter.isLoggedInFilter ?? 0
    );
    setUserlogs_DefaultFilter(true);
    setUserlogs_SaveFilter(true);
    setUserlogs_DateFilter(
      userlogs_savedFilters[index].AppliedFilter.dateFilter === null
        ? ""
        : userlogs_savedFilters[index].AppliedFilter.dateFilter
    );
  };

  const handleSavedFilterDelete = async () => {
    const params = {
      filterId: userlogs_currentFilterId,
    };
    const url = `${process.env.worklog_api_url}/filter/delete`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been deleted successfully.");
        handleClose();
        getFilterList();
        setUserlogs_CurrentFilterId("");
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <>
      {userlogs_savedFilters.length > 0 && !userlogs_defaultFilter ? (
        <Popover
          id={idFilter}
          open={isFiltering}
          anchorEl={anchorElFilter}
          onClose={handleClose}
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
                setUserlogs_DefaultFilter(true);
                setUserlogs_CurrentFilterId(0);
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
                value={userlogs_searchValue}
                onChange={(e: any) => setUserlogs_SearchValue(e.target.value)}
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {userlogs_savedFilters.map((i: any, index: number) => {
              return (
                <>
                  <div
                    key={i.FilterId}
                    className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
                  >
                    <span
                      className="pl-1"
                      onClick={() => {
                        setUserlogs_CurrentFilterId(i.FilterId);
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
                          setUserlogs_IsDeleting(true);
                          setUserlogs_CurrentFilterId(i.FilterId);
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
          onClose={handleClose}
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
                    options={userlogs_userDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setUserlogs_Users(data);
                      setUserlogs_UserNames(data.map((d: any) => d.value));
                    }}
                    value={userlogs_users}
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
                    id="tags-standard"
                    options={userlogs_deptDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setUserlogs_Dept(data);
                    }}
                    value={userlogs_dept}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Department"
                      />
                    )}
                  />
                </FormControl>
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      value={
                        userlogs_dateFilter === ""
                          ? null
                          : dayjs(userlogs_dateFilter)
                      }
                      onChange={(newValue: any) =>
                        setUserlogs_DateFilter(newValue)
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
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <InputLabel id="isLoggedInFilter">Is LoggedIn</InputLabel>
                  <Select
                    labelId="isLoggedInFilter"
                    id="isLoggedInFilter"
                    value={userlogs_isloggedIn === 0 ? "" : userlogs_isloggedIn}
                    onChange={(e) => setUserlogs_IsloggedIn(e.target.value)}
                  >
                    <MenuItem value={1}>All</MenuItem>
                    <MenuItem value={2}>Yes</MenuItem>
                    <MenuItem value={3}>No</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
            {!userlogs_saveFilter ? (
              <>
                <Button
                  variant="contained"
                  color="info"
                  className={`${userlogs_anyFieldSelected && "!bg-secondary"}`}
                  disabled={!userlogs_anyFieldSelected}
                  onClick={handleFilterApply}
                >
                  Apply Filter
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  className={`${userlogs_anyFieldSelected && "!bg-secondary"}`}
                  onClick={() => setUserlogs_SaveFilter(true)}
                  disabled={!userlogs_anyFieldSelected}
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
                    value={userlogs_filterName}
                    onChange={(e) => {
                      setUserlogs_FilterName(e.target.value);
                      setUserlogs_Error("");
                    }}
                    error={userlogs_error.length > 0 ? true : false}
                    helperText={userlogs_error}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleSaveFilter}
                  className={`${
                    userlogs_filterName.length === 0 ? "" : "!bg-secondary"
                  }`}
                  disabled={userlogs_filterName.length === 0}
                >
                  Save & Apply
                </Button>
              </>
            )}

            <Button variant="outlined" color="info" onClick={handleClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <DeleteDialog
        isOpen={userlogs_isDeleting}
        onClose={() => setUserlogs_IsDeleting(false)}
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

export default UserLogsFilter;
