import React, { useEffect, useState } from "react";
import { FilterType } from "../types/ReportsFilterType";
import { callAPI } from "@/utils/API/callAPI";
import { toast } from "react-toastify";
import { emailType_InitialFilter } from "@/utils/reports/getFilters";
import { emailTypeReport } from "../Enum/Filtertype";
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
import { LabelValue } from "@/utils/Types/types";
import { getFormattedDate } from "@/utils/timerFunctions";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  getClientDropdownData,
  getDepartmentDropdownData,
  getEmailTypeData,
  getGroupWiseRMDropdownData,
  getTagData,
} from "@/utils/commonDropdownApiCall";
import {
  emailBoxSLAStatusOptions,
  emailBoxStatusOptions,
} from "@/utils/staticDropdownData";

interface SavedFilter {
  FilterId: number;
  Name: string;
  AppliedFilter: {
    ClientId: number | null;
    DepartmentId: number | null;
    EmailType: number | null;
    Tags: string[] | null;
    TicketStatus: number | null;
    SlaStatus: number | null;
    ReportingManagerId: number | null;
    ReceivedFrom: string | null;
    ReceivedTo: string | null;
    DueFrom: string | null;
    DueTo: string | null;
    OpenFrom: string | null;
    OpenTo: string | null;
  };
}

