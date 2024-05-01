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
import { LabelValue, LabelValueProfileImage } from "@/utils/Types/types";

interface SavedFilter {
  FilterId: number;
  Name: string;
  AppliedFilter: {
    users: number[];
    departmentIds: number[];
    dateFilter: string | null;
  };
}

const WorkLoadReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [workload_userNames, setWorkload_UserNames] = useState<number[]>([]);
  const [workload_users, setWorkload_Users] = useState<
    LabelValueProfileImage[]
  >([]);
  const [workload_deptNames, setWorkload_DeptNames] = useState<number[]>([]);
  const [workload_depts, setWorkload_Depts] = useState<LabelValue[]>([]);
  const [workload_dateFilter, setWorkload_DateFilter] = useState<string>("");
  const [workload_filterName, setWorkload_FilterName] = useState<string>("");
  const [workload_saveFilter, setWorkload_SaveFilter] =
    useState<boolean>(false);
  const [workload_userDropdown, setWorkload_UserDropdown] = useState<
    LabelValueProfileImage[]
  >([]);
  const [workload_deptDropdown, setWorkload_DeptDropdown] = useState<
    LabelValue[]
  >([]);
  const [workload_anyFieldSelected, setWorkload_AnyFieldSelected] =
    useState(false);
  const [currentFilterId, setCurrentFilterId] = useState<number>(0);
  const [workload_savedFilters, setWorkload_SavedFilters] = useState<
    SavedFilter[]
  >([]);
  const [workload_defaultFilter, setWorkload_DefaultFilter] =
    useState<boolean>(false);
  const [workload_searchValue, setWorkload_SearchValue] = useState<string>("");
  const [workload_isDeleting, setWorkload_IsDeleting] =
    useState<boolean>(false);
  const [workload_error, setWorkload_Error] = useState("");
  const [idFilter, setIdFilter] = useState<string | undefined>(undefined);

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);

  useEffect(() => {
    openFilter ? setIdFilter("simple-popover") : setIdFilter(undefined);
  }, [openFilter]);

  const handleResetAll = (close: boolean) => {
    setWorkload_UserNames([]);
    setWorkload_Users([]);
    setWorkload_DeptNames([]);
    setWorkload_Depts([]);
    setWorkload_DateFilter("");
    setWorkload_Error("");
    setWorkload_FilterName("");
    setWorkload_AnyFieldSelected(false);
    setIdFilter(undefined);
    close && setWorkload_DefaultFilter(false);
    close && onDialogClose(false);

    sendFilterToPage({
      ...workLoad_InitialFilter,
    });
  };

  const handleUserClose = () => {
    onDialogClose(false);
    setWorkload_FilterName("");
    setWorkload_DefaultFilter(false);
    setWorkload_DateFilter("");
    setWorkload_DeptNames([]);
    setWorkload_Depts([]);
    setWorkload_UserNames([]);
    setWorkload_Users([]);
    setWorkload_Error("");
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...workLoad_InitialFilter,
      users: workload_userNames,
      departmentIds: workload_deptNames,
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
          departmentIds:
            workload_savedFilters[index].AppliedFilter.departmentIds,
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
        filterId: !currentFilterId ? null : currentFilterId,
        name: workload_filterName,
        AppliedFilter: {
          users: workload_userNames.length > 0 ? workload_userNames : [],
          departmentIds:
            workload_deptNames.length > 0 ? workload_deptNames : [],
          dateFilter: !workload_dateFilter
            ? null
            : getFormattedDate(workload_dateFilter),
        },
        type: workload,
      };
      const url = `${process.env.worklog_api_url}/filter/savefilter`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
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
    getFilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      workload_deptNames.length > 0 ||
      workload_dateFilter !== "" ||
      workload_userNames.length > 0;

    setWorkload_AnyFieldSelected(isAnyFieldSelected);
    setWorkload_SaveFilter(false);
  }, [workload_deptNames, workload_dateFilter, workload_userNames]);

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
      ResponseData: SavedFilter[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setWorkload_SavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSavedFilterEdit = (index: number) => {
    setWorkload_SaveFilter(true);
    setWorkload_DefaultFilter(true);

    const { Name, FilterId, AppliedFilter } = workload_savedFilters[index];
    setWorkload_FilterName(Name);
    setCurrentFilterId(FilterId);

    const users = AppliedFilter?.users || [];
    setWorkload_Users(
      users.length > 0
        ? workload_userDropdown.filter((user: LabelValueProfileImage) =>
            users.includes(user.value)
          )
        : []
    );
    setWorkload_UserNames(users);

    const department = AppliedFilter?.departmentIds || [];
    setWorkload_Depts(
      department.length > 0
        ? workload_deptDropdown.filter((user: LabelValue) =>
            department.includes(user.value)
          )
        : []
    );
    setWorkload_DeptNames(department);

    setWorkload_DateFilter(AppliedFilter?.dateFilter || "");
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
        handleUserClose();
        getFilterList();
        setCurrentFilterId(0);
        sendFilterToPage({ ...workLoad_InitialFilter });
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
                setWorkload_DefaultFilter(true);
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
                value={workload_searchValue}
                onChange={(e) => setWorkload_SearchValue(e.target.value)}
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {workload_savedFilters.map((i: SavedFilter, index: number) => {
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
                          setWorkload_IsDeleting(true);
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
                    options={workload_userDropdown}
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage[]) => {
                      setWorkload_UserNames(
                        data.map((d: LabelValueProfileImage) => d.value)
                      );
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
                    multiple
                    id="tags-standard"
                    options={workload_deptDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      setWorkload_DeptNames(
                        data.map((d: LabelValue) => d.value)
                      );
                      setWorkload_Depts(data);
                    }}
                    value={workload_depts}
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
                  className={`inline-flex -mt-1 mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      // shouldDisableDate={isWeekend}
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

            <Button
              variant="outlined"
              color="info"
              onClick={() =>
                currentFilterId > 0 || !!currentFilterId
                  ? handleResetAll(true)
                  : (onDialogClose(false), setWorkload_DefaultFilter(false))
              }
            >
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

export default WorkLoadReportFilter;
