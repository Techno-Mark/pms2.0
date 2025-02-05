import { callAPI } from "@/utils/API/callAPI";
import {
  getAssigneeDropdownData,
  getEmailTypeData,
  getGroupWiseRMDropdownData,
  getTagData,
} from "@/utils/commonDropdownApiCall";
import {
  emailBoxStatusOptions,
  priorityOptions,
} from "@/utils/staticDropdownData";
import { LabelValue } from "@/utils/Types/types";
import { Autocomplete, Button, FormControl, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";

export interface EmailDataContenRef {
  clearEmailDataData: () => void;
}

const EmailData = forwardRef<
  EmailDataContenRef,
  {
    clientId: number;
    ticketId: number;
    activeTab: number;
    setOverlayOpen: any;
    ticketDetails: {
      Assignee: string;
      Status: number;
      DueDate: string;
      EmailType: number;
      Priority: number;
      Tags: string[];
      Subject: string;
      RemainingSyncTime: number;
      AttachmentCount: number;
      ApprovalId: number;
      OriginalMessgeId: string;
    };
    getTicketDetails: () => void;
    tagDropdown: { label: string; value: string }[];
    getTagDropdownData: () => void;
    onOpen: boolean;
    isDisabled: boolean;
    activeTabList: number;
  }
>(
  (
    {
      clientId,
      ticketId,
      activeTab,
      ticketDetails,
      setOverlayOpen,
      getTicketDetails,
      tagDropdown,
      getTagDropdownData,
      onOpen,
      isDisabled,
      activeTabList,
    },
    ref
  ) => {
    const [assignee, setAssignee] = useState<number>(0);
    const [assigneeErr, setAssigneeErr] = useState<boolean>(false);
    const [assigneeDropdown, setAssigneeDropdown] = useState<LabelValue[]>([]);
    const [status, setStatus] = useState<number>(0);
    const [dueDate, setDueDate] = useState<string>("");
    const [emailType, setEmailType] = useState<number>(0);
    const [emailTypeErr, setEmailTypeErr] = useState<boolean>(false);
    const [emailTypeDropdown, setEmailTypeDropdown] = useState<LabelValue[]>(
      []
    );
    const [priority, setPriority] = useState<number>(0);
    const [priorityErr, setPriorityErr] = useState<boolean>(false);
    const [tagNames, setTagNames] = useState<string[]>([]);
    const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [tagData, setTagData] = useState<{ label: string; value: string }[]>(
      []
    );
    const [rmUser, setRMUser] = useState<number>(0);
    const [rmUserErr, setRMUserErr] = useState<boolean>(false);
    const [rmDropdown, setRMDropdown] = useState<LabelValue[]>([]);
    const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);
    const [statusOption, setStatusOption] = useState<LabelValue[]>([]);

    useEffect(() => {
      const getDropdowns = async () => {
        const data = await getEmailTypeData();
        data.length > 0 ? setEmailTypeDropdown(data) : setEmailTypeDropdown([]);
      };
      getDropdowns();
    }, []);

    useEffect(() => {
      onOpen && setTagData(tagDropdown);
    }, [onOpen]);

    useEffect(() => {
      const assigneeDropdown = async () => {
        setAssigneeDropdown(
          await getAssigneeDropdownData(
            clientId,
            Number(localStorage.getItem("workTypeId"))
          )
        );
      };
      clientId > 0 ? assigneeDropdown() : setAssigneeDropdown([]);
    }, [clientId]);

    useEffect(() => {
      const rmDropdown = async () => {
        setRMDropdown(await getGroupWiseRMDropdownData(clientId, assignee));
      };
      clientId > 0 && assignee > 0 ? rmDropdown() : setRMDropdown([]);
    }, [clientId, assignee]);

    useEffect(() => {
      if (ticketDetails) {
        setAssignee(
          !!ticketDetails.Assignee ? Number(ticketDetails.Assignee) : 0
        );
        setStatus(!!ticketDetails.Status ? Number(ticketDetails.Status) : 0);
        const option = emailBoxStatusOptions.filter((i) => {
          if (activeTabList === 3) {
            return i.value !== 1 && i.value !== 2 && i.value !== 7;
          }
          return i.value !== 1 && i.value !== 4 && i.value !== 7;
        });
        option.filter((i) => i.value === Number(ticketDetails.Status)).length <=
        0
          ? setStatusOption([
              ...option,
              ...emailBoxStatusOptions.filter(
                (i) => i.value === Number(ticketDetails.Status)
              ),
            ])
          : setStatusOption(option);
        setDueDate(
          !!ticketDetails.DueDate ? String(ticketDetails.DueDate) : ""
        );
        setEmailType(
          !!ticketDetails.EmailType ? Number(ticketDetails.EmailType) : 0
        );
        setPriority(
          !!ticketDetails.Priority ? Number(ticketDetails.Priority) : 0
        );
        setTagNames(!!ticketDetails.Tags ? ticketDetails.Tags : []);
        setTags(
          !!ticketDetails.Tags
            ? tagDropdown.filter((tag) =>
                ticketDetails.Tags.includes(tag.value)
              )
            : []
        );
        setRMUser(
          !!ticketDetails.ApprovalId ? Number(ticketDetails.ApprovalId) : 0
        );
      }
    }, [ticketDetails, activeTab]);

    const handleValueChange = () => {
      setIsSaveEnabled(true);
    };

    const handleClose = () => {
      setAssignee(0);
      setAssigneeErr(false);
      setStatus(0);
      setDueDate("");
      setEmailType(0);
      setEmailTypeErr(false);
      setPriority(0);
      setPriorityErr(false);
      setTagNames([]);
      setTags([]);
      setIsSaveEnabled(false);
      setRMUser(0);
      setRMUserErr(false);
    };

    const clearEmailDataData = async () => {
      await handleClose();
    };

    useImperativeHandle(ref, () => ({
      clearEmailDataData,
    }));

    const handleAddNewTag = () => {
      if (inputValue.trim() !== "") {
        const existingTag = tagData.find(
          (tag: { label: string; value: string }) =>
            tag.value === inputValue.trim()
        );
        if (!existingTag) {
          const newTag = { label: inputValue.trim(), value: inputValue.trim() };
          setTagData((prev: { label: string; value: string }[]) => [
            ...prev,
            newTag,
          ]);
          setTags((prev: { label: string; value: string }[]) => [
            ...prev,
            newTag,
          ]);
          setTagNames((prev: string[]) => [...prev, newTag.value]);
          handleValueChange();
        }
      }
      setInputValue("");
    };

    const checkValidation = () => {
      let isValid = true;
      if (assignee <= 0) {
        setAssigneeErr(true);
        isValid = false;
      }
      if (emailType <= 0) {
        setEmailTypeErr(true);
        isValid = false;
      }
      if (priority <= 0) {
        setPriorityErr(true);
        isValid = false;
      }
      if (rmUser <= 0) {
        setRMUserErr(true);
        isValid = false;
      }

      return isValid;
    };

    const handleSave = () => {
      if (!checkValidation()) return;

      setIsSaveEnabled(true);
      setOverlayOpen(true);

      const url = `${process.env.emailbox_api_url}/emailbox/updateticketdetails`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setIsSaveEnabled(false);
          setOverlayOpen(false);
          toast.success("Ticket details updated successfully");
          tagData.length !== tagDropdown.length && getTagDropdownData();
          getTicketDetails();
        } else {
          setIsSaveEnabled(false);
          setOverlayOpen(false);
          getTicketDetails();
        }
      };

      callAPI(
        url,
        {
          TicketId: ticketId,
          AssigneeTo: assignee > 0 ? assignee : null,
          EmailType: emailType > 0 ? emailType : null,
          Status: status > 0 ? status : null,
          Tags: tagNames.length > 0 ? tagNames : null,
          Priority: priority > 0 ? priority : null,
          RMUserId: rmUser > 0 ? rmUser : null,
        },
        successCallback,
        "post"
      );
    };

    return (
      <div className="pt-4 px-4 h-full flex flex-col">
        <div className="py-3 mb-2 h-full overflow-y-auto overflow-x-hidden flex flex-grow flex-col items-center justify-between gap-4">
          <div className="flex flex-col gap-4">
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 250 }}>
              <Autocomplete
                id="tags-standard"
                options={assigneeDropdown}
                getOptionLabel={(option: LabelValue) => option.label}
                onChange={(e, data: any) => {
                  setAssignee(data.value);
                  setAssigneeErr(false);
                  setRMUser(0);
                  handleValueChange();
                }}
                disabled={isDisabled}
                value={
                  assigneeDropdown.find(
                    (i: LabelValue) => i.value === assignee
                  ) || null
                }
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label={
                      <span>
                        Assignee
                        <span className="text-defaultRed">&nbsp;*</span>
                      </span>
                    }
                    error={assigneeErr}
                    onBlur={() => {
                      if (assignee > 0) {
                        setAssigneeErr(false);
                      }
                    }}
                    helperText={assigneeErr ? "This is a required field." : ""}
                  />
                )}
              />
            </FormControl>
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 250 }}>
              <Autocomplete
                id="tags-standard"
                options={statusOption}
                getOptionLabel={(option: LabelValue) => option.label}
                onChange={(e, data: any) => {
                  setStatus(data.value);
                  handleValueChange();
                }}
                disabled={isDisabled}
                value={
                  statusOption.find((i: LabelValue) => i.value === status) ||
                  null
                }
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label={
                      <span>
                        Status
                        <span className="text-defaultRed">&nbsp;*</span>
                      </span>
                    }
                  />
                )}
              />
            </FormControl>
            <div
              className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[250px]`}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Due Date"
                  // shouldDisableDate={isWeekend}
                  //   minDate={dayjs(startDate)}
                  //   maxDate={dayjs(Date.now())}
                  disabled
                  value={dueDate === "" ? null : dayjs(dueDate)}
                  onChange={(newValue: any) => {
                    setDueDate(newValue);
                    handleValueChange();
                  }}
                  slotProps={{
                    textField: {
                      readOnly: true,
                    } as Record<string, any>,
                  }}
                />
              </LocalizationProvider>
            </div>
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 250 }}>
              <Autocomplete
                id="tags-standard"
                options={emailTypeDropdown}
                getOptionLabel={(option: LabelValue) => option.label}
                onChange={(e, data: any) => {
                  setEmailType(data.value);
                  setEmailTypeErr(false);
                  handleValueChange();
                }}
                disabled={isDisabled}
                value={
                  (emailTypeDropdown.length > 0 &&
                    emailTypeDropdown.find(
                      (i: LabelValue) => i.value === emailType
                    )) ||
                  null
                }
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label={
                      <span>
                        Email Type
                        <span className="text-defaultRed">&nbsp;*</span>
                      </span>
                    }
                    error={emailTypeErr}
                    onBlur={() => {
                      if (emailType > 0) {
                        setEmailTypeErr(false);
                      }
                    }}
                    helperText={emailTypeErr ? "This is a required field." : ""}
                  />
                )}
              />
            </FormControl>
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 250 }}>
              <Autocomplete
                id="tags-standard"
                options={priorityOptions}
                getOptionLabel={(option: LabelValue) => option.label}
                onChange={(e, data: any) => {
                  setPriority(data.value);
                  setPriorityErr(false);
                  handleValueChange();
                }}
                disabled={isDisabled}
                value={
                  priorityOptions.find(
                    (i: LabelValue) => i.value === priority
                  ) || null
                }
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label={
                      <span>
                        Priority
                        <span className="text-defaultRed">&nbsp;*</span>
                      </span>
                    }
                    error={priorityErr}
                    onBlur={() => {
                      if (priority > 0) {
                        setPriorityErr(false);
                      }
                    }}
                    helperText={priorityErr ? "This is a required field." : ""}
                  />
                )}
              />
            </FormControl>
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 250 }}>
              <Autocomplete
                multiple
                id="tags-standard"
                options={tagData}
                getOptionLabel={(option: { label: string; value: string }) =>
                  option.label
                }
                onChange={(e, data: { label: string; value: string }[]) => {
                  setTags(data);
                  setTagNames(
                    data.map((d: { label: string; value: string }) => d.value)
                  );
                  handleValueChange();
                }}
                disabled={isDisabled}
                onInputChange={(e, value) => {
                  if (value.trim().length <= 25) {
                    setInputValue(value);
                  }
                }}
                inputValue={inputValue}
                value={tags}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNewTag();
                      }
                    }}
                  />
                )}
              />
            </FormControl>
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 250 }}>
              <Autocomplete
                id="tags-standard"
                options={rmDropdown}
                getOptionLabel={(option: LabelValue) => option.label}
                onChange={(e, data: any) => {
                  setRMUser(data.value);
                  setRMUserErr(false);
                  handleValueChange();
                }}
                disabled={isDisabled}
                value={
                  rmDropdown.find((i: LabelValue) => i.value === rmUser) || null
                }
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label={
                      <span>
                        Reporting Manager
                        <span className="text-defaultRed">&nbsp;*</span>
                      </span>
                    }
                    error={rmUserErr}
                    onBlur={() => {
                      if (rmUser > 0) {
                        setRMUserErr(false);
                      }
                    }}
                    helperText={rmUserErr ? "This is a required field." : ""}
                  />
                )}
              />
            </FormControl>
          </div>
        </div>
        <div className="sticky bottom-2">
          <Button
            variant="contained"
            className={`rounded-[4px] !h-[36px] w-full ${
              isSaveEnabled
                ? "!bg-secondary cursor-pointer"
                : "!cursor-not-allowed"
            }`}
            disabled={!isSaveEnabled}
            onClick={() => handleSave()}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }
);

export default EmailData;
