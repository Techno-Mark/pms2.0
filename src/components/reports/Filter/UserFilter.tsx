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
import { user } from "../Enum/Filtertype";
import { user_InitialFilter } from "@/utils/reports/getFilters";
import { getDates, getFormattedDate } from "@/utils/timerFunctions";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { isWeekend } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";
import { getCCDropdownData, getDeptData } from "@/utils/commonDropdownApiCall";

const UserFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [user_userNames, setUser_UserNames] = useState<number[]>([]);
  const [user_users, setUser_Users] = useState<number[]>([]);
  const [user_dept, setUser_Dept] = useState<any>(null);
  const [user_filterName, setUser_FilterName] = useState<string>("");
  const [user_saveFilter, setUser_SaveFilter] = useState<boolean>(false);
  const [user_deptDropdown, setUser_DeptDropdown] = useState<any[]>([]);
  const [user_userDropdown, setUser_UserDropdown] = useState<any[]>([]);
  const [user_anyFieldSelected, setUser_AnyFieldSelected] = useState(false);
  const [user_currentFilterId, setUser_CurrentFilterId] = useState<any>("");
  const [user_savedFilters, setUser_SavedFilters] = useState<any[]>([]);
  const [user_defaultFilter, setUser_DefaultFilter] = useState<boolean>(false);
  const [user_searchValue, setUser_SearchValue] = useState<string>("");
  const [user_isDeleting, setUser_IsDeleting] = useState<boolean>(false);
  const [user_startDate, setUser_StartDate] = useState<string | number>("");
  const [user_endDate, setUser_EndDate] = useState<string | number>("");
  const [user_error, setUser_Error] = useState("");

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;

  const handleUserResetAll = () => {
    setUser_UserNames([]);
    setUser_Users([]);
    setUser_Dept(null);
    setUser_StartDate("");
    setUser_EndDate("");
    setUser_Error("");

    sendFilterToPage({
      ...user_InitialFilter,
    });
  };

  const handleUserClose = () => {
    onDialogClose(false);
    setUser_FilterName("");
    setUser_DefaultFilter(false);
    setUser_UserNames([]);
    setUser_Users([]);
    setUser_Dept(null);
    setUser_StartDate("");
    setUser_EndDate("");
    setUser_Error("");
  };

  const handleUserFilterApply = () => {
    sendFilterToPage({
      ...user_InitialFilter,
      users: user_userNames,
      departmentId:
        user_dept === null || user_dept === "" ? null : user_dept.value,
      startDate:
        user_startDate.toString().trim().length <= 0
          ? user_endDate.toString().trim().length <= 0
            ? getDates()[0]
            : getFormattedDate(user_endDate)
          : getFormattedDate(user_startDate),
      endDate:
        user_endDate.toString().trim().length <= 0
          ? user_startDate.toString().trim().length <= 0
            ? getDates()[getDates().length - 1]
            : getFormattedDate(user_startDate)
          : getFormattedDate(user_endDate),
    });

    onDialogClose(false);
  };

  const handleUserSavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...user_InitialFilter,
          users: user_savedFilters[index].AppliedFilter.users,
          departmentId: user_savedFilters[index].AppliedFilter.Department,
          startDate: user_savedFilters[index].AppliedFilter.startDate,
          endDate: user_savedFilters[index].AppliedFilter.endDate,
        });
      }
    }

    onDialogClose(false);
  };

  const handleUserSaveFilter = async () => {
    if (user_filterName.trim().length === 0) {
      setUser_Error("This is required field!");
    } else if (user_filterName.trim().length > 15) {
      setUser_Error("Max 15 characters allowed!");
    } else {
      setUser_Error("");
      const params = {
        filterId: user_currentFilterId !== "" ? user_currentFilterId : null,
        name: user_filterName,
        AppliedFilter: {
          users: user_userNames.length > 0 ? user_userNames : [],
          departmentId: user_dept === null ? null : user_dept.value,
          startDate:
            user_startDate.toString().trim().length <= 0
              ? user_endDate.toString().trim().length <= 0
                ? getDates()[0]
                : getFormattedDate(user_endDate)
              : getFormattedDate(user_startDate),
          endDate:
            user_endDate.toString().trim().length <= 0
              ? user_startDate.toString().trim().length <= 0
                ? getDates()[getDates().length - 1]
                : getFormattedDate(user_startDate)
              : getFormattedDate(user_endDate),
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
          handleUserClose();
          getUserFilterList();
          handleUserFilterApply();
          setUser_SaveFilter(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  useEffect(() => {
    getUserFilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      user_userNames.length > 0 ||
      user_dept !== null ||
      user_startDate.toString().trim().length > 0 ||
      user_endDate.toString().trim().length > 0;

    setUser_AnyFieldSelected(isAnyFieldSelected);
    setUser_SaveFilter(false);
  }, [user_dept, user_userNames, user_startDate, user_endDate]);

  useEffect(() => {
    const userDropdowns = async () => {
      setUser_DeptDropdown(await getDeptData());
      setUser_UserDropdown(await getCCDropdownData());
    };
    userDropdowns();
  }, []);

  const getUserFilterList = async () => {
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
        setUser_SavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleUserSavedFilterEdit = (index: number) => {
    setUser_CurrentFilterId(user_savedFilters[index].FilterId);
    setUser_FilterName(user_savedFilters[index].Name);
    setUser_Users(
      user_savedFilters[index].AppliedFilter.users.length > 0
        ? user_userDropdown.filter((user: any) =>
            user_savedFilters[index].AppliedFilter.users.includes(user.value)
          )
        : []
    );
    setUser_UserNames(user_savedFilters[index].AppliedFilter.users);
    setUser_Dept(
      user_savedFilters[index].AppliedFilter.departmentId === null
        ? null
        : user_deptDropdown.filter(
            (item: any) =>
              item.value === user_savedFilters[index].AppliedFilter.departmentId
          )[0]
    );
    setUser_StartDate(user_savedFilters[index].AppliedFilter.startDate ?? "");
    setUser_EndDate(user_savedFilters[index].AppliedFilter.endDate ?? "");
    setUser_DefaultFilter(true);
    setUser_SaveFilter(true);
  };

  const handleUserSavedFilterDelete = async () => {
    const params = {
      filterId: user_currentFilterId,
    };
    const url = `${process.env.worklog_api_url}/filter/delete`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been deleted successfully.");
        handleUserClose();
        getUserFilterList();
        setUser_CurrentFilterId("");
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <>
      {user_savedFilters.length > 0 && !user_defaultFilter ? (
        <Popover
          id={idFilter}
          open={isFiltering}
          anchorEl={anchorElFilter}
          onClose={handleUserClose}
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
                setUser_DefaultFilter(true);
                setUser_CurrentFilterId(0);
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
                value={user_searchValue}
                onChange={(e: any) => setUser_SearchValue(e.target.value)}
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {user_savedFilters.map((i: any, index: number) => {
              return (
                <>
                  <div
                    key={i.FilterId}
                    className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
                  >
                    <span
                      className="pl-1"
                      onClick={() => {
                        setUser_CurrentFilterId(i.FilterId);
                        onDialogClose(false);
                        handleUserSavedFilterApply(index);
                      }}
                    >
                      {i.Name}
                    </span>
                    <span className="flex gap-[10px] pr-[10px]">
                      <span onClick={() => handleUserSavedFilterEdit(index)}>
                        <Tooltip title="Edit" placement="top" arrow>
                          <Edit className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                        </Tooltip>
                      </span>
                      <span
                        onClick={() => {
                          setUser_IsDeleting(true);
                          setUser_CurrentFilterId(i.FilterId);
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
            <Button onClick={handleUserResetAll} className="mt-2" color="error">
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
          onClose={handleUserClose}
        >
          <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
            <span className="text-lg font-medium">Filter</span>
            <Button color="error" onClick={handleUserResetAll}>
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
                    options={user_userDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setUser_UserNames(data.map((d: any) => d.value));
                      setUser_Users(data);
                    }}
                    value={user_users}
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
                    options={user_deptDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setUser_Dept(data);
                    }}
                    value={user_dept}
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
                  className={`inline-flex mx-[6px] -mt-[1px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(user_endDate)}
                      value={
                        user_startDate === "" ? null : dayjs(user_startDate)
                      }
                      onChange={(newValue: any) => setUser_StartDate(newValue)}
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
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date"
                      shouldDisableDate={isWeekend}
                      minDate={dayjs(user_startDate)}
                      maxDate={dayjs(Date.now())}
                      value={user_endDate === "" ? null : dayjs(user_endDate)}
                      onChange={(newValue: any) => setUser_EndDate(newValue)}
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
            {!user_saveFilter ? (
              <>
                <Button
                  variant="contained"
                  color="info"
                  className={`${user_anyFieldSelected && "!bg-secondary"}`}
                  disabled={!user_anyFieldSelected}
                  onClick={handleUserFilterApply}
                >
                  Apply Filter
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  className={`${user_anyFieldSelected && "!bg-secondary"}`}
                  onClick={() => setUser_SaveFilter(true)}
                  disabled={!user_anyFieldSelected}
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
                    value={user_filterName}
                    onChange={(e) => {
                      setUser_FilterName(e.target.value);
                      setUser_Error("");
                    }}
                    error={user_error.length > 0 ? true : false}
                    helperText={user_error}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleUserSaveFilter}
                  className={`${
                    user_filterName.length === 0 ? "" : "!bg-secondary"
                  }`}
                  disabled={user_filterName.length === 0}
                >
                  Save & Apply
                </Button>
              </>
            )}

            <Button variant="outlined" color="info" onClick={handleUserClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <DeleteDialog
        isOpen={user_isDeleting}
        onClose={() => setUser_IsDeleting(false)}
        onActionClick={handleUserSavedFilterDelete}
        Title={"Delete Filter"}
        firstContent={"Are you sure you want to delete this saved filter?"}
        secondContent={
          "If you delete this, you will permanently loose this saved filter and selected fields."
        }
      />
    </>
  );
};

export default UserFilter;
