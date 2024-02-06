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
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { FilterType } from "../types/ReportsFilterType";
import { customReport } from "../Enum/Filtertype";
import { customreport_InitialFilter } from "@/utils/reports/getFilters";
import {
  getAllProcessDropdownData,
  getCCDropdownData,
  getClientDropdownData,
  getProjectDropdownData,
  getStatusDropdownData,
  getSubProcessDropdownData,
} from "@/utils/commonDropdownApiCall";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { getFormattedDate } from "@/utils/timerFunctions";
import { getYears, isWeekend } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";

const SIGNED_OFF = "signedoff";
const ACCEPTED = "accept";
const IN_REVIEW = "inreview";
const IN_PROGRESS = "inprogress";
const ALL = -1;

const returnTypeDropdown = [
  {
    label: "Individual Return",
    value: 1,
  },
  {
    label: "Business Return",
    value: 2,
  },
];

const priorityDropdown = [
  {
    label: "High",
    value: 1,
  },
  {
    label: "Medium",
    value: 2,
  },
  {
    label: "Low",
    value: 3,
  },
];

const CustomReportFilter = ({
  isFiltering,
  onDialogClose,
  sendFilterToPage,
}: FilterType) => {
  const yearDropdown = getYears();

  const [clients, setClients] = useState<any[]>([]);
  const [clientName, setClientName] = useState<any[]>([]);
  const [projectName, setProjectName] = useState<any>(null);
  const [processName, setProcessName] = useState<any>(null);
  const [subProcessName, setSubProcessName] = useState<any>(null);
  const [assignByName, setAssignByName] = useState<any>(null);
  const [assigneeName, setAssigneeName] = useState<any>(null);
  const [reviewerName, setReviewerName] = useState<any>(null);
  const [returnTypeName, setReturnTypeName] = useState<any>(null);
  const [noofPages, setNoofPages] = useState<any>("");
  const [returnYear, setReturnYear] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [priority, setPriority] = useState<any>(null);
  const [startDate, setStartDate] = useState<string | number>("");
  const [endDate, setEndDate] = useState<string | number>("");
  const [dueDate, setDueDate] = useState<string | number>("");
  const [allInfoDate, setAllInfoDate] = useState<string | number>("");

  const [filterName, setFilterName] = useState<string>("");
  const [saveFilter, setSaveFilter] = useState<boolean>(false);

  const [clientDropdown, setClientDropdown] = useState<any[]>([]);
  const [projectDropdown, setProjectDropdown] = useState<any[]>([]);
  const [processDropdown, setProcessDropdown] = useState<any[]>([]);
  const [subProcessDropdown, setSubProcessDropdown] = useState<any[]>([]);
  const [userDropdown, setUserDropdown] = useState<any[]>([]);
  const [statusDropdown, setStatusDropdown] = useState<any[]>([]);
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
      setNoofPages(e.target.value);
    } else {
      return;
    }
  };

  const handleResetAll = () => {
    setClientName([]);
    setClients([]);
    setProjectName(null);
    setProcessName(null);
    setAssignByName(null);
    setAssigneeName(null);
    setReviewerName(null);
    setReturnTypeName(null);
    setNoofPages("");
    setReturnYear(null);
    setSubProcessName(null);
    setStatus(null);
    setPriority(null);
    setStartDate("");
    setEndDate("");
    setDueDate("");
    setAllInfoDate("");
    setError("");
    setResetting(true);

    sendFilterToPage({
      ...customreport_InitialFilter,
    });
  };

  const handleClose = () => {
    setFilterName("");
    onDialogClose(false);
    setDefaultFilter(false);
    setClientName([]);
    setClients([]);
    setProjectName(null);
    setProcessName(null);
    setAssignByName(null);
    setAssigneeName(null);
    setReviewerName(null);
    setReturnTypeName(null);
    setNoofPages("");
    setReturnYear(null);
    setSubProcessName(null);
    setStatus(null);
    setPriority(null);
    setStartDate("");
    setEndDate("");
    setDueDate("");
    setAllInfoDate("");
    setError("");
    setResetting(false);
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...customreport_InitialFilter,
      clientIdsJSON: clientName.length > 0 ? clientName : [],
      projectIdsJSON: projectName === null ? [] : [projectName.value],
      processIdsJSON: processName === null ? [] : [processName.value],
      assignedById: assignByName === null ? null : assignByName.value,
      assigneeId: assigneeName === null ? null : assigneeName.value,
      reviewerId: reviewerName === null ? null : reviewerName.value,
      returnTypeId: returnTypeName === null ? null : returnTypeName.value,
      numberOfPages: noofPages.toString().trim().length <= 0 ? null : noofPages,
      returnYear: returnYear === null ? null : returnYear.value,
      subProcessId: subProcessName === null ? null : subProcessName.value,
      StatusId: !!status && !!status.value ? status.value : null,
      priority: priority === null ? null : priority.value,
      startDate:
        startDate.toString().trim().length <= 0
          ? null
          : getFormattedDate(startDate),
      endDate:
        endDate.toString().trim().length <= 0
          ? null
          : getFormattedDate(endDate),
      dueDate:
        dueDate.toString().trim().length <= 0
          ? null
          : getFormattedDate(dueDate),
      allInfoDate:
        allInfoDate.toString().trim().length <= 0
          ? null
          : getFormattedDate(allInfoDate),
    });

    onDialogClose(false);
  };

  const handleSavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...customreport_InitialFilter,
          clientIdsJSON: savedFilters[index].AppliedFilter.clientIdsJSON,
          projectIdsJSON: savedFilters[index].AppliedFilter.projectIdsJSON,
          processIdsJSON: savedFilters[index].AppliedFilter.processIdsJSON,
          assignedById: savedFilters[index].AppliedFilter.assignedById,
          assigneeId: savedFilters[index].AppliedFilter.assigneeId,
          reviewerId: savedFilters[index].AppliedFilter.reviewerId,
          returnTypeId: savedFilters[index].AppliedFilter.returnTypeId,
          numberOfPages: savedFilters[index].AppliedFilter.numberOfPages,
          returnYear: savedFilters[index].AppliedFilter.returnYear,
          subProcessId: savedFilters[index].AppliedFilter.subProcessId,
          StatusId: savedFilters[index].AppliedFilter.StatusId,
          priority: savedFilters[index].AppliedFilter.priority,
          startDate: savedFilters[index].AppliedFilter.startDate,
          endDate: savedFilters[index].AppliedFilter.endDate,
          dueDate: savedFilters[index].AppliedFilter.dueDate,
          allInfoDate: savedFilters[index].AppliedFilter.allInfoDate,
        });
      }
    }

    onDialogClose(false);
  };

  const handleSaveFilter = async () => {
    if (filterName.trim().length === 0) {
      setError("This is required field!");
    } else if (filterName.trim().length > 15) {
      setError("Max 15 characters allowed!");
    } else {
      setError("");
      const params = {
        filterId: currentFilterId !== "" ? currentFilterId : null,
        name: filterName,
        AppliedFilter: {
          clientIdsJSON: clientName.length > 0 ? clientName : [],
          projectIdsJSON: projectName === null ? [] : [projectName.value],
          processIdsJSON: processName === null ? [] : [processName.value],
          assignedById: assignByName === null ? null : assignByName.value,
          assigneeId: assigneeName === null ? null : assigneeName.value,
          reviewerId: reviewerName === null ? null : reviewerName.value,
          returnTypeId: returnTypeName === null ? null : returnTypeName.value,
          numberOfPages:
            noofPages.toString().trim().length <= 0 ? null : noofPages,
          returnYear: returnYear === null ? null : returnYear.value,
          subProcessId: subProcessName === null ? null : subProcessName.value,
          StatusId: !!status && !!status.value ? status.value : null,
          priority: priority === null ? null : priority.value,
          startDate:
            startDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(startDate),
          endDate:
            endDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(endDate),
          dueDate:
            dueDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(dueDate),
          allInfoDate:
            allInfoDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(allInfoDate),
        },
        type: customReport,
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
    }
  };

  useEffect(() => {
    getFilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      clientName.length > 0 ||
      projectName !== null ||
      processName !== null ||
      assignByName !== null ||
      assigneeName !== null ||
      reviewerName !== null ||
      returnTypeName !== null ||
      noofPages.toString().trim().length > 0 ||
      returnYear !== null ||
      subProcessName !== null ||
      status !== null ||
      priority !== null ||
      startDate.toString().trim().length > 0 ||
      endDate.toString().trim().length > 0 ||
      dueDate.toString().trim().length > 0 ||
      allInfoDate.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
    setSaveFilter(false);
    setResetting(false);
  }, [
    clientName,
    projectName,
    processName,
    assignByName,
    assigneeName,
    reviewerName,
    returnTypeName,
    noofPages,
    returnYear,
    subProcessName,
    status,
    priority,
    startDate,
    endDate,
    dueDate,
    allInfoDate,
  ]);

  useEffect(() => {
    const customDropdowns = async () => {
      setClientDropdown([
        { label: "Select All", value: ALL },
        ...(await getClientDropdownData()),
      ]);
      setProjectDropdown(
        await getProjectDropdownData(clientName.length > 0 ? clientName[0] : 0)
      );
      setProcessDropdown(await getAllProcessDropdownData());

      setSubProcessDropdown(
        await getSubProcessDropdownData(
          clientName.length > 0 ? clientName[0] : 0,
          processName === null ? 0 : processName.value
        ).then((result: any) =>
          result.map(
            (item: any) => new Object({ label: item.Name, value: item.Id })
          )
        )
      );
      setUserDropdown(await getCCDropdownData());
      setStatusDropdown(await getStatusDropdownData());
    };
    customDropdowns();

    if (clientName.length > 0 || resetting) {
      onDialogClose(true);
    }
  }, [clientName, processName]);

  const getFilterList = async () => {
    const params = {
      type: customReport,
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
    setSaveFilter(true);
    setDefaultFilter(true);
    setFilterName(savedFilters[index].Name);
    setCurrentFilterId(savedFilters[index].FilterId);

    setClients(
      savedFilters[index].AppliedFilter.clientIdsJSON.length > 0
        ? clientDropdown.filter((client: any) =>
            savedFilters[index].AppliedFilter.clientIdsJSON.includes(
              client.value
            )
          )
        : []
    );
    setClientName(savedFilters[index].AppliedFilter.clientIdsJSON);
    setProjectName(
      savedFilters[index].AppliedFilter.projectIdsJSON.length > 0
        ? (
            await getProjectDropdownData(
              savedFilters[index].AppliedFilter.clientIdsJSON[0]
            )
          ).filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.projectIdsJSON[0]
          )[0]
        : null
    );
    setProcessName(
      savedFilters[index].AppliedFilter.processIdsJSON.length > 0
        ? processDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.processIdsJSON[0]
          )[0]
        : null
    );
    setAssignByName(
      savedFilters[index].AppliedFilter.assignedById === null
        ? null
        : userDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.assignedById
          )[0]
    );
    setAssigneeName(
      savedFilters[index].AppliedFilter.assigneeId === null
        ? null
        : userDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.assigneeId
          )[0]
    );
    setReviewerName(
      savedFilters[index].AppliedFilter.reviewerId === null
        ? null
        : userDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.reviewerId
          )[0]
    );
    setReturnTypeName(
      savedFilters[index].AppliedFilter.returnTypeId === null
        ? null
        : returnTypeDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.returnTypeId
          )[0]
    );
    setNoofPages(savedFilters[index].AppliedFilter.numberOfPages ?? "");
    setReturnYear(
      savedFilters[index].AppliedFilter.returnYear === null
        ? null
        : yearDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.returnYear
          )
    );
    setSubProcessName(
      savedFilters[index].AppliedFilter.subProcessId === null
        ? null
        : subProcessDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.subProcessId
          )
    );
    setStatus(
      savedFilters[index].AppliedFilter.status === null
        ? null
        : statusDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.status
          )[0]
    );
    setPriority(
      savedFilters[index].AppliedFilter.priority === null
        ? null
        : priorityDropdown.filter(
            (item: any) =>
              item.value === savedFilters[index].AppliedFilter.priority
          )[0]
    );
    setStartDate(savedFilters[index].AppliedFilter.startDate ?? "");
    setEndDate(savedFilters[index].AppliedFilter.endDate ?? "");
    setDueDate(savedFilters[index].AppliedFilter.dueDate ?? "");
    setAllInfoDate(savedFilters[index].AppliedFilter.allInfoDate ?? "");
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
                  sx={{ mx: 0.75, my: 0.5, minWidth: 200 }}
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
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      if (data.some((d: any) => d.value === -1)) {
                        setClients(
                          clientDropdown.filter((d: any) => d.value !== -1)
                        );
                        setClientName(
                          clientDropdown
                            .filter((d: any) => d.value !== -1)
                            .map((d: any) => d.value)
                        );
                        setProjectName(null);
                        setProcessName(null);
                        setSubProcessName(null);
                      } else {
                        setClients(data);
                        setClientName(data.map((d: any) => d.value));
                        setProjectName(null);
                        setProcessName(null);
                        setSubProcessName(null);
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
                  sx={{ mx: 0.75, minWidth: 200 }}
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
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={processDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setProcessName(data);
                    }}
                    // disabled={clientName.length > 1}
                    value={processName}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Process Name"
                      />
                    )}
                  />
                </FormControl>
              </div>
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={subProcessDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setSubProcessName(data);
                    }}
                    // disabled={clientName.length > 1}
                    value={subProcessName}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Sub-Process Name"
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={userDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setAssignByName(data);
                    }}
                    value={assignByName}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Assign By"
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={userDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setAssigneeName(data);
                    }}
                    value={assigneeName}
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
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={userDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setReviewerName(data);
                    }}
                    value={reviewerName}
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
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={returnTypeDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setReturnTypeName(data);
                    }}
                    value={returnTypeName}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Return Type"
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <TextField
                    id="noOfPages"
                    label="Number of Pages"
                    variant="standard"
                    value={noofPages}
                    onChange={handleNoOfPageChange}
                  />
                </FormControl>
              </div>
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={yearDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setReturnYear(data);
                    }}
                    value={returnYear}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Return Year"
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={statusDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setStatus(data);
                    }}
                    value={status}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Status"
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={priorityDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setPriority(data);
                    }}
                    value={priority}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Priority"
                      />
                    )}
                  />
                </FormControl>
              </div>
              <div className="flex gap-[20px]">
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[200px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From"
                      value={startDate === "" ? null : dayjs(startDate)}
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
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
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[200px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="To"
                      value={endDate === "" ? null : dayjs(endDate)}
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      minDate={dayjs(startDate)}
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
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[200px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      value={dueDate === "" ? null : dayjs(dueDate)}
                      shouldDisableDate={isWeekend}
                      minDate={dayjs(startDate)}
                      maxDate={dayjs(Date.now())}
                      onChange={(newValue: any) => setDueDate(newValue)}
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
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[200px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="All Info Date"
                      value={allInfoDate === "" ? null : dayjs(allInfoDate)}
                      onChange={(newValue: any) => setAllInfoDate(newValue)}
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
                  sx={{ marginRight: 3, minWidth: 390 }}
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

export default CustomReportFilter;
