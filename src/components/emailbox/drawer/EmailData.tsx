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
    },
    ref
  ) => {
    const [assignee, setAssignee] = useState<number>(0);
    const [assigneeDropdown, setAssigneeDropdown] = useState<LabelValue[]>([]);
    const [status, setStatus] = useState<number>(0);
    const [dueDate, setDueDate] = useState<string>("");
    const [emailType, setEmailType] = useState<number>(0);
    const [emailTypeDropdown, setEmailTypeDropdown] = useState<LabelValue[]>(
      []
    );
    const [priority, setPriority] = useState<number>(0);
    const [tagNames, setTagNames] = useState<string[]>([]);
    const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [tagDropdown, setTagDropdown] = useState<
      { label: string; value: string }[]
    >([]);
    const [rmUser, setRMUser] = useState<number>(0);
    const [rmDropdown, setRMDropdown] = useState<LabelValue[]>([]);
    const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);

    const tagDropdowns = async () => {
      setTagDropdown(await getTagData());
    };

    useEffect(() => {
      const getDropdowns = async () => {
        setEmailTypeDropdown(await getEmailTypeData());
        tagDropdowns();
      };
      getDropdowns();
    }, []);

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
      setStatus(0);
      setDueDate("");
      setEmailType(0);
      setPriority(0);
      setTagNames([]);
      setTags([]);
      setIsSaveEnabled(false);
      setRMUser(0);
      // tagDropdowns();
    };

    const clearEmailDataData = async () => {
      await handleClose();
    };

    useImperativeHandle(ref, () => ({
      clearEmailDataData,
    }));

    const handleAddNewTag = () => {
      if (inputValue.trim() !== "") {
        const existingTag = tagDropdown.find(
          (tag: { label: string; value: string }) => tag.value === inputValue
        );
        if (!existingTag) {
          const newTag = { label: inputValue, value: inputValue };
          setTagDropdown((prev: { label: string; value: string }[]) => [
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

    const handleSave = () => {
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
          getTicketDetails();
        } else {
          setIsSaveEnabled(false);
          setOverlayOpen(false);
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
                onChange={(e, data: LabelValue | null) => {
                  !!data && setAssignee(data.value);
                  setRMUser(0);
                  handleValueChange();
                }}
                value={
                  assigneeDropdown.find(
                    (i: LabelValue) => i.value === assignee
                  ) || null
                }
                renderInput={(params: any) => (
                  <TextField {...params} variant="standard" label="Assignee" />
                )}
              />
            </FormControl>
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 250 }}>
              <Autocomplete
                id="tags-standard"
                options={emailBoxStatusOptions}
                getOptionLabel={(option: LabelValue) => option.label}
                onChange={(e, data: LabelValue | null) => {
                  !!data && setStatus(data.value);
                  handleValueChange();
                }}
                value={
                  emailBoxStatusOptions.find(
                    (i: LabelValue) => i.value === status
                  ) || null
                }
                renderInput={(params: any) => (
                  <TextField {...params} variant="standard" label="Status" />
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
                onChange={(e, data: LabelValue | null) => {
                  !!data && setEmailType(data.value);
                  handleValueChange();
                }}
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
                    label="Email Type"
                  />
                )}
              />
            </FormControl>
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 250 }}>
              <Autocomplete
                id="tags-standard"
                options={priorityOptions}
                getOptionLabel={(option: LabelValue) => option.label}
                onChange={(e, data: LabelValue | null) => {
                  !!data && setPriority(data.value);
                  handleValueChange();
                }}
                value={
                  priorityOptions.find(
                    (i: LabelValue) => i.value === priority
                  ) || null
                }
                renderInput={(params: any) => (
                  <TextField {...params} variant="standard" label="Priority" />
                )}
              />
            </FormControl>
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 250 }}>
              <Autocomplete
                multiple
                id="tags-standard"
                options={tagDropdown}
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
                onInputChange={(e, value) => setInputValue(value)}
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
                onChange={(e, data: LabelValue | null) => {
                  !!data && setRMUser(data.value);
                  handleValueChange();
                }}
                value={
                  rmDropdown.find((i: LabelValue) => i.value === rmUser) || null
                }
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