const EmailTypeReportFilter = ({
  isFiltering,
  onDialogClose,
  sendFilterToPage,
}: FilterType) => {
  const [clientId, setClientId] = useState<LabelValue | null>(null);
  const [clientDropdown, setClientDropdown] = useState<LabelValue[]>([]);
  const [departmentId, setDepartmentId] = useState<LabelValue | null>(null);
  const [departmentDropdown, setDepartmentDropdown] = useState<LabelValue[]>(
    []
  );
  const [emailTypeId, setEmailTypeId] = useState<LabelValue | null>(null);
  const [emailTypeDropdown, setEmailTypeDropdown] = useState<LabelValue[]>([]);
  const [tag, setTag] = useState<{ label: string; value: string }[]>([]);
  const [tagName, setTagName] = useState<string[]>([]);
  const [tagDropdown, setTagDropdown] = useState<
    { label: string; value: string }[]
  >([]);
  const [ticketStatusId, setTicketStatusId] = useState<LabelValue | null>(null);
  const [slaStatusId, setSLAStatusId] = useState<LabelValue | null>(null);
  const [reportingManager, setReportingManager] = useState<LabelValue | null>(
    null
  );
  const [rmDropdown, setRMDropdown] = useState<LabelValue[]>([]);
  const [receivedFrom, setReceivedFrom] = useState<string | number>("");
  const [receivedTo, setReceivedTo] = useState<string | number>("");
  const [dueFrom, setDueFrom] = useState<string | number>("");
  const [dueTo, setDueTo] = useState<string | number>("");
  const [openFrom, setOpenFrom] = useState<string | number>("");
  const [openTo, setOpenTo] = useState<string | number>("");

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
    setClientId(null);
    setDepartmentId(null);
    setEmailTypeId(null);
    setTagName([]);
    setTag([]);
    setTicketStatusId(null);
    setSLAStatusId(null);
    setReportingManager(null);
    setReceivedFrom("");
    setReceivedTo("");
    setDueFrom("");
    setDueTo("");
    setOpenFrom("");
    setOpenTo("");
    setError("");
    setFilterName("");
    setAnyFieldSelected(false);
    setIdFilter(undefined);
    close && setDefaultFilter(false);
    close && onDialogClose(false);

    sendFilterToPage({
      ...emailType_InitialFilter,
    });
  };

  const handleClose = () => {
    setFilterName("");
    onDialogClose(false);
    setDefaultFilter(false);

    setClientId(null);
    setDepartmentId(null);
    setEmailTypeId(null);
    setTagName([]);
    setTag([]);
    setTicketStatusId(null);
    setSLAStatusId(null);
    setReportingManager(null);
    setReceivedFrom("");
    setReceivedTo("");
    setDueFrom("");
    setDueTo("");
    setOpenFrom("");
    setOpenTo("");
    setError("");
  };

  useEffect(() => {
    const filterDropdowns = async () => {
      setClientDropdown(await getClientDropdownData());
      const departmentData = await getDepartmentDropdownData();
      setDepartmentDropdown(departmentData.DepartmentList);
      setEmailTypeDropdown(await getEmailTypeData());
      setTagDropdown(await getTagData());
      setRMDropdown(await getGroupWiseRMDropdownData(0, 0));
    };
    filterDropdowns();
  }, []);

  const handleFilterApply = () => {
    sendFilterToPage({
      ...emailType_InitialFilter,
      ClientId: clientId !== null ? clientId.value : null,
      DepartmentId: departmentId !== null ? departmentId.value : null,
      EmailType: emailTypeId !== null ? emailTypeId.value : null,
      Tags: tagName.length > 0 ? tagName : null,
      TicketStatus: ticketStatusId !== null ? ticketStatusId.value : null,
      SlaStatus: slaStatusId !== null ? slaStatusId.value : null,
      ReportingManagerId:
        reportingManager !== null ? reportingManager.value : null,
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
      DueFrom:
        dueFrom.toString().trim().length <= 0
          ? dueTo.toString().trim().length <= 0
            ? null
            : getFormattedDate(dueTo)
          : getFormattedDate(dueFrom),
      DueTo:
        dueTo.toString().trim().length <= 0
          ? dueFrom.toString().trim().length <= 0
            ? null
            : getFormattedDate(dueFrom)
          : getFormattedDate(dueTo),
      OpenFrom:
        openFrom.toString().trim().length <= 0
          ? openTo.toString().trim().length <= 0
            ? null
            : getFormattedDate(openTo)
          : getFormattedDate(openFrom),
      OpenTo:
        openTo.toString().trim().length <= 0
          ? openFrom.toString().trim().length <= 0
            ? null
            : getFormattedDate(openFrom)
          : getFormattedDate(openTo),
    });

    onDialogClose(false);
  };

  const handleSavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...emailType_InitialFilter,
          ClientId: savedFilters[index].AppliedFilter.ClientId,
          DepartmentId: savedFilters[index].AppliedFilter.DepartmentId,
          EmailType: savedFilters[index].AppliedFilter.EmailType,
          Tags: savedFilters[index].AppliedFilter.Tags,
          TicketStatus: savedFilters[index].AppliedFilter.TicketStatus,
          SlaStatus: savedFilters[index].AppliedFilter.SlaStatus,
          ReportingManagerId:
            savedFilters[index].AppliedFilter.ReportingManagerId,
          ReceivedFrom: savedFilters[index].AppliedFilter.ReceivedFrom,
          ReceivedTo: savedFilters[index].AppliedFilter.ReceivedTo,
          DueFrom: savedFilters[index].AppliedFilter.DueFrom,
          DueTo: savedFilters[index].AppliedFilter.DueTo,
          OpenFrom: savedFilters[index].AppliedFilter.OpenFrom,
          OpenTo: savedFilters[index].AppliedFilter.OpenTo,
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
        ClientId: clientId !== null ? clientId.value : null,
        DepartmentId: departmentId !== null ? departmentId.value : null,
        EmailType: emailTypeId !== null ? emailTypeId.value : null,
        Tags: tagName.length > 0 ? tagName : null,
        TicketStatus: ticketStatusId !== null ? ticketStatusId.value : null,
        SlaStatus: slaStatusId !== null ? slaStatusId.value : null,
        ReportingManagerId:
          reportingManager !== null ? reportingManager.value : null,
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
        DueFrom:
          dueFrom.toString().trim().length <= 0
            ? dueTo.toString().trim().length <= 0
              ? null
              : getFormattedDate(dueTo)
            : getFormattedDate(dueFrom),
        DueTo:
          dueTo.toString().trim().length <= 0
            ? dueFrom.toString().trim().length <= 0
              ? null
              : getFormattedDate(dueFrom)
            : getFormattedDate(dueTo),
        OpenFrom:
          openFrom.toString().trim().length <= 0
            ? openTo.toString().trim().length <= 0
              ? null
              : getFormattedDate(openTo)
            : getFormattedDate(openFrom),
        OpenTo:
          openTo.toString().trim().length <= 0
            ? openFrom.toString().trim().length <= 0
              ? null
              : getFormattedDate(openFrom)
            : getFormattedDate(openTo),
      },
      type: emailTypeReport,
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
      clientId !== null ||
      departmentId !== null ||
      emailTypeId !== null ||
      tagName.length > 0 ||
      ticketStatusId !== null ||
      slaStatusId !== null ||
      reportingManager !== null ||
      receivedFrom.toString().trim().length > 0 ||
      receivedTo.toString().trim().length > 0 ||
      dueFrom.toString().trim().length > 0 ||
      dueTo.toString().trim().length > 0 ||
      openFrom.toString().trim().length > 0 ||
      openTo.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
    setSaveFilter(false);
  }, [
    clientId,
    departmentId,
    emailTypeId,
    tagName,
    ticketStatusId,
    slaStatusId,
    reportingManager,
    receivedFrom,
    receivedTo,
    dueFrom,
    dueTo,
    openFrom,
    openTo,
  ]);

  const getFilterList = async () => {
    const params = {
      type: emailTypeReport,
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

    setClientId(
      savedFilters[index].AppliedFilter.ClientId !== null
        ? clientDropdown.filter(
            (item: LabelValue) =>
              item.value === savedFilters[index].AppliedFilter.ClientId
          )[0]
        : null
    );
    setDepartmentId(
      savedFilters[index].AppliedFilter.DepartmentId !== null
        ? departmentDropdown.filter(
            (item: LabelValue) =>
              item.value === savedFilters[index].AppliedFilter.DepartmentId
          )[0]
        : null
    );
    setEmailTypeId(
      savedFilters[index].AppliedFilter.EmailType !== null
        ? emailTypeDropdown.filter(
            (item: LabelValue) =>
              item.value === savedFilters[index].AppliedFilter.EmailType
          )[0]
        : null
    );

    const tags = AppliedFilter?.Tags || [];
    setTag(
      tags.length > 0
        ? tagDropdown.filter((t: { label: string; value: string }) =>
            tags.includes(t.value)
          )
        : []
    );
    setTagName(tags);
    setTicketStatusId(
      savedFilters[index].AppliedFilter.TicketStatus !== null
        ? emailBoxStatusOptions.filter(
            (item: LabelValue) =>
              item.value === savedFilters[index].AppliedFilter.TicketStatus
          )[0]
        : null
    );
    setSLAStatusId(
      savedFilters[index].AppliedFilter.SlaStatus !== null
        ? emailBoxSLAStatusOptions.filter(
            (item: LabelValue) =>
              item.value === savedFilters[index].AppliedFilter.SlaStatus
          )[0]
        : null
    );
    setReportingManager(
      savedFilters[index].AppliedFilter.ReportingManagerId !== null
        ? rmDropdown.filter(
            (item: LabelValue) =>
              item.value ===
              savedFilters[index].AppliedFilter.ReportingManagerId
          )[0]
        : null
    );
    setReceivedFrom(AppliedFilter?.ReceivedFrom || "");
    setReceivedTo(AppliedFilter?.ReceivedTo || "");
    setDueFrom(AppliedFilter?.DueFrom || "");
    setDueTo(AppliedFilter?.DueTo || "");
    setOpenFrom(AppliedFilter?.OpenFrom || "");
    setOpenTo(AppliedFilter?.OpenTo || "");
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
      sendFilterToPage({ ...emailType_InitialFilter });
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
                    id="tags-standard"
                    options={clientDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setClientId(data);
                    }}
                    value={clientId}
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
                    options={departmentDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setDepartmentId(data);
                    }}
                    value={departmentId}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Department"
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
                    options={emailTypeDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setEmailTypeId(data);
                    }}
                    value={emailTypeId}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Email Type"
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
                    options={tagDropdown.filter(
                      (option) => !tag.find((t) => t.value === option.value)
                    )}
                    getOptionLabel={(option: {
                      label: string;
                      value: string;
                    }) => option.label}
                    onChange={(e, data: { label: string; value: string }[]) => {
                      setTag(data);
                      setTagName(
                        data.map(
                          (d: { label: string; value: string }) => d.value
                        )
                      );
                    }}
                    value={tag}
                    renderInput={(params: any) => (
                      <TextField {...params} variant="standard" label="Tags" />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={emailBoxStatusOptions}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setTicketStatusId(data);
                    }}
                    value={ticketStatusId}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Ticket Status"
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
                    options={emailBoxSLAStatusOptions}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setSLAStatusId(data);
                    }}
                    value={slaStatusId}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="SLA Status"
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
                    options={rmDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setReportingManager(data);
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
                      label="Due From"
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(dueTo)}
                      value={dueFrom === "" ? null : dayjs(dueFrom)}
                      onChange={(newValue: any) => setDueFrom(newValue)}
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
                      label="Due To"
                      // shouldDisableDate={isWeekend}
                      minDate={dayjs(dueFrom)}
                      maxDate={dayjs(Date.now())}
                      value={dueTo === "" ? null : dayjs(dueTo)}
                      onChange={(newValue: any) => setDueTo(newValue)}
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
                      label="Open From"
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(openTo)}
                      value={openFrom === "" ? null : dayjs(openFrom)}
                      onChange={(newValue: any) => setOpenFrom(newValue)}
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
                      label="Open To"
                      // shouldDisableDate={isWeekend}
                      minDate={dayjs(openFrom)}
                      maxDate={dayjs(Date.now())}
                      value={openTo === "" ? null : dayjs(openTo)}
                      onChange={(newValue: any) => setOpenTo(newValue)}
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

export default EmailTypeReportFilter;
