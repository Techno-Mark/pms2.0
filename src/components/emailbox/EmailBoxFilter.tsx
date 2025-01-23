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
import { getDates, getFormattedDate } from "@/utils/timerFunctions";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { callAPI } from "@/utils/API/callAPI";
import {
  getCCDropdownData,
  getClientDropdownData,
  getDeptData,
  getEmailTypeData,
  getTagData,
} from "@/utils/commonDropdownApiCall";
import { LabelValue } from "@/utils/Types/types";
import { FilterType } from "../reports/types/ReportsFilterType";
import { emailBoxStatusOptions } from "@/utils/staticDropdownData";

const initialFilter = {
  ClientId: null,
  AssigneeId: null,
  TicketStatus: null,
  EmailTypeId: null,
  ReceivedFrom: null,
  ReceivedTo: null,
  Tags: null,
};

interface SavedFilter {
  FilterId: number;
  Name: string;
  AppliedFilter: {
    ClientId: number | null;
    AssigneeId: number | null;
    TicketStatus: number | null;
    EmailTypeId: number | null;
    Tags: string[] | null;
    ReceivedFrom: string | null;
    ReceivedTo: string | null;
  };
}
const timesheet = 1;

const EmailBoxFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
  activeTab,
}: FilterType) => {
  const [client, setClient] = useState<LabelValue | null>(null);
  const [clientDropdown, setClientDropdown] = useState<LabelValue[]>([]);
  const [ticketStatus, setTicketStatus] = useState<LabelValue | null>(null);
  const [assignee, setAssignee] = useState<LabelValue | null>(null);
  const [assigneeDropdown, setAssigneeDropdown] = useState<LabelValue[]>([]);
  const [emailType, setEmailType] = useState<LabelValue | null>(null);
  const [emailTypeDropdown, setEmailTypeDropdown] = useState<LabelValue[]>([]);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
  const [tagDropdown, setTagDropdown] = useState<
    { label: string; value: string }[]
  >([]);
  const [startDate, setStartDate] = useState<string | number>("");
  const [endDate, setEndDate] = useState<string | number>("");
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

  const handleResetAll = (close: boolean, active: boolean) => {
    setClient(null);
    setAssignee(null);
    setTicketStatus(null);
    setEmailType(null);
    setTagNames([]);
    setTags([]);
    setStartDate("");
    setEndDate("");
    setError("");
    setFilterName("");
    setAnyFieldSelected(false);
    setIdFilter(undefined);
    close && setDefaultFilter(false);
    close && onDialogClose(false);

    !active &&
      sendFilterToPage({
        ...initialFilter,
      });
  };

  useEffect(() => handleResetAll(true, true), [activeTab]);

  const handleClose = () => {
    onDialogClose(false);
    setFilterName("");
    setDefaultFilter(false);
    setClient(null);
    setAssignee(null);
    setTicketStatus(null);
    setEmailType(null);
    setTagNames([]);
    setTags([]);
    setStartDate("");
    setEndDate("");
    setError("");
  };

  const handleFilterApply = () => {
    sendFilterToPage({
      ...initialFilter,
      ClientId: client === null ? null : client.value,
      TicketStatus: ticketStatus === null ? null : ticketStatus.value,
      AssigneeId: assignee === null ? null : assignee.value,
      EmailTypeId: emailType === null ? null : emailType.value,
      Tags: tagNames.length > 0 ? tagNames : null,
      ReceivedFrom:
        startDate.toString().trim().length <= 0
          ? endDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(endDate)
          : getFormattedDate(startDate),
      ReceivedTo:
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
          ...initialFilter,
          ClientId: savedFilters[index].AppliedFilter.ClientId,
          TicketStatus: savedFilters[index].AppliedFilter.TicketStatus,
          AssigneeId: savedFilters[index].AppliedFilter.AssigneeId,
          EmailTypeId: savedFilters[index].AppliedFilter.EmailTypeId,
          Tags: savedFilters[index].AppliedFilter.Tags,
          ReceivedFrom: savedFilters[index].AppliedFilter.ReceivedFrom,
          ReceivedTo: savedFilters[index].AppliedFilter.ReceivedTo,
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
          ClientId: client === null ? null : client.value,
          TicketStatus: ticketStatus === null ? null : ticketStatus.value,
          AssigneeId: assignee === null ? null : assignee.value,
          EmailTypeId: emailType === null ? null : emailType.value,
          Tags: tagNames.length > 0 ? tagNames : null,
          ReceivedFrom:
            startDate.toString().trim().length <= 0
              ? endDate.toString().trim().length <= 0
                ? null
                : getFormattedDate(endDate)
              : getFormattedDate(startDate),
          ReceivedTo:
            endDate.toString().trim().length <= 0
              ? startDate.toString().trim().length <= 0
                ? null
                : getFormattedDate(startDate)
              : getFormattedDate(endDate),
        },
        type: timesheet,
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
      client !== null ||
      ticketStatus !== null ||
      assignee !== null ||
      emailType !== null ||
      tagNames.length > 0 ||
      startDate.toString().trim().length > 0 ||
      endDate.toString().trim().length > 0;

    setAnyFieldSelected(isAnyFieldSelected);
    setSaveFilter(false);
  }, [client, ticketStatus, assignee, emailType, tagNames, startDate, endDate]);

  useEffect(() => {
    const userDropdowns = async () => {
      setClientDropdown(await getClientDropdownData());
      setEmailTypeDropdown(await getEmailTypeData());
      setAssigneeDropdown(await getCCDropdownData());
      setTagDropdown(await getTagData());
    };
    userDropdowns();
  }, []);

  const getFilterList = async () => {
    const params = {
      type: timesheet,
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

    setClient(
      AppliedFilter.ClientId !== null
        ? clientDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.ClientId
          )[0]
        : null
    );

    setTicketStatus(
      AppliedFilter.TicketStatus !== null
        ? emailBoxStatusOptions.filter(
            (item: LabelValue) => item.value === AppliedFilter.TicketStatus
          )[0]
        : null
    );

    setAssignee(
      AppliedFilter.AssigneeId !== null
        ? assigneeDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.AssigneeId
          )[0]
        : null
    );

    setEmailType(
      AppliedFilter.EmailTypeId !== null
        ? emailTypeDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.EmailTypeId
          )[0]
        : null
    );

    const tagId = AppliedFilter?.Tags || [];
    setTags(
      tagId.length > 0
        ? tagDropdown.filter((tag: { label: string; value: string }) =>
            tagId.includes(tag.value)
          )
        : []
    );
    setTagNames(tagId);

    setStartDate(AppliedFilter?.ReceivedFrom || "");
    setEndDate(AppliedFilter?.ReceivedTo || "");
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
        sendFilterToPage({ ...initialFilter });
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
              onClick={() => handleResetAll(true, false)}
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
            <Button color="error" onClick={() => handleResetAll(false, false)}>
              Reset all
            </Button>
          </DialogTitle>
          <DialogContent>
            <div className="flex flex-col gap-[20px] pt-[15px]">
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210, pt: "3px" }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={clientDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setClient(data);
                    }}
                    value={client}
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
                  sx={{ mx: 0.75, minWidth: 210, pt: "3px" }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={emailBoxStatusOptions}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setTicketStatus(data);
                    }}
                    value={ticketStatus}
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
                  sx={{ mx: 0.75, minWidth: 210, pt: "3px" }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={assigneeDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setAssignee(data);
                    }}
                    value={assignee}
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
                  sx={{ mx: 0.75, minWidth: 210, pt: "3px" }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={emailTypeDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setEmailType(data);
                    }}
                    value={emailType}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Email Type"
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210, pt: "3px" }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={tagDropdown}
                    getOptionLabel={(option: {
                      label: string;
                      value: string;
                    }) => option.label}
                    onChange={(e, data: { label: string; value: string }[]) => {
                      setTagNames(
                        data.map(
                          (d: { label: string; value: string }) => d.value
                        )
                      );
                      setTags(data);
                    }}
                    value={tags}
                    renderInput={(params: any) => (
                      <TextField {...params} variant="standard" label="Tag" />
                    )}
                  />
                </FormControl>
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Received From"
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
                      label="Received To"
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
                  ? handleResetAll(true, false)
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

export default EmailBoxFilter;
