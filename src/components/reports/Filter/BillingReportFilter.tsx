import dayjs from "dayjs";
import { toast } from "react-toastify";
import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
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
import { billingReport } from "../Enum/Filtertype";
import { billingreport_InitialFilter } from "@/utils/reports/getFilters";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { getFormattedDate } from "@/utils/timerFunctions";
import { isWeekend } from "@/utils/commonFunction";
import {
  getCCDropdownData,
  getClientDropdownData,
  getProjectDropdownData,
} from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";

const BillingReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const isBTCRef_ForPreviousValue = useRef<boolean>(false);
  const [clients, setClients] = useState<any[]>([]);
  const [clientName, setClientName] = useState<any[]>([]);
  const [projectName, setProjectName] = useState<any>(null);
  const [assignee, setAssignee] = useState<any>(null);
  const [reviewer, setReviewer] = useState<any>(null);
  const [noOfPages, setNoOfPages] = useState<number | string>("");
  const [isBTC, setIsBTC] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | number>("");
  const [endDate, setEndDate] = useState<string | number>("");

  const [clientDropdown, setClientDropdown] = useState<any[]>([]);
  const [projectDropdown, setProjectDropdown] = useState<any[]>([]);
  const [assigneeDropdown, setAssigneeDropdown] = useState<any[]>([]);
  const [reviewerDropdown, setReviewerDropdown] = useState<any[]>([]);

  const [filterName, setFilterName] = useState<string>("");
  const [saveFilter, setSaveFilter] = useState<boolean>(false);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currentFilterId, setCurrentFilterId] = useState<any>("");
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [defaultFilter, setDefaultFilter] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [error, setError] = useState("");

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;

  const handleNoOfPageChange = (e: any) => {
    if (/^\d+$/.test(e.target.value.trim())) {
      setNoOfPages(e.target.value);
    } else {
      return;
    }
  };

  const handleIsBTCChange = (e: any) => {
    isBTCRef_ForPreviousValue.current = isBTC;
    setIsBTC(e.target.checked);
  };

  const handleResetAll = () => {
    setClientName([]);
    setClients([]);
    setProjectName(null);
    setAssignee(null);
    setReviewer(null);
    setNoOfPages("");
    setResetting(true);
    setIsBTC(false);
    setStartDate("");
    setEndDate("");
    setError("");

    sendFilterToPage({
      ...billingreport_InitialFilter,
    });
  };

  const handleClose = () => {
    setResetting(false);
    setFilterName("");
    onDialogClose(false);
    setDefaultFilter(false);

    setClientName([]);
    setClients([]);
    setProjectName(null);
    setAssignee(null);
    setReviewer(null);
    setNoOfPages("");
    setIsBTC(false);
    setStartDate("");
    setEndDate("");
    setError("");
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...billingreport_InitialFilter,
      clients: clientName.length > 0 ? clientName : [],
      projects: projectName !== null ? [projectName.value] : [],
      assigneeId: assignee !== null ? assignee.value : null,
      reviewerId: reviewer !== null ? reviewer.value : null,
      numberOfPages: noOfPages.toString().trim().length > 0 ? noOfPages : null,
      IsBTC: isBTC,
      startDate:
        startDate.toString().trim().length <= 0
          ? endDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(endDate)
          : getFormattedDate(startDate),
      endDate:
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
          ...billingreport_InitialFilter,
          clients: savedFilters[index].AppliedFilter.clients,
          projects: savedFilters[index].AppliedFilter.projects,
          assigneeId: savedFilters[index].AppliedFilter.assigneeId,
          reviewerId: savedFilters[index].AppliedFilter.reviewerId,
          numberOfPages: savedFilters[index].AppliedFilter.numberOfPages,
          IsBTC: savedFilters[index].AppliedFilter.IsBTC,
          startDate: savedFilters[index].AppliedFilter.startDate,
          endDate: savedFilters[index].AppliedFilter.endDate,
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
        clients: clientName,
        projects: projectName !== null ? [projectName.value] : [],
        assigneeId: assignee !== null ? assignee.value : null,
        reviewerId: reviewer !== null ? reviewer.value : null,
        numberOfPages:
          noOfPages.toString().trim().length > 0 ? noOfPages : null,
        IsBTC: isBTC,
        startDate:
          startDate.toString().trim().length <= 0
            ? endDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(endDate)
            : getFormattedDate(startDate),
        endDate:
          endDate.toString().trim().length <= 0
            ? startDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(startDate)
            : getFormattedDate(endDate),
      },
      type: billingReport,
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
        setSaveFilter(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const isAnyFieldSelected =
      clientName.length > 0 ||
      projectName !== null ||
      assignee !== null ||
      reviewer !== null ||
      noOfPages.toString().trim().length > 0 ||
      isBTC !== isBTCRef_ForPreviousValue.current ||
      startDate.toString().trim().length > 0 ||
      endDate.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
    setSaveFilter(false);
    setResetting(false);
  }, [
    clientName,
    projectName,
    assignee,
    reviewer,
    noOfPages,
    isBTC,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    const filterDropdowns = async () => {
      setClientDropdown(await getClientDropdownData());
      setProjectDropdown(
        await getProjectDropdownData(clientName.length > 0 ? clientName[0] : 0)
      );
      setAssigneeDropdown(await getCCDropdownData());
      setReviewerDropdown(await getCCDropdownData());
    };
    filterDropdowns();

    if (clientName.length > 0 || resetting) {
      onDialogClose(true);
    }
  }, [clientName]);

  useEffect(() => {
    getFilterList();
  }, []);

  const getFilterList = async () => {
    const params = {
      type: billingReport,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setSavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSavedFilterEdit = async (index: number) => {
    setClients(
      savedFilters[index].AppliedFilter.clients === null
        ? []
        : clientDropdown.filter((client: any) =>
            savedFilters[index].AppliedFilter.clients.includes(client.value)
          )
    );
    setClientName(savedFilters[index].AppliedFilter.clients);
    setProjectName(
      savedFilters[index].AppliedFilter.projects.length > 0
        ? (
            await getProjectDropdownData(
              savedFilters[index].AppliedFilter.clients[0]
            )
          ).filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.projects[0]
          )[0]
        : null
    );

    setAssignee(
      savedFilters[index].AppliedFilter.assigneeId === null
        ? null
        : assigneeDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.assigneeId
          )[0]
    );
    setReviewer(
      savedFilters[index].AppliedFilter.reviewerId === null
        ? null
        : reviewerDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.reviewerId
          )[0]
    );
    setNoOfPages(savedFilters[index].AppliedFilter.numberOfPages ?? "");
    setStartDate(savedFilters[index].AppliedFilter.startDate ?? "");
    setEndDate(savedFilters[index].AppliedFilter.endDate ?? "");

    setCurrentFilterId(savedFilters[index].FilterId);
    setFilterName(savedFilters[index].Name);
    setDefaultFilter(true);
    setSaveFilter(true);
  };

  const handleSavedFilterDelete = async () => {
    const params = {
      filterId: currentFilterId,
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
        setCurrentFilterId("");
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
                  sx={{ mx: 0.75, my: 0.4, minWidth: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={clientDropdown.filter(
                      (option) =>
                        !clients.find((client) => client.value === option.value)
                    )}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setClients(data);
                      setClientName(data.map((d: any) => d.value));
                      setProjectName(null);
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
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={projectDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setProjectName(data);
                    }}
                    disabled={clientName.length > 1}
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
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={assigneeDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setAssignee(data);
                    }}
                    value={assignee}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Prepared/Assignee"
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
                    options={reviewerDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setReviewer(data);
                    }}
                    value={reviewer}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Reviewer"
                      />
                    )}
                  />
                </FormControl>

                <FormControl
                  variant="standard"
                  sx={{ mt: 0.35, mx: 0.75, minWidth: 210 }}
                >
                  <TextField
                    id="noOfPages"
                    label="Number of Pages"
                    variant="standard"
                    value={noOfPages}
                    onChange={handleNoOfPageChange}
                  />
                </FormControl>
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
              </div>
              <div className="flex gap-[20px]">
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
                <FormControl
                  variant="standard"
                  sx={{
                    mt: 2,
                    mx: 0.75,
                    minWidth: 100,
                  }}
                >
                  <FormControlLabel
                    sx={{ color: "#818181" }}
                    control={
                      <Checkbox checked={isBTC} onChange={handleIsBTCChange} />
                    }
                    label="Is Invoice Raised"
                  />
                </FormControl>
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

            <Button variant="outlined" color="info" onClick={handleClose}>
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

export default BillingReportFilter;
