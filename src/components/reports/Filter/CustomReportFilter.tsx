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
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { getFormattedDate } from "@/utils/timerFunctions";
import { getYears, isWeekend } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";
import {
  IdNameEstimatedHour,
  LabelValue,
  LabelValueProfileImage,
  LabelValueType,
} from "@/utils/Types/types";

interface SavedFilter {
  FilterId: number;
  Name: string;
  AppliedFilter: {
    clientIdsJSON: number[];
    projectIdsJSON: number[];
    processIdsJSON: number[];
    WorkTypeId?: number | null;
    assignedById: number | null;
    assigneeId: number | null;
    reviewerId: number | null;
    returnTypeId: number | null;
    numberOfPages: number | null;
    returnYear: number | null;
    subProcessId: number | null;
    StatusId: number | null;
    priority: number | null;
    startDate: string | null;
    endDate: string | null;
    startDateReview: string | null;
    startDateLogged: string | null;
    endDateLogged: string | null;
    endDateReview: string | null;
    dueDate: string | null;
    allInfoDate: string | null;
  };
}

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

  const [clients, setClients] = useState<LabelValue[]>([]);
  const [clientName, setClientName] = useState<number[]>([]);
  const [typeOfWorkName, setTypeOfWorkName] = useState<LabelValue | null>(null);
  const [projectName, setProjectName] = useState<LabelValue | null>(null);
  const [processName, setProcessName] = useState<LabelValue | null>(null);
  const [subProcessName, setSubProcessName] = useState<LabelValue | null>(null);
  const [assignByName, setAssignByName] =
    useState<LabelValueProfileImage | null>(null);
  const [assigneeName, setAssigneeName] =
    useState<LabelValueProfileImage | null>(null);
  const [reviewerName, setReviewerName] =
    useState<LabelValueProfileImage | null>(null);
  const [returnTypeName, setReturnTypeName] = useState<LabelValue | null>(null);
  const [noofPages, setNoofPages] = useState<string | number>("");
  const [returnYear, setReturnYear] = useState<LabelValue | null>(null);
  const [status, setStatus] = useState<LabelValueType | null>(null);
  const [priority, setPriority] = useState<LabelValue | null>(null);
  const [startDate, setStartDate] = useState<string | number>("");
  const [endDate, setEndDate] = useState<string | number>("");
  const [startDateReview, setStartDateReview] = useState<string | number>("");
  const [endDateReview, setEndDateReview] = useState<string | number>("");
  const [startDateLogged, setStartDateLogged] = useState<string | number>("");
  const [endDateLogged, setEndDateLogged] = useState<string | number>("");
  const [dueDate, setDueDate] = useState<string | number>("");
  const [allInfoDate, setAllInfoDate] = useState<string | number>("");
  const [filterName, setFilterName] = useState<string>("");
  const [saveFilter, setSaveFilter] = useState<boolean>(false);

  const [clientDropdown, setClientDropdown] = useState<LabelValue[]>([]);
  const [typeOfWorkDropdown, setTypeOfWorkDropdown] = useState<LabelValue[]>(
    []
  );
  const [projectDropdown, setProjectDropdown] = useState<LabelValue[]>([]);
  const [processDropdown, setProcessDropdown] = useState<LabelValue[]>([]);
  const [subProcessDropdown, setSubProcessDropdown] = useState<LabelValue[]>(
    []
  );
  const [userDropdown, setUserDropdown] = useState<LabelValueProfileImage[]>(
    []
  );
  const [statusDropdown, setStatusDropdown] = useState<LabelValueType[]>([]);
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
      setNoofPages(e);
    } else {
      return;
    }
  };

  const handleResetAll = () => {
    setClientName([]);
    setClients([]);
    setTypeOfWorkName(null);
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
    setStartDateReview("");
    setEndDateReview("");
    setStartDateLogged("");
    setEndDateLogged("");
    setDueDate("");
    setAllInfoDate("");
    setError("");
    setFilterName("");
    setDefaultFilter(false);
    onDialogClose(false);
    setIdFilter(undefined);
    setSubProcessDropdown([]);
    setStatusDropdown([]);
    setProjectDropdown([]);

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
    setTypeOfWorkName(null);
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
    setStartDateReview("");
    setEndDateReview("");
    setStartDateLogged("");
    setEndDateLogged("");
    setDueDate("");
    setAllInfoDate("");
    setError("");
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...customreport_InitialFilter,
      clientIdsJSON: clientName.length > 0 ? clientName : [],
      WorkTypeId: typeOfWorkName === null ? null : typeOfWorkName.value,
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
      startDateLogged:
        startDateLogged.toString().trim().length <= 0
          ? endDateLogged.toString().trim().length <= 0
            ? null
            : getFormattedDate(endDateLogged)
          : getFormattedDate(startDateLogged),
      endDateLogged:
        endDateLogged.toString().trim().length <= 0
          ? startDateLogged.toString().trim().length <= 0
            ? null
            : getFormattedDate(startDateLogged)
          : getFormattedDate(endDateLogged),
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
          WorkTypeId: savedFilters[index].AppliedFilter.WorkTypeId,
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
          startDateReview: savedFilters[index].AppliedFilter.startDateReview,
          endDateReview: savedFilters[index].AppliedFilter.endDateReview,
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
        filterId: currentFilterId > 0 ? currentFilterId : null,
        name: filterName,
        AppliedFilter: {
          clientIdsJSON: clientName.length > 0 ? clientName : [],
          WorkTypeId: typeOfWorkName === null ? null : typeOfWorkName.value,
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
          startDateLogged:
            startDateLogged.toString().trim().length <= 0
              ? endDateLogged.toString().trim().length <= 0
                ? null
                : getFormattedDate(endDateLogged)
              : getFormattedDate(startDateLogged),
          endDateLogged:
            endDateLogged.toString().trim().length <= 0
              ? startDateLogged.toString().trim().length <= 0
                ? null
                : getFormattedDate(startDateLogged)
              : getFormattedDate(endDateLogged),
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
    }
  };

  useEffect(() => {
    getFilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      clientName.length > 0 ||
      typeOfWorkName !== null ||
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
      startDateReview.toString().trim().length > 0 ||
      endDateReview.toString().trim().length > 0 ||
      startDateLogged.toString().trim().length > 0 ||
      endDateLogged.toString().trim().length > 0 ||
      dueDate.toString().trim().length > 0 ||
      allInfoDate.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
    setSaveFilter(false);
  }, [
    clientName,
    typeOfWorkName,
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
    startDateReview,
    endDateReview,
    startDateLogged,
    endDateLogged,
    dueDate,
    allInfoDate,
  ]);

  useEffect(() => {
    const customDropdowns = async () => {
      setClientDropdown([
        { label: "Select All", value: ALL },
        ...(await getClientDropdownData()),
      ]);
      setTypeOfWorkDropdown(await getTypeOfWorkDropdownData(0));
      setUserDropdown(await getCCDropdownData());
      setProcessDropdown(await getAllProcessDropdownData());
    };
    customDropdowns();
  }, []);

  useEffect(() => {
    const customDropdowns = async () => {
      setStatusDropdown(await getStatusDropdownData(typeOfWorkName?.value));
    };
    typeOfWorkName !== null && typeOfWorkName?.value > 0 && customDropdowns();
  }, [typeOfWorkName]);

  useEffect(() => {
    const customDropdowns = async () => {
      setProjectDropdown(
        await getProjectDropdownData(
          clientName.length > 0 ? clientName[0] : 0,
          null
        )
      );
    };
    customDropdowns();
  }, [clientName]);

  useEffect(() => {
    const customDropdowns = async () => {
      const data = await getSubProcessDropdownData(
        clientName.length > 0 ? clientName[0] : 0,
        null,
        processName === null ? 0 : processName.value
      );
      setSubProcessDropdown(
        data.length > 0
          ? data.map(
              (item: IdNameEstimatedHour) =>
                new Object({ label: item.Name, value: item.Id })
            )
          : []
      );
    };
    clientName.length > 0 &&
      processName !== null &&
      processName?.value > 0 &&
      customDropdowns();
  }, [clientName, processName]);

  const getFilterList = async () => {
    const params = {
      type: customReport,
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
    setSaveFilter(true);
    setDefaultFilter(true);

    const { Name, FilterId, AppliedFilter } = savedFilters[index];
    setFilterName(Name);
    setCurrentFilterId(FilterId);

    const clients = AppliedFilter?.clientIdsJSON || [];
    setClients(
      clients.length > 0
        ? clientDropdown.filter((client: LabelValue) =>
            clients.includes(client.value)
          )
        : []
    );
    setClientName(clients);

    setTypeOfWorkName(
      AppliedFilter.clientIdsJSON.length === 1 &&
        AppliedFilter.WorkTypeId !== null
        ? (
            await getTypeOfWorkDropdownData(AppliedFilter.clientIdsJSON[0])
          ).filter(
            (item: LabelValue) => item.value === AppliedFilter.WorkTypeId
          )[0]
        : null
    );

    setProjectName(
      AppliedFilter.projectIdsJSON.length > 0
        ? (
            await getProjectDropdownData(AppliedFilter.clientIdsJSON[0], null)
          ).filter(
            (item: LabelValue) => item.value === AppliedFilter.projectIdsJSON[0]
          )[0]
        : null
    );

    setProcessName(
      AppliedFilter.processIdsJSON.length > 0
        ? processDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.processIdsJSON[0]
          )[0]
        : null
    );

    setSubProcessName(
      AppliedFilter.subProcessId !== null &&
        AppliedFilter.clientIdsJSON.length > 0 &&
        AppliedFilter.processIdsJSON.length > 0
        ? (
            await getSubProcessDropdownData(
              AppliedFilter.clientIdsJSON[0],
              null,
              AppliedFilter.processIdsJSON[0]
            ).then((result: IdNameEstimatedHour[]) =>
              result.map((item: IdNameEstimatedHour) => ({
                label: item.Name,
                value: item.Id,
              }))
            )
          ).filter(
            (item: LabelValue) => item.value === AppliedFilter.subProcessId
          )[0]
        : null
    );

    setAssignByName(
      AppliedFilter.assignedById !== null
        ? userDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.assignedById
          )[0]
        : null
    );

    setAssigneeName(
      AppliedFilter.assigneeId !== null
        ? userDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.assigneeId
          )[0]
        : null
    );

    setReviewerName(
      AppliedFilter.reviewerId !== null
        ? userDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.reviewerId
          )[0]
        : null
    );

    setReturnTypeName(
      AppliedFilter.returnTypeId !== null
        ? returnTypeDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.returnTypeId
          )[0]
        : null
    );

    setNoofPages(AppliedFilter.numberOfPages ?? "");

    setReturnYear(
      AppliedFilter.returnYear !== null
        ? yearDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.returnYear
          )[0]
        : null
    );

    setStatus(
      AppliedFilter.StatusId !== null && AppliedFilter.WorkTypeId !== null
        ? (await getStatusDropdownData(AppliedFilter.WorkTypeId)).filter(
            (item: LabelValue) => item.value === AppliedFilter.StatusId
          )[0]
        : null
    );

    setPriority(
      AppliedFilter.priority !== null
        ? priorityDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.priority
          )[0]
        : null
    );

    setStartDate(AppliedFilter?.startDate || "");
    setEndDate(AppliedFilter?.endDate || "");
    setStartDateReview(AppliedFilter?.startDateReview || "");
    setEndDateReview(AppliedFilter?.endDateReview || "");
    setStartDateLogged(AppliedFilter.startDateLogged ?? "");
    setEndDateLogged(AppliedFilter.endDateLogged ?? "");
    setDueDate(AppliedFilter?.dueDate || "");
    setAllInfoDate(AppliedFilter?.allInfoDate || "");
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
        sendFilterToPage({ ...customreport_InitialFilter });
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
                  sx={{ mx: 0.75, minWidth: 200 }}
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
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={typeOfWorkDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setTypeOfWorkName(data);
                      setStatus(null);
                    }}
                    value={typeOfWorkName}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Type Of Work"
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
              </div>
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={processDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setProcessName(data);
                      setSubProcessName(null);
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
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={subProcessDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
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
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage | null) => {
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
              </div>
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={userDropdown}
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage | null) => {
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
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={userDropdown}
                    getOptionLabel={(option: LabelValueProfileImage) =>
                      option.label
                    }
                    onChange={(e, data: LabelValueProfileImage | null) => {
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
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
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
              </div>
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <TextField
                    id="noOfPages"
                    label="Number of Pages"
                    variant="standard"
                    value={noofPages}
                    onChange={(e) => handleNoOfPageChange(e.target.value)}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={yearDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
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
                    getOptionLabel={(option: LabelValueType) => option.label}
                    onChange={(e, data: LabelValueType | null) => {
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
              </div>
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 200 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={priorityDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
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
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[200px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Recieved From"
                      value={startDate === "" ? null : dayjs(startDate)}
                      // shouldDisableDate={isWeekend}
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
                      label="Recieved To"
                      value={endDate === "" ? null : dayjs(endDate)}
                      // shouldDisableDate={isWeekend}
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
              </div>
              <div className="flex gap-[20px]">
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[200px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      value={dueDate === "" ? null : dayjs(dueDate)}
                      // shouldDisableDate={isWeekend}
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
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[200px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Review From"
                      value={
                        startDateReview === "" ? null : dayjs(startDateReview)
                      }
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
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
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[200px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Review To"
                      value={endDateReview === "" ? null : dayjs(endDateReview)}
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      minDate={dayjs(startDateReview)}
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
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[200px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Logged From"
                      value={
                        startDateLogged === "" ? null : dayjs(startDateLogged)
                      }
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      onChange={(newValue: any) => setStartDateLogged(newValue)}
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
                      label="Logged To"
                      value={endDateLogged === "" ? null : dayjs(endDateLogged)}
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      minDate={dayjs(startDateLogged)}
                      onChange={(newValue: any) => setEndDateLogged(newValue)}
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
