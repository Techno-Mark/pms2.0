import React, { useEffect, useState } from "react";
import { FilterType } from "../types/ReportsFilterType";
import { callAPI } from "@/utils/API/callAPI";
import { toast } from "react-toastify";
import {
  getCCDropdownData,
  getNatureOfErrorDropdownData,
} from "@/utils/commonDropdownApiCall";
import { errorLog_InitialFilter } from "@/utils/reports/getFilters";
import { errorLogReport } from "../Enum/Filtertype";
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
import { DialogTransition } from "@/utils/style/DialogTransition";
import { Delete, Edit } from "@mui/icons-material";
import SearchIcon from "@/assets/icons/SearchIcon";
import {
  LabelValue,
  LabelValueProfileImage,
  LabelValueType,
} from "@/utils/Types/types";
import {
  errorTypeOptions,
  rootCauseOptions,
  impactOptions,
  priorityOptions,
} from "@/utils/staticDropdownData";
import { getFormattedDate } from "@/utils/timerFunctions";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface SavedFilter {
  FilterId: number;
  Name: string;
  AppliedFilter: {
    ErrorType: number[];
    RootCause: number[];
    Impact: number[];
    NatureOfError: number[];
    Priority: number[];
    Assignee: number[];
    Reviewer: number[];
    ReceivedFrom: string | null;
    ReceivedTo: string | null;
    ResolvedOn: string | null;
  };
}

