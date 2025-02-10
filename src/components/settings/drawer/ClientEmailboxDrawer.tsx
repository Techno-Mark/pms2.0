import React, { useEffect, useState } from "react";
import { Button, IconButton, TextField, Tooltip } from "@mui/material";
import { Close } from "@mui/icons-material";
import OverLay from "@/components/common/OverLay";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";

interface ClientEmailboxDrawerProps {
  onOpen: boolean;
  onClose: () => void;
  selectedRowId: number | null;
}

const ClientEmailboxDrawer: React.FC<ClientEmailboxDrawerProps> = ({
  onOpen,
  onClose,
  selectedRowId,
}) => {
  const [isLoadingClientFields, setIsLoadingClientFields] = useState(false);
  const [id, setId] = useState<number>(0);
  const [clientDomains, setClientDomains] = useState<string>("");
  const [customEmails, setCustomEmails] = useState<string>("");
  const [errors, setErrors] = useState<{ domains?: string; emails?: string }>({
    domains: undefined,
    emails: undefined,
  });

  const getEmailTypeData = async () => {
    const params = {
      ClientId: selectedRowId || 0,
    };
    const url = `${process.env.pms_api_url}/client/getticketclientrule`;
    const successCallback = (
      ResponseData: {
        EmailString: string;
        DomainString: string;
        Id: number;
        Domain: [];
        Emails: [];
        ClientId: number;
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setId(ResponseData.Id);
        setClientDomains(ResponseData.Domain.join(","));
        setCustomEmails(ResponseData.Emails.join(","));
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    if (onOpen) {
      getEmailTypeData();
    }
  }, [onOpen]);

  const validateDomains = (domains: string[]): string | null => {
    const domainPattern = /^[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})$/;
    const uniqueDomains = new Set(domains);

    if (uniqueDomains.size !== domains.length) {
      return "Duplicate domains are not allowed. Please remove duplicates and try again.";
    }

    for (const domain of domains) {
      if (
        !domainPattern.test(domain) ||
        (domain.match(/\./g) || []).length !== 1
      ) {
        return "Please enter a valid domain format (e.g., example.com) with only one dot.";
      }
    }
    return null;
  };

  const validateEmails = (emails: string[]): string | null => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const uniqueEmails = new Set(emails);

    if (uniqueEmails.size !== emails.length) {
      return "Duplicate email addresses are not allowed. Please remove duplicates and try again.";
    }

    for (const email of emails) {
      if (!emailPattern.test(email)) {
        return "Please enter a valid email format (e.g., email@example.com).";
      }
    }
    return null;
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientDomains(e.target.value);
    setErrors((prev) => ({ emails: undefined, domains: undefined }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEmails(e.target.value);
    setErrors((prev) => ({ emails: undefined, domains: undefined }));
  };

  const handleSubmit = () => {
    const domains = clientDomains
      .split(",")
      .map((domain) => domain.trim())
      .filter((domain) => domain.length > 0);

    const emails = customEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    const domainError = domains.length > 0 ? validateDomains(domains) : null;
    const emailError = emails.length > 0 ? validateEmails(emails) : null;

    // Check if at least one field is filled
    if (domains.length === 0 && emails.length === 0) {
      setErrors({
        domains: "Either domains or emails must be provided.",
        emails: "Either domains or emails must be provided.",
      });
      return;
    }

    setErrors({
      domains: domainError || undefined,
      emails: emailError || undefined,
    });

    if (domainError || emailError) {
      return;
    }

    setIsLoadingClientFields(true);
    const params = {
      Id: id,
      Domain: domains,
      Emails: emails,
      ClientId: selectedRowId,
    };
    const url = `${process.env.pms_api_url}/client/saveticketclientrule`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setIsLoadingClientFields(false);
        handleClose();
        toast.success(`Client Email Updated successfully.`);
      } else {
        setIsLoadingClientFields(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleClose = () => {
    setClientDomains("");
    setCustomEmails("");
    setErrors({
      domains: undefined,
      emails: undefined,
    });
    onClose();
  };

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-30 h-screen overflow-y-auto w-[30%] border border-lightSilver bg-pureWhite transform ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex p-[20px] justify-between items-center bg-whiteSmoke border-b border-lightSilver">
          <span className="text-pureBlack text-lg font-medium">
            Add Client Email Box Details
          </span>
          <Tooltip title="Close" placement="left" arrow>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Tooltip>
        </div>

        <div className="flex gap-1 mt-4 flex-col px-[20px] pb-[50px] max-h-[73vh] overflow-y-auto">
          <TextField
            label={
              <span>
                Client Domain(s)
                {/* <span className="!text-defaultRed">&nbsp;*</span> */}
              </span>
            }
            fullWidth
            value={clientDomains}
            onChange={handleDomainChange}
            placeholder="e.g., example.com, test.com"
            error={!!errors.domains}
            helperText={errors.domains}
            margin="normal"
            variant="standard"
          />

          <TextField
            label={
              <span>
                Client Custom Email(s)
                {/* <span className="!text-defaultRed">&nbsp;*</span> */}
              </span>
            }
            fullWidth
            value={customEmails}
            onChange={handleEmailChange}
            placeholder="e.g., email1@example.com, email2@test.com"
            error={!!errors.emails}
            helperText={errors.emails}
            margin="normal"
            variant="standard"
          />
        </div>

        <div className="flex justify-end fixed w-full bottom-0 gap-[1px] px-[1px] py-[15px] bg-pureWhite border-t border-lightSilver">
          <Button
            variant="outlined"
            className="rounded-[4px] !h-[36px] !text-secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
            onClick={handleSubmit}
          >
            Add Client Email
          </Button>
        </div>
      </div>
      {isLoadingClientFields && <OverLay />}
    </>
  );
};

export default ClientEmailboxDrawer;
