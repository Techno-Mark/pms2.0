import { Button, TextField, Autocomplete, FormLabel } from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";
import RichTextEditor from "@/components/common/RichTextEditor";
import { getTextLength } from "@/utils/commonFunction";

export interface SLAPolicyContenRef {
  clearSLAPolicyData: () => void;
}

const SLAContent = forwardRef<
  SLAPolicyContenRef,
  {
    onEdit: number;
    onOpen: boolean;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
    clientDropdown?: LabelValue[];
    businessHoursDropdown?: LabelValue[];
  }
>(
  (
    {
      onClose,
      onOpen,
      onEdit,
      onDataFetch,
      onChangeLoader,
      clientDropdown,
      businessHoursDropdown,
    },
    ref
  ) => {
    const [businessHours, setBusinessHours] = useState(0);
    const [businessHoursError, setBusinessHoursError] = useState(false);
    const [clients, setClients] = useState<LabelValue[]>([]);
    const [clientName, setClientName] = useState<number[]>([]);
    const [clientError, setClientError] = useState(false);
    const [slaName, setSLAName] = useState("");
    const [slaNameErr, setSLANameErr] = useState(false);
    const [description, setDescription] = useState("");
    const [descriptionErr, setDescriptionErr] = useState(false);
    const [text, setText] = useState("");
    const [textError, setTextError] = useState(false);

    const fetchEditData = async () => {
      if (onEdit > 0) {
        const params = { Id: onEdit || 0 };
        const url = `${process.env.pms_api_url}/sla/customSLA/getbyid`;
        const successCallback = (
          ResponseData: {
            ClientJson: string;
            Id: number;
            Name: string;
            ClientIds: number[];
            Subject: string;
            EmailContent: string;
            BusinessHourId: number;
            Description: string;
          },
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            setClients(
              ResponseData.ClientIds.length <= 0 ||
                ResponseData.ClientIds.length === null
                ? []
                : clientDropdown
                ? clientDropdown.filter((dept: LabelValue) =>
                    ResponseData.ClientIds.includes(dept.value)
                  )
                : []
            );
            setClientName(
              !!ResponseData.ClientIds ? ResponseData.ClientIds : []
            );
            setSLAName(ResponseData.Name);
            setBusinessHours(ResponseData.BusinessHourId);
            setDescription(ResponseData.Description);
            setText(ResponseData.EmailContent);
          } else {
            clearData();
          }
        };
        callAPI(url, params, successCallback, "POST");
      } else {
        clearData();
      }
    };

    useEffect(() => {
      onOpen && onEdit > 0 && fetchEditData();
    }, [onEdit, onOpen]);

    const clearData = () => {
      setBusinessHours(0);
      setBusinessHoursError(false);
      setClients([]);
      setClientName([]);
      setClientError(false);
      setSLAName("");
      setSLANameErr(false);
      setDescription("");
      setDescriptionErr(false);
      setText("");
      setTextError(false);
    };

    const clearSLAPolicyData = async () => {
      await clearData();
    };

    useImperativeHandle(ref, () => ({
      clearSLAPolicyData,
    }));

    const validateSLAName = () => {
      const trimmedSLAName = slaName.trim();

      if (trimmedSLAName.length === 0) {
        setSLANameErr(true);
        return false;
      }

      setSLANameErr(false);
      return true;
    };

    const handleSubmit = async (close: boolean) => {
      setClientError(clientName.length <= 0);
      setBusinessHoursError(businessHours <= 0);
      setTextError(
        getTextLength(text.trim()) <= 0 || getTextLength(text.trim()) > 5000
      );
      setDescriptionErr(description.trim().length > 500);
      const isSLANameValid = validateSLAName();

      if (
        businessHoursError ||
        businessHours <= 0 ||
        clientError ||
        clientName.length <= 0 ||
        !isSLANameValid ||
        textError ||
        getTextLength(text.trim()) <= 0 ||
        getTextLength(text.trim()) > 5000 ||
        description.trim().length > 500
      )
        return;

      onChangeLoader(true);
      const params = {
        Id: onEdit > 0 ? onEdit : 0,
        Name: slaName.trim(),
        ClientIds: clientName,
        EmailContent: text.trim(),
        BusinessHourId: businessHours,
        Description: description.trim(),
      };
      const url = `${process.env.pms_api_url}/sla/customSLA/save`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          onDataFetch?.();
          onChangeLoader(false);
          close && onClose();
          clearData();
          toast.success(
            `${onEdit > 0 ? "" : "New"} SLA Policy has been ${
              onEdit > 0 ? "Updated" : "saved"
            } successfully.`
          );
        } else {
          onChangeLoader(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    return (
      <>
        <div className="flex gap-[20px] flex-col px-[20px] pb-[10px] max-h-[73vh] overflow-y-auto">
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            sx={{ mt: "15px" }}
            options={businessHoursDropdown ? businessHoursDropdown : []}
            value={
              (businessHoursDropdown &&
                businessHoursDropdown.find(
                  (i: LabelValue) => i.value === businessHours
                )) ||
              null
            }
            onChange={(e, value: LabelValue | null) => {
              value && setBusinessHours(value.value);
              value && setBusinessHoursError(false);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label={
                  <span>
                    Business Hours Template
                    <span className="text-defaultRed">&nbsp;*</span>
                  </span>
                }
                placeholder="Please Select Business Hours Template"
                error={businessHoursError}
                onBlur={() => {
                  if (businessHours > 0) {
                    setBusinessHoursError(false);
                  }
                }}
                helperText={
                  businessHoursError
                    ? "Business Hours Template is required."
                    : ""
                }
              />
            )}
          />
          <Autocomplete
            multiple
            id="tags-standard"
            options={clientDropdown ? clientDropdown : []}
            getOptionLabel={(option: LabelValue) => option.label}
            onChange={(e, data: LabelValue[]) => {
              setClients(data);
              setClientName(data.map((d: LabelValue) => d.value));
              setClientError(false);
            }}
            value={clients}
            onBlur={() => {
              if (clientName.length <= 0) {
                setClientError(true);
              }
            }}
            renderInput={(params: any) => (
              <TextField
                {...params}
                variant="standard"
                label={
                  <span>
                    Client
                    <span className="!text-defaultRed">&nbsp;*</span>
                  </span>
                }
                error={clientError}
                helperText={clientError ? "This is a required field." : ""}
              />
            )}
          />
          <TextField
            label={
              <span>
                SLA Name
                <span className="!text-defaultRed">&nbsp;*</span>
              </span>
            }
            fullWidth
            className="-mt-1"
            value={slaName}
            onChange={(e) => {
              setSLAName(e.target.value);
              setSLANameErr(false);
            }}
            onBlur={validateSLAName}
            error={slaNameErr}
            helperText={slaNameErr ? "SLA Name is required." : ""}
            margin="normal"
            variant="standard"
          />
          <TextField
            label="Description"
            fullWidth
            className="-mt-1"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDescriptionErr(false);
            }}
            onBlur={() => {
              if (description.trim().length > 500) {
                setDescriptionErr(true);
              }
            }}
            error={descriptionErr}
            helperText={
              descriptionErr ? "Description cannot exceed 500 characters." : ""
            }
            margin="normal"
            variant="standard"
          />
          <FormLabel
            id="demo-radio-buttons-group-label"
            className="mt-2 text-lg text-black"
          >
            Set Default SLA Target:
          </FormLabel>
          <FormLabel id="demo-radio-buttons-group-label mt-2">
            If Email Ticket Received from the client, then Response Should be
            Immediately with
          </FormLabel>
          <FormLabel
            id="demo-radio-buttons-group-label"
            className="text-black my-2"
          >
            First Response
          </FormLabel>
          <RichTextEditor
            text={text}
            setText={setText}
            textError={textError}
            setTextError={setTextError}
          />
        </div>

        <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
          <Button
            variant="outlined"
            className="rounded-[4px] !h-[36px] !text-secondary"
            onClick={() => {
              clearData();
              onClose();
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary"
            onClick={() => handleSubmit(true)}
          >
            {onEdit > 0 ? "Save" : "Create SLA Policy"}
          </Button>
        </div>
      </>
    );
  }
);

export default SLAContent;