const ErrorLogReportFilter = ({
  isFiltering,
  onDialogClose,
  sendFilterToPage,
}: FilterType) => {
  const [errorTypes, setErrorTypes] = useState<LabelValue[]>([]);
  const [errorTypeName, setErrorTypeName] = useState<number[]>([]);
  const [rootCauses, setRootCauses] = useState<LabelValue[]>([]);
  const [rootCauseName, setRootCauseName] = useState<number[]>([]);
  const [impact, setImpact] = useState<LabelValue[]>([]);
  const [impactName, setImpactName] = useState<number[]>([]);
  const [natureOfErrors, setNatureOfErrors] = useState<LabelValueType[]>([]);
  const [natureOfErrorName, setNatureOfErrorName] = useState<number[]>([]);
  const [priorities, setPriorities] = useState<LabelValue[]>([]);
  const [priorityName, setPriorityName] = useState<number[]>([]);
  const [assignees, setAssignees] = useState<LabelValueProfileImage[]>([]);
  const [assigneeName, setAssigneeName] = useState<number[]>([]);
  const [reviewers, setReviewers] = useState<LabelValueProfileImage[]>([]);
  const [reviewerName, setReviewerName] = useState<number[]>([]);
  const [assigneeDropdown, setAssigneeDropdown] = useState<
    LabelValueProfileImage[]
  >([]);
  const [reviewerDropdown, setReviewerDropdown] = useState<
    LabelValueProfileImage[]
  >([]);
  const [receivedFrom, setReceivedFrom] = useState<string | number>("");
  const [receivedTo, setReceivedTo] = useState<string | number>("");
  const [resolvedOn, setResolvedOn] = useState<string | number>("");
  const [natureOfErrorDropdown, setNatureOfErrorDropdown] = useState<
    LabelValueType[]
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

  const handleResetAll = (close: boolean) => {
    setErrorTypes([]);
    setErrorTypeName([]);
    setRootCauses([]);
    setRootCauseName([]);
    setImpact([]);
    setImpactName([]);
    setNatureOfErrors([]);
    setNatureOfErrorName([]);
    setPriorities([]);
    setPriorityName([]);
    setAssignees([]);
    setAssigneeName([]);
    setReviewers([]);
    setReviewerName([]);
    setReceivedFrom("");
    setReceivedTo("");
    setResolvedOn("");
    setError("");
    setFilterName("");
    setAnyFieldSelected(false);
    setIdFilter(undefined);
    close && setDefaultFilter(false);
    close && onDialogClose(false);

    sendFilterToPage({
      ...errorLog_InitialFilter,
    });
  };

  const handleClose = () => {
    setFilterName("");
    onDialogClose(false);
    setDefaultFilter(false);

    setErrorTypes([]);
    setErrorTypeName([]);
    setRootCauses([]);
    setRootCauseName([]);
    setImpact([]);
    setImpactName([]);
    setNatureOfErrors([]);
    setNatureOfErrorName([]);
    setPriorities([]);
    setPriorityName([]);
    setAssignees([]);
    setAssigneeName([]);
    setReviewers([]);
    setReviewerName([]);
    setReceivedFrom("");
    setReceivedTo("");
    setResolvedOn("");
    setError("");
  };

  useEffect(() => {
    const filterDropdowns = async () => {
      const data = await getNatureOfErrorDropdownData();
      data.length > 0 && setNatureOfErrorDropdown(data);
      const userData = await getCCDropdownData();
      userData.length > 0
        ? setAssigneeDropdown(userData)
        : setAssigneeDropdown([]);
      userData.length > 0
        ? setReviewerDropdown(userData)
        : setReviewerDropdown([]);
    };
    filterDropdowns();
  }, []);

  const handleFilterApply = () => {
    sendFilterToPage({
      ...errorLog_InitialFilter,
      ErrorType: errorTypeName.length > 0 ? errorTypeName : [],
      RootCause: rootCauseName.length > 0 ? rootCauseName : [],
      Impact: impactName.length > 0 ? impactName : [],
      NatureOfError: natureOfErrorName.length > 0 ? natureOfErrorName : [],
      Priority: priorityName.length > 0 ? priorityName : [],
      Assignee: assigneeName.length > 0 ? assigneeName : [],
      Reviewer: reviewerName.length > 0 ? reviewerName : [],
      ReceivedFrom:
        receivedFrom.toString().trim().length <= 0
          ? receivedTo.toString().trim().length <= 0
            ? null
            : getFormattedDate(receivedTo)
          : getFormattedDate(receivedFrom),
      ReceivedTo:
        receivedTo.toString().trim().length <= 0
          ? receivedFrom.toString().trim().length <= 0
            ? null
            : getFormattedDate(receivedFrom)
          : getFormattedDate(receivedTo),
      ResolvedOn:
        resolvedOn.toString().trim().length <= 0
          ? null
          : getFormattedDate(resolvedOn),
    });

    onDialogClose(false);
  };

  const handleSavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...errorLog_InitialFilter,
          ErrorType: savedFilters[index].AppliedFilter.ErrorType,
          RootCause: savedFilters[index].AppliedFilter.RootCause,
          Impact: savedFilters[index].AppliedFilter.Impact,
          NatureOfError: savedFilters[index].AppliedFilter.NatureOfError,
          Priority: savedFilters[index].AppliedFilter.Priority,
          Assignee: savedFilters[index].AppliedFilter.Assignee,
          Reviewer: savedFilters[index].AppliedFilter.Reviewer,
          ReceivedFrom: savedFilters[index].AppliedFilter.ReceivedFrom,
          ReceivedTo: savedFilters[index].AppliedFilter.ReceivedTo,
          ResolvedOn: savedFilters[index].AppliedFilter.ResolvedOn,
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
        ErrorType: errorTypeName,
        RootCause: rootCauseName,
        Impact: impactName,
        NatureOfError: natureOfErrorName,
        Priority: priorityName,
        Assignee: assigneeName,
        Reviewer: reviewerName,
        ReceivedFrom:
          receivedFrom.toString().trim().length <= 0
            ? receivedTo.toString().trim().length <= 0
              ? null
              : getFormattedDate(receivedTo)
            : getFormattedDate(receivedFrom),
        ReceivedTo:
          receivedTo.toString().trim().length <= 0
            ? receivedFrom.toString().trim().length <= 0
              ? null
              : getFormattedDate(receivedFrom)
            : getFormattedDate(receivedTo),
        ResolvedOn:
          resolvedOn.toString().trim().length <= 0
            ? null
            : getFormattedDate(resolvedOn),
      },
      type: errorLogReport,
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
      errorTypeName.length > 0 ||
      rootCauseName.length > 0 ||
      impactName.length > 0 ||
      natureOfErrorName.length > 0 ||
      priorityName.toString().trim().length > 0 ||
      assigneeName.toString().trim().length > 0 ||
      reviewerName.toString().trim().length > 0 ||
      receivedFrom.toString().trim().length > 0 ||
      receivedTo.toString().trim().length > 0 ||
      resolvedOn.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
    setSaveFilter(false);
  }, [
    errorTypeName,
    rootCauseName,
    impactName,
    natureOfErrorName,
    priorityName,
    assigneeName,
    reviewerName,
    receivedFrom,
    receivedTo,
    resolvedOn,
  ]);

  const getFilterList = async () => {
    const params = {
      type: errorLogReport,
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

    const { Name, FilterId, AppliedFilter } = savedFilters[index];
    setFilterName(Name);
    setCurrentFilterId(FilterId);

    const errorTypes = AppliedFilter?.ErrorType || [];
    setErrorTypes(
      errorTypes.length > 0
        ? errorTypeOptions.filter((errorType: LabelValue) =>
            errorTypes.includes(errorType.value)
          )
        : []
    );
    setErrorTypeName(errorTypes);

    const rootCauses = AppliedFilter?.RootCause || [];
    setRootCauses(
      rootCauses.length > 0
        ? rootCauseOptions.filter((root: LabelValue) =>
            rootCauses.includes(root.value)
          )
        : []
    );
    setRootCauseName(rootCauses);

    const impacts = AppliedFilter?.Impact || [];
    setImpact(
      impacts.length > 0
        ? impactOptions.filter((impact: LabelValue) =>
            impacts.includes(impact.value)
          )
        : []
    );
    setImpactName(impacts);

    const natureOfErrors = AppliedFilter?.NatureOfError || [];
    setNatureOfErrors(
      natureOfErrors.length > 0
        ? natureOfErrorDropdown.filter((natureOfError: LabelValueType) =>
            natureOfErrors.includes(natureOfError.value)
          )
        : []
    );
    setNatureOfErrorName(natureOfErrors);

    const priorities = AppliedFilter?.Priority || [];
    setPriorities(
      priorities.length > 0
        ? priorityOptions.filter((priority: LabelValue) =>
            priorities.includes(priority.value)
          )
        : []
    );
    setPriorityName(priorities);

    const assignees = AppliedFilter?.Assignee || [];
    setAssignees(
      assignees.length > 0
        ? assigneeDropdown.filter((assignee: LabelValue) =>
            assignees.includes(assignee.value)
          )
        : []
    );
    setAssigneeName(assignees);

    const reviewers = AppliedFilter?.Reviewer || [];
    setReviewers(
      reviewers.length > 0
        ? reviewerDropdown.filter((reviewer: LabelValue) =>
            reviewers.includes(reviewer.value)
          )
        : []
    );
    setReviewerName(reviewers);

    setReceivedFrom(AppliedFilter?.ReceivedFrom || "");
    setReceivedTo(AppliedFilter?.ReceivedTo || "");
    setResolvedOn(AppliedFilter?.ResolvedOn || "");
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
      sendFilterToPage({ ...errorLog_InitialFilter });
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
                    options={errorTypeOptions.filter(
                      (option) =>
                        !errorTypes.find(
                          (errorType) => errorType.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      setErrorTypes(data);
                      setErrorTypeName(data.map((d: LabelValue) => d.value));
                    }}
                    value={errorTypes}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Error Type"
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
                    options={rootCauseOptions.filter(
                      (option) =>
                        !rootCauses.find(
                          (rootCause) => rootCause.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      setRootCauses(data);
                      setRootCauseName(data.map((d: LabelValue) => d.value));
                    }}
                    value={rootCauses}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Error Category"
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
                    options={impactOptions.filter(
                      (option) => !impact.find((i) => i.value === option.value)
                    )}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      setImpact(data);
                      setImpactName(data.map((d: LabelValue) => d.value));
                    }}
                    value={impact}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Impact"
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
                    options={natureOfErrorDropdown.filter(
                      (option) =>
                        !natureOfErrors.find(
                          (natureOfError) =>
                            natureOfError.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValueType) => option.label}
                    onChange={(e, data: LabelValueType[]) => {
                      setNatureOfErrors(data);
                      setNatureOfErrorName(
                        data.map((d: LabelValueType) => d.value)
                      );
                    }}
                    value={natureOfErrors}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Error Details"
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
                    options={priorityOptions.filter(
                      (option) =>
                        !priorities.find(
                          (priority) => priority.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      setPriorities(data);
                      setPriorityName(data.map((d: LabelValue) => d.value));
                    }}
                    value={priorities}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Criticality"
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
                    options={assigneeDropdown.filter(
                      (option) =>
                        !assignees.find(
                          (assignee) => assignee.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage[]) => {
                      setAssignees(data);
                      setAssigneeName(
                        data.map((d: LabelValueProfileImage) => d.value)
                      );
                    }}
                    value={assignees}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Assignee"
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
                    options={reviewerDropdown.filter(
                      (option) =>
                        !reviewers.find(
                          (reviewer) => reviewer.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage[]) => {
                      setReviewers(data);
                      setReviewerName(
                        data.map((d: LabelValueProfileImage) => d.value)
                      );
                    }}
                    value={reviewers}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Reviewer"
                      />
                    )}
                  />
                </FormControl>
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Recieved From"
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(receivedTo)}
                      value={receivedFrom === "" ? null : dayjs(receivedFrom)}
                      onChange={(newValue: any) => setReceivedFrom(newValue)}
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
                      label="Recieved To"
                      // shouldDisableDate={isWeekend}
                      minDate={dayjs(receivedFrom)}
                      maxDate={dayjs(Date.now())}
                      value={receivedTo === "" ? null : dayjs(receivedTo)}
                      onChange={(newValue: any) => setReceivedTo(newValue)}
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
                      label="Resolved On"
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(resolvedOn)}
                      value={resolvedOn === "" ? null : dayjs(resolvedOn)}
                      onChange={(newValue: any) => setResolvedOn(newValue)}
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

export default ErrorLogReportFilter;
