import { Button, TextField } from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";

export interface BlackListContentRef {
  BlackListDataValue: () => void;
}

const BlackListContent = forwardRef<
  BlackListContentRef,
  {
    onEdit: number;
    onOpen: boolean;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
  }
>(({ onEdit, onOpen, onClose, onDataFetch, onChangeLoader }, ref) => {
  const [clientDomains, setClientDomains] = useState("");
  const [customEmails, setCustomEmails] = useState("");
  const [errors, setErrors] = useState({ domains: "", emails: "" });

  const clearData = () => {
    setClientDomains("");
    setCustomEmails("");
    setErrors({ domains: "", emails: "" });
  };

  const fetchEditData = async () => {
    if (onEdit > 0) {
      const params = { Id: onEdit || 0 };
      const url = `${process.env.emailbox_api_url}/emailbox/getBlacklistEntryById`;
      const successCallback = (
        ResponseData: {
          Id: number;
          Value: string;
          Type: number;
          TypeName: string;
          OrganizationId: number;
          OrganizationName: string;
        },
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          if (ResponseData.Type === 1) {
            setClientDomains(ResponseData.Value);
          } else if (ResponseData.Type === 2) {
            setCustomEmails(ResponseData.Value);
          }
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

  const validateDomain = (domainString: string) => {
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domainString.trim());
  };

  const validateEmails = (emailString: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailString.trim());
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { domains: "", emails: "" };

    if (!clientDomains && !customEmails) {
      newErrors.domains = "Either domain or email is required.";
      newErrors.emails = "Either domain or email is required.";
      isValid = false;
    } else if (clientDomains) {
      if (!validateDomain(clientDomains)) {
        newErrors.domains = "Enter a valid domain.";
        isValid = false;
      }
    } else if (customEmails) {
      if (!validateEmails(customEmails)) {
        newErrors.emails = "Enter a valid email.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const BlackListDataValue = async () => {
    await clearData();
  };

  useImperativeHandle(ref, () => ({
    BlackListDataValue,
  }));

  const handleSubmit = async (close: boolean) => {
    if (!validateInputs()) return;

    onChangeLoader(true);

    const params = {
      Id: onEdit > 0 ? onEdit : 0,
      Value: clientDomains ? clientDomains : customEmails,
      Type: clientDomains ? 1 : 2,
    };

    const url = `${process.env.emailbox_api_url}/emailbox/upsertBlacklistEntry`;
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
          `${onEdit > 0 ? "" : "New"} Email Template ${
            onEdit > 0 ? "Updated" : "added"
          } successfully.`
        );
      } else {
        onChangeLoader(false);
      }
    };

    callAPI(url, params, successCallback, "POST");
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientDomains(e.target.value);
    if (e.target.value.trim()) {
      setCustomEmails("");
      setErrors({ domains: "", emails: "" });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEmails(e.target.value);
    if (e.target.value) {
      setClientDomains("");
      setErrors({ domains: "", emails: "" });
    }
  };

  return (
    <>
      <div className="flex flex-col px-[20px] pb-[10px] max-h-[73.5vh] overflow-y-auto">
        <TextField
          label={<span>Domain</span>}
          fullWidth
          value={clientDomains}
          onChange={handleDomainChange}
          placeholder="e.g., example.com"
          error={!!errors.domains}
          helperText={errors.domains}
          margin="normal"
          variant="standard"
          disabled={!!customEmails}
        />

        <TextField
          label={<span>Custom Email</span>}
          fullWidth
          value={customEmails}
          onChange={handleEmailChange}
          placeholder="e.g., email1@example.com"
          error={!!errors.emails}
          helperText={errors.emails}
          margin="normal"
          variant="standard"
          disabled={!!clientDomains}
        />
      </div>

      <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
        {onEdit > 0 ? (
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
        ) : (
          <Button
            type="button"
            variant="outlined"
            className="rounded-[4px] !h-[36px] !text-secondary cursor-pointer"
            onClick={() => handleSubmit(false)}
          >
            Add More
          </Button>
        )}
        <Button
          variant="contained"
          className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary"
          onClick={() => handleSubmit(true)}
        >
          {onEdit > 0 ? "Save" : "Add Black List Email"}
        </Button>
      </div>
    </>
  );
});

export default BlackListContent;
