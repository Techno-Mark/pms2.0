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
import { userlog } from "../Enum/Filtertype";
import { userLogs_InitialFilter } from "@/utils/reports/getFilters";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { getFormattedDate } from "@/utils/timerFunctions";
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
    dateFilter: string | null;
    isLoggedInFilter: number | null;
  };
}

const isLoggedIn = 2;
const isLoggedOut = 3;

const UserLogsReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [userlogs_users, setUserlogs_Users] = useState<
    LabelValueProfileImage[]
  >([]);
  const [userlogs_userNames, setUserlogs_UserNames] = useState<number[]>([]);
  const [userlogs_depts, setUserlogs_Depts] = useState<LabelValue[]>([]);
  const [userlogs_deptNames, setUserlogs_DeptNames] = useState<number[]>([]);
  const [userlogs_dateFilter, setUserlogs_DateFilter] = useState<string>("");
  const [userlogs_filterName, setUserlogs_FilterName] = useState<string>("");
  const [userlogs_isloggedIn, setUserlogs_IsloggedIn] = useState<
    number | string
  >(0);
  const [userlogs_saveFilter, setUserlogs_SaveFilter] =
    useState<boolean>(false);
  const [userlogs_userDropdown, setUserlogs_UserDropdown] = useState<
    LabelValueProfileImage[]
  >([]);
  const [userlogs_deptDropdown, setUserlogs_DeptDropdown] = useState<
    LabelValue[]
  >([]);
  const [userlogs_anyFieldSelected, setUserlogs_AnyFieldSelected] =
    useState(false);
  const [currentFilterId, setCurrentFilterId] = useState<number>(0);
  const [userlogs_savedFilters, setUserlogs_SavedFilters] = useState<
    SavedFilter[]
  >([]);
  const [userlogs_defaultFilter, setUserlogs_DefaultFilter] =
    useState<boolean>(false);
  const [userlogs_searchValue, setUserlogs_SearchValue] = useState<string>("");
  const [userlogs_isDeleting, setUserlogs_IsDeleting] =
    useState<boolean>(false);
  const [userlogs_error, setUserlogs_Error] = useState("");
  const [idFilter, setIdFilter] = useState<string | undefined>(undefined);

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);

  useEffect(() => {
    openFilter ? setIdFilter("simple-popover") : setIdFilter(undefined);
  }, [openFilter]);

  const handleResetAll = () => {
    setUserlogs_UserNames([]);
    setUserlogs_Users([]);
    setUserlogs_DeptNames([]);
    setUserlogs_Depts([]);
    setUserlogs_IsloggedIn(0);
    setUserlogs_DateFilter("");
    setUserlogs_Error("");
    setUserlogs_FilterName("");
    setUserlogs_DefaultFilter(false);
    onDialogClose(false);
    setIdFilter(undefined);

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
    setUserlogs_DeptNames([]);
    setUserlogs_Depts([]);
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
      departmentIds: userlogs_deptNames,
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
          departmentIds:
            userlogs_savedFilters[index].AppliedFilter.departmentIds,
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
        filterId: currentFilterId > 0 ? currentFilterId : null,
        name: userlogs_filterName,
        AppliedFilter: {
          users: userlogs_userNames.length > 0 ? userlogs_userNames : [],
          departmentIds:
            userlogs_deptNames.length > 0 ? userlogs_deptNames : [],
          dateFilter:
            userlogs_dateFilter === null || userlogs_dateFilter === ""
              ? null
              : userlogs_dateFilter,
          isLoggedInFilter: getLoggedInFilterValue(),
        },
        type: userlog,
      };
      const url = `${process.env.worklog_api_url}/filter/savefilter`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
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
      userlogs_deptNames.length > 0 ||
      userlogs_dateFilter !== "" ||
      userlogs_isloggedIn !== 0;

    setUserlogs_AnyFieldSelected(isAnyFieldSelected);
    setUserlogs_SaveFilter(false);
  }, [
    userlogs_deptNames,
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
      type: userlog,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: SavedFilter[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setUserlogs_SavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSavedFilterEdit = (index: number) => {
    setUserlogs_SaveFilter(true);
    setUserlogs_DefaultFilter(true);

    const { Name, FilterId, AppliedFilter } = userlogs_savedFilters[index];
    setUserlogs_FilterName(Name);
    setCurrentFilterId(FilterId);

    const users = AppliedFilter?.users || [];
    setUserlogs_Users(
      users.length > 0
        ? userlogs_userDropdown.filter((user: LabelValue) =>
            users.includes(user.value)
          )
        : []
    );
    setUserlogs_UserNames(users);

    const department = AppliedFilter?.departmentIds || [];
    setUserlogs_Depts(
      department.length > 0
        ? userlogs_deptDropdown.filter((dept: LabelValue) =>
            department.includes(dept.value)
          )
        : []
    );
    setUserlogs_DeptNames(department);

    setUserlogs_IsloggedIn(
      AppliedFilter.isLoggedInFilter === null
        ? 1
        : AppliedFilter.isLoggedInFilter === 1
        ? 2
        : 3
    );
    setUserlogs_DateFilter(AppliedFilter?.dateFilter || "");
  };

  const handleSavedFilterDelete = async () => {
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
        handleClose();
        getFilterList();
        setCurrentFilterId(0);
        sendFilterToPage({ ...userLogs_InitialFilter });
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
                setUserlogs_DefaultFilter(true);
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
                value={userlogs_searchValue}
                onChange={(e) => setUserlogs_SearchValue(e.target.value)}
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {userlogs_savedFilters.map((i: SavedFilter, index: number) => {
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
                          setUserlogs_IsDeleting(true);
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
                    multiple
                    id="tags-standard"
                    options={userlogs_userDropdown}
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage[]) => {
                      setUserlogs_Users(data);
                      setUserlogs_UserNames(
                        data.map((d: LabelValueProfileImage) => d.value)
                      );
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
                    multiple
                    id="tags-standard"
                    options={userlogs_deptDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      setUserlogs_Depts(data);
                      setUserlogs_DeptNames(
                        data.map((d: LabelValue) => d.value)
                      );
                    }}
                    value={userlogs_depts}
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
                      label="Date"
                      // shouldDisableDate={isWeekend}
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

export default UserLogsReportFilter;
