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
import { LabelValue, LabelValueProfileImage } from "@/utils/Types/types";
const ALL = -1;

interface SavedFilter {
  FilterId: number;
  Name: string;
  AppliedFilter: {
    clients: number[];
    projects: number[];
    assigneeId: number | null;
    reviewerId: number | null;
    numberOfPages: number | null;
    IsBTC: boolean;
    startDate: string | null;
    endDate: string | null;
    startDateReview: string | null;
    endDateReview: string | null;
  };
}

const BillingReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const isBTCRef_ForPreviousValue = useRef<boolean>(false);
  const [clients, setClients] = useState<LabelValue[]>([]);
  const [clientName, setClientName] = useState<number[]>([]);
  const [projectName, setProjectName] = useState<LabelValue | null>(null);
  const [assignee, setAssignee] = useState<LabelValueProfileImage | null>(null);
  const [reviewer, setReviewer] = useState<LabelValueProfileImage | null>(null);
  const [noOfPages, setNoOfPages] = useState<number | string>("");
  const [isBTC, setIsBTC] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string | number>("");
  const [endDate, setEndDate] = useState<string | number>("");
  const [startDateReview, setStartDateReview] = useState<string | number>("");
  const [endDateReview, setEndDateReview] = useState<string | number>("");

  const [clientDropdown, setClientDropdown] = useState<LabelValue[]>([]);
  const [projectDropdown, setProjectDropdown] = useState<LabelValue[]>([]);
  const [assigneeDropdown, setAssigneeDropdown] = useState<
    LabelValueProfileImage[]
  >([]);
  const [reviewerDropdown, setReviewerDropdown] = useState<
    LabelValueProfileImage[]
  >([]);

  const [filterName, setFilterName] = useState<string>("");
  const [saveFilter, setSaveFilter] = useState<boolean>(false);
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

  const handleNoOfPageChange = (e: string) => {
    if (/^\d+$/.test(e.trim())) {
      setNoOfPages(e);
    } else {
      return;
    }
  };

  const handleIsBTCChange = (e: boolean) => {
    isBTCRef_ForPreviousValue.current = isBTC;
    setIsBTC(e);
  };

  const handleResetAll = (close: boolean) => {
    setClientName([]);
    setClients([]);
    setProjectName(null);
    setAssignee(null);
    setReviewer(null);
    setNoOfPages("");
    setIsBTC(false);
    setStartDate("");
    setEndDate("");
    setStartDateReview("");
    setEndDateReview("");
    setError("");
    setFilterName("");
    setIdFilter(undefined);
    close && setDefaultFilter(false);
    close && onDialogClose(false);

    sendFilterToPage({
      ...billingreport_InitialFilter,
    });
  };

  const handleClose = () => {
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
    setStartDateReview("");
    setEndDateReview("");
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
      startDateReview:
        startDateReview.toString().trim().length <= 0
          ? endDateReview.toString().trim().length <= 0
            ? null
            : getFormattedDate(endDateReview)
          : getFormattedDate(startDateReview),
      endDateReview:
        endDateReview.toString().trim().length <= 0
          ? startDateReview.toString().trim().length <= 0
            ? null
            : getFormattedDate(startDateReview)
          : getFormattedDate(endDateReview),
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
          startDateReview: savedFilters[index].AppliedFilter.startDateReview,
          endDateReview: savedFilters[index].AppliedFilter.endDateReview,
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
        startDateReview:
          startDateReview.toString().trim().length <= 0
            ? endDateReview.toString().trim().length <= 0
              ? null
              : getFormattedDate(endDateReview)
            : getFormattedDate(startDateReview),
        endDateReview:
          endDateReview.toString().trim().length <= 0
            ? startDateReview.toString().trim().length <= 0
              ? null
              : getFormattedDate(startDateReview)
            : getFormattedDate(endDateReview),
      },
      type: billingReport,
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
    const isAnyFieldSelected =
      clientName.length > 0 ||
      projectName !== null ||
      assignee !== null ||
      reviewer !== null ||
      noOfPages.toString().trim().length > 0 ||
      isBTC !== isBTCRef_ForPreviousValue.current ||
      startDate.toString().trim().length > 0 ||
      endDate.toString().trim().length > 0 ||
      startDateReview.toString().trim().length > 0 ||
      endDateReview.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
    setSaveFilter(false);
  }, [
    clientName,
    projectName,
    assignee,
    reviewer,
    noOfPages,
    isBTC,
    startDate,
    endDate,
    startDateReview,
    endDateReview,
  ]);

  useEffect(() => {
    const filterDropdowns = async () => {
      setClientDropdown([
        { label: "Select All", value: ALL },
        ...(await getClientDropdownData()),
      ]);
      setProjectDropdown(
        await getProjectDropdownData(
          clientName.length > 0 ? clientName[0] : 0,
          null
        )
      );
      const userData = await getCCDropdownData();
      userData.length > 0
        ? setAssigneeDropdown(userData)
        : setAssigneeDropdown([]);
      userData.length > 0
        ? setReviewerDropdown(userData)
        : setReviewerDropdown([]);
    };
    filterDropdowns();
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

  const handleSavedFilterEdit = async (index: number) => {
    setClients(
      savedFilters[index].AppliedFilter.clients === null
        ? []
        : clientDropdown.filter((client: LabelValue) =>
            savedFilters[index].AppliedFilter.clients.includes(client.value)
          )
    );
    setClientName(savedFilters[index].AppliedFilter.clients);
    setProjectName(
      savedFilters[index].AppliedFilter.projects.length > 0
        ? (
            await getProjectDropdownData(
              savedFilters[index].AppliedFilter.clients[0],
              null
            )
          ).filter(
            (item: LabelValue) =>
              item.value === savedFilters[index].AppliedFilter.projects[0]
          )[0]
        : null
    );

    setAssignee(
      savedFilters[index].AppliedFilter.assigneeId === null
        ? null
        : assigneeDropdown.filter(
            (item: LabelValueProfileImage) =>
              item.value === savedFilters[index].AppliedFilter.assigneeId
          )[0]
    );
    setReviewer(
      savedFilters[index].AppliedFilter.reviewerId === null
        ? null
        : reviewerDropdown.filter(
            (item: LabelValueProfileImage) =>
              item.value === savedFilters[index].AppliedFilter.reviewerId
          )[0]
    );
    setNoOfPages(savedFilters[index].AppliedFilter.numberOfPages ?? "");
    setStartDate(savedFilters[index].AppliedFilter.startDate ?? "");
    setEndDate(savedFilters[index].AppliedFilter.endDate ?? "");
    setStartDateReview(savedFilters[index].AppliedFilter.startDateReview ?? "");
    setEndDateReview(savedFilters[index].AppliedFilter.endDateReview ?? "");
    setIsBTC(savedFilters[index].AppliedFilter.IsBTC ?? false);

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
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been deleted successfully.");
        handleClose();
        getFilterList();
        setCurrentFilterId(0);
        sendFilterToPage({
          ...billingreport_InitialFilter,
        });
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
            {savedFilters.map((i: SavedFilter, index: number) => {
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
                  sx={{ mx: 0.75, minWidth: 210 }}
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
                        setProjectName(null);
                      } else {
                        setClients(data);
                        setClientName(data.map((d: LabelValue) => d.value));
                        setProjectName(null);
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
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={projectDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
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
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage | null) => {
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
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage | null) => {
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
                  sx={{ mt: 0, mx: 0.75, minWidth: 210 }}
                >
                  <TextField
                    id="noOfPages"
                    label="Number of Pages"
                    variant="standard"
                    value={noOfPages}
                    onChange={(e) => handleNoOfPageChange(e.target.value)}
                  />
                </FormControl>
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px] -mt-1`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Preparation From"
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
              </div>
              <div className="flex gap-[20px]">
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Preparation To"
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
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Review From"
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(endDateReview)}
                      value={
                        startDateReview === "" ? null : dayjs(startDateReview)
                      }
                      onChange={(newValue: any) => setStartDateReview(newValue)}
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
                      label="Review To"
                      // shouldDisableDate={isWeekend}
                      minDate={dayjs(startDateReview)}
                      maxDate={dayjs(Date.now())}
                      value={endDateReview === "" ? null : dayjs(endDateReview)}
                      onChange={(newValue: any) => setEndDateReview(newValue)}
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
                  sx={{
                    mx: 0.75,
                    minWidth: 100,
                  }}
                >
                  <FormControlLabel
                    sx={{ color: "#818181" }}
                    control={
                      <Checkbox
                        checked={isBTC}
                        onChange={(e) => handleIsBTCChange(e.target.checked)}
                      />
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

            <Button
              variant="outlined"
              color="info"
              onClick={() => handleResetAll(true)}
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

export default BillingReportFilter;
