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
import { workload } from "../Enum/Filtertype";
import { workLoad_InitialFilter } from "@/utils/reports/getFilters";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { getFormattedDate } from "@/utils/timerFunctions";
import { isWeekend } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";
import { getCCDropdownData, getDeptData } from "@/utils/commonDropdownApiCall";

const WorkLoadFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [workload_userNames, setWorkload_UserNames] = useState<number[]>([]);
  const [workload_users, setWorkload_Users] = useState<number[]>([]);
  const [workload_dept, setWorkload_Dept] = useState<any>(null);
  const [workload_dateFilter, setWorkload_DateFilter] = useState<any>("");
  const [workload_filterName, setWorkload_FilterName] = useState<string>("");
  const [workload_saveFilter, setWorkload_SaveFilter] =
    useState<boolean>(false);
  const [workload_deptDropdown, setWorkload_DeptDropdown] = useState<any[]>([]);
  const [workload_userDropdown, setWorkload_UserDropdown] = useState<any[]>([]);
  const [workload_anyFieldSelected, setWorkload_AnyFieldSelected] =
    useState(false);
  const [workload_currentFilterId, setWorkload_CurrentFilterId] =
    useState<any>("");
  const [workload_savedFilters, setWorkload_SavedFilters] = useState<any[]>([]);
  const [workload_defaultFilter, setWorkload_DefaultFilter] =
    useState<boolean>(false);
  const [workload_searchValue, setWorkload_SearchValue] = useState<string>("");
  const [workload_isDeleting, setWorkload_IsDeleting] =
    useState<boolean>(false);
  const [workload_error, setWorkload_Error] = useState("");

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;

  const handleUserResetAll = () => {
    setWorkload_UserNames([]);
    setWorkload_Users([]);
    setWorkload_Dept(null);
    setWorkload_DateFilter("");
    setWorkload_Error("");

    sendFilterToPage({
      ...workLoad_InitialFilter,
    });
  };

  const handleUserClose = () => {
    onDialogClose(false);
    setWorkload_FilterName("");
    setWorkload_DefaultFilter(false);
    setWorkload_Dept(null);
    setWorkload_DateFilter("");
    setWorkload_UserNames([]);
    setWorkload_Users([]);
    setWorkload_Error("");
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...workLoad_InitialFilter,
      users: workload_userNames,
      departmentId:
        workload_dept === null || workload_dept === ""
          ? null
          : workload_dept.value,
      dateFilter:
        workload_dateFilter === null ||
        workload_dateFilter.toString().trim().length <= 0
          ? null
          : getFormattedDate(workload_dateFilter),
    });

    onDialogClose(false);
  };

  const handleSavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...workLoad_InitialFilter,
          users: workload_savedFilters[index].AppliedFilter.users,
          department: workload_savedFilters[index].AppliedFilter.Department,
          dateFilter: workload_savedFilters[index].AppliedFilter.dateFilter,
        });
      }
    }

    onDialogClose(false);
  };

  const handleSaveFilter = async () => {
    if (workload_filterName.trim().length === 0) {
      setWorkload_Error("This is required field!");
    } else if (workload_filterName.trim().length > 15) {
      setWorkload_Error("Max 15 characters allowed!");
    } else {
      setWorkload_Error("");
      const params = {
        filterId: !workload_currentFilterId ? null : workload_currentFilterId,
        name: workload_filterName,
        AppliedFilter: {
          users: workload_userNames.length > 0 ? workload_userNames : [],
          Department: workload_dept === null ? null : workload_dept.value,
          dateFilter: !workload_dateFilter ? null : workload_dateFilter,
        },
        type: workload,
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
          getFilterList();
          handleFilterApply();
          setWorkload_SaveFilter(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  useEffect(() => {
    const isAnyFieldSelected =
      workload_dept !== null ||
      workload_dateFilter !== "" ||
      workload_userNames.length > 0;

    setWorkload_AnyFieldSelected(isAnyFieldSelected);
    setWorkload_SaveFilter(false);
  }, [workload_dept, workload_dateFilter, workload_userNames]);

  useEffect(() => {
    const workLoadDropdowns = async () => {
      setWorkload_DeptDropdown(await getDeptData());
      setWorkload_UserDropdown(await getCCDropdownData());
    };

    workLoadDropdowns();
  }, []);

  const getFilterList = async () => {
    const params = {
      type: workload,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setWorkload_SavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSavedFilterEdit = (index: number) => {
    setWorkload_Users(
      workload_savedFilters[index].AppliedFilter.users.length > 0
        ? workload_userDropdown.filter((user: any) =>
            workload_savedFilters[index].AppliedFilter.users.includes(
              user.value
            )
          )
        : []
    );
    setWorkload_UserNames(workload_savedFilters[index].AppliedFilter.users);
    setWorkload_CurrentFilterId(workload_savedFilters[index].FilterId);
    setWorkload_FilterName(workload_savedFilters[index].Name);
    setWorkload_Dept(
      workload_savedFilters[index].AppliedFilter.Department === null
        ? null
        : workload_deptDropdown.filter(
            (item: any) =>
              item.value ===
              workload_savedFilters[index].AppliedFilter.Department
          )[0]
    );
    setWorkload_DateFilter(
      workload_savedFilters[index].AppliedFilter.dateFilter ?? ""
    );
    setWorkload_DefaultFilter(true);
    setWorkload_SaveFilter(true);
  };

  const handleSavedFilterDelete = async () => {
    const params = {
      filterId: workload_currentFilterId,
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
        getFilterList();
        setWorkload_CurrentFilterId("");
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <>
      {workload_savedFilters.length > 0 && !workload_defaultFilter ? (
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
                setWorkload_DefaultFilter(true);
                setWorkload_CurrentFilterId(0);
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
                value={workload_searchValue}
                onChange={(e: any) => setWorkload_SearchValue(e.target.value)}
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {workload_savedFilters.map((i: any, index: number) => {
              return (
                <>
                  <div
                    key={i.FilterId}
                    className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
                  >
                    <span
                      className="pl-1"
                      onClick={() => {
                        setWorkload_CurrentFilterId(i.FilterId);
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
                          setWorkload_IsDeleting(true);
                          setWorkload_CurrentFilterId(i.FilterId);
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
                    options={workload_userDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setWorkload_UserNames(data.map((d: any) => d.value));
                      setWorkload_Users(data);
                    }}
                    value={workload_users}
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
                    options={workload_deptDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setWorkload_Dept(data);
                    }}
                    value={workload_dept}
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
                        workload_dateFilter === ""
                          ? null
                          : dayjs(workload_dateFilter)
                      }
                      onChange={(newValue: any) =>
                        setWorkload_DateFilter(newValue)
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
            {!workload_saveFilter ? (
              <>
                <Button
                  variant="contained"
                  color="info"
                  className={`${workload_anyFieldSelected && "!bg-secondary"}`}
                  disabled={!workload_anyFieldSelected}
                  onClick={handleFilterApply}
                >
                  Apply Filter
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  className={`${workload_anyFieldSelected && "!bg-secondary"}`}
                  onClick={() => setWorkload_SaveFilter(true)}
                  disabled={!workload_anyFieldSelected}
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
                    value={workload_filterName}
                    onChange={(e) => {
                      setWorkload_FilterName(e.target.value);
                      setWorkload_Error("");
                    }}
                    error={workload_error.length > 0 ? true : false}
                    helperText={workload_error}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleSaveFilter}
                  className={`${
                    workload_filterName.length === 0 ? "" : "!bg-secondary"
                  }`}
                  disabled={workload_filterName.length === 0}
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
        isOpen={workload_isDeleting}
        onClose={() => setWorkload_IsDeleting(false)}
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

export default WorkLoadFilter;
