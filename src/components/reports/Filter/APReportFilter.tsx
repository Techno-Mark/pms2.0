import React, { useEffect, useState } from "react";
import { FilterType } from "../types/ReportsFilterType";
import { callAPI } from "@/utils/API/callAPI";
import { toast } from "react-toastify";
import {
  getCCDropdownData,
  getClientDropdownData,
  getDeptData,
} from "@/utils/commonDropdownApiCall";
import { getFormattedDate } from "@/utils/timerFunctions";
import { ap_InitialFilter } from "@/utils/reports/getFilters";
import { apReport } from "../Enum/Filtertype";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { isWeekend } from "@/utils/commonFunction";
import dayjs from "dayjs";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { Delete, Edit } from "@mui/icons-material";
import SearchIcon from "@/assets/icons/SearchIcon";
import { LabelValue, LabelValueProfileImage } from "@/utils/Types/types";

interface SavedFilter {
  FilterId: number;
  Name: string;
  AppliedFilter: {
    Clients: number[];
    Users: number[];
    ReportingManagers: number[];
    DepartmentIds: number[];
    StartDate: string | null;
    EndDate: string | null;
  };
}

const ALL_CLIENT = -1;

const APReportFilter = ({
  isFiltering,
  onDialogClose,
  sendFilterToPage,
}: FilterType) => {
  const [clients, setClients] = useState<LabelValue[]>([]);
  const [clientName, setClientName] = useState<number[]>([]);
  const [users, setUsers] = useState<LabelValueProfileImage[]>([]);
  const [userName, setUserName] = useState<number[]>([]);
  const [reportingManager, setReportingManager] = useState<
    LabelValueProfileImage[]
  >([]);
  const [reportingManagerName, setReportingManagerName] = useState<number[]>(
    []
  );
  const [depts, setDepts] = useState<LabelValue[]>([]);
  const [deptName, setDeptName] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string | number>("");
  const [endDate, setEndDate] = useState<string | number>("");

  const [filterName, setFilterName] = useState<string>("");
  const [saveFilter, setSaveFilter] = useState<boolean>(false);
  const [clientDropdown, setClientDropdown] = useState<LabelValue[]>([]);
  const [userDropdown, setUserDropdown] = useState<LabelValueProfileImage[]>(
    []
  );
  const [departmentDropdown, setDepartmentDropdown] = useState<LabelValue[]>(
    []
  );
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currentFilterId, setCurrentFilterId] = useState<number>(0);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [defaultFilter, setDefaultFilter] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [idFilter, setIdFilter] = useState<string | undefined>(undefined);

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);

  useEffect(() => {
    openFilter ? setIdFilter("simple-popover") : setIdFilter(undefined);
  }, [openFilter]);

  const handleResetAll = (close: boolean) => {
    setClientName([]);
    setClients([]);
    setUserName([]);
    setUsers([]);
    setReportingManager([]);
    setReportingManagerName([]);
    setDeptName([]);
    setDepts([]);
    setStartDate("");
    setEndDate("");
    setError("");
    setFilterName("");
    setAnyFieldSelected(false);
    setIdFilter(undefined);
    close && setDefaultFilter(false);
    close && onDialogClose(false);

    sendFilterToPage({
      ...ap_InitialFilter,
    });
  };

  const handleClose = () => {
    setFilterName("");
    onDialogClose(false);
    setDefaultFilter(false);

    setClientName([]);
    setClients([]);
    setUserName([]);
    setUsers([]);
    setReportingManager([]);
    setReportingManagerName([]);
    setDeptName([]);
    setDepts([]);
    setStartDate("");
    setEndDate("");
    setError("");
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...ap_InitialFilter,
      Clients: clientName.length > 0 ? clientName : [],
      Users: userName.length > 0 ? userName : [],
      ReportingManagers:
        reportingManagerName.length > 0 ? reportingManagerName : [],
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
          ...ap_InitialFilter,
          Clients: filteredFilters[index].AppliedFilter.Clients,
          Users: filteredFilters[index].AppliedFilter.Users,
          ReportingManagers:
          filteredFilters[index].AppliedFilter.ReportingManagers,
          DepartmentIds: filteredFilters[index].AppliedFilter.DepartmentIds,
          StartDate: filteredFilters[index].AppliedFilter.StartDate,
          EndDate: filteredFilters[index].AppliedFilter.EndDate,
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
      filterId: currentFilterId > 0 ? currentFilterId : null,
      name: filterName,
      AppliedFilter: {
        Clients: clientName,
        Users: userName,
        ReportingManagers: reportingManagerName,
        DepartmentIds: deptName,
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
      type: apReport,
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
      clientName.length > 0 ||
      userName.length > 0 ||
      reportingManagerName.length > 0 ||
      deptName.length > 0 ||
      startDate.toString().trim().length > 0 ||
      endDate.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
    setSaveFilter(false);
  }, [
    clientName,
    userName,
    reportingManagerName,
    deptName,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    const filterDropdowns = async () => {
      setClientDropdown([
        { label: "Select All", value: ALL_CLIENT },
        ...(await getClientDropdownData()),
      ]);
      setUserDropdown(await getCCDropdownData());
      setDepartmentDropdown(await getDeptData());
    };
    filterDropdowns();
  }, []);

  const getFilterList = async () => {
    const params = {
      type: apReport,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: SavedFilter[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setSavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSavedFilterEdit = (index: number) => {
    setSaveFilter(true);
    setDefaultFilter(true);

    const { Name, FilterId, AppliedFilter } = filteredFilters[index];
    setFilterName(Name);
    setCurrentFilterId(FilterId);

    const clients = AppliedFilter?.Clients || [];
    setClients(
      clients.length > 0
        ? clientDropdown.filter((client: LabelValue) =>
            clients.includes(client.value)
          )
        : []
    );
    setClientName(clients);

    const users = AppliedFilter?.Users || [];
    setUsers(
      users.length > 0
        ? userDropdown.filter((user: LabelValueProfileImage) =>
            users.includes(user.value)
          )
        : []
    );
    setUserName(users);

    const reporting = AppliedFilter?.ReportingManagers || [];
    setReportingManager(
      reporting.length > 0
        ? userDropdown.filter((manager: LabelValueProfileImage) =>
            reporting.includes(manager.value)
          )
        : []
    );
    setReportingManagerName(reporting);

    const departments = AppliedFilter?.DepartmentIds || [];
    setDepts(
      departments.length > 0
        ? departmentDropdown.filter((dept: LabelValue) =>
            departments.includes(dept.value)
          )
        : []
    );
    setDeptName(departments);

    setStartDate(AppliedFilter?.StartDate || "");
    setEndDate(AppliedFilter?.EndDate || "");
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
      }
      sendFilterToPage({ ...ap_InitialFilter });
    };
    callAPI(url, params, successCallback, "POST");
  };

  const filteredFilters = savedFilters.filter((filter: any) =>
    filter.Name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <>
      {savedFilters.length > 0 && !defaultFilter ? (
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
                onChange={(e) => setSearchValue(e.target.value)}
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
                  sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={
                      clientDropdown.length - 1 === clients.length
                        ? []
                        : clientDropdown.filter(
                            (option) =>
                              !clients.find(
                                (client) => client.value === option.value
                              )
                          )
                    }
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      if (data.some((d: LabelValue) => d.value === -1)) {
                        setClients(
                          clientDropdown.filter(
                            (d: LabelValue) => d.value !== -1
                          )
                        );
                        setClientName(
                          clientDropdown
                            .filter((d: LabelValue) => d.value !== -1)
                            .map((d: LabelValue) => d.value)
                        );
                      } else {
                        setClients(data);
                        setClientName(data.map((d: LabelValue) => d.value));
                      }
                    }}
                    value={clients}
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
                    multiple
                    id="tags-standard"
                    options={userDropdown.filter(
                      (option) =>
                        !users.find((user) => user.value === option.value)
                    )}
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage[]) => {
                      setUsers(data);
                      setUserName(
                        data.map((d: LabelValueProfileImage) => d.value)
                      );
                    }}
                    value={users}
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
                  sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={userDropdown.filter(
                      (option) =>
                        !reportingManager.find(
                          (user) => user.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage[]) => {
                      setReportingManager(data);
                      setReportingManagerName(
                        data.map((d: LabelValueProfileImage) => d.value)
                      );
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
              </div>
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={departmentDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      setDepts(data);
                      setDeptName(data.map((d: LabelValue) => d.value));
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
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Logged From"
                      // shouldDisableDate={isWeekend}
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
                      label="Logged To"
                      // shouldDisableDate={isWeekend}
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
                  ? handleResetAll(true)
                  : (onDialogClose(false), setDefaultFilter(false))
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

export default APReportFilter;
