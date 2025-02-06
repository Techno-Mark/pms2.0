import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import OverLay from "@/components/common/OverLay";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";
import { Close } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface emailTemplateDrawerProps {
  onOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  clientId: number;
  assigneeId: number;
  ticketId: number;
  getConversationData: () => void;
  setText: any;
}

interface emailTemplateData {
  Id: number;
  Title: string;
  Content: string;
}

const EmailTemplateDrawer: React.FC<emailTemplateDrawerProps> = ({
  onOpen,
  onClose,
  onReset,
  clientId,
  assigneeId,
  ticketId,
  getConversationData,
  setText,
}) => {
  const [emailTypeOption, setEmailTypeOption] = useState<LabelValue[]>([]);
  const [emailType, setEmailType] = useState(0);
  const [emailTemplateData, setEmailTemplateData] = useState<
    emailTemplateData[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [activeTemplateDrawer, setActiveTemplateDrawer] = useState<number[]>(
    []
  );

  const getEmailType = () => {
    const url = `${process.env.emailbox_api_url}/emailbox/getemailtypebyclient`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setEmailTypeOption(ResponseData);
      } else {
        setEmailTypeOption([]);
      }
    };

    callAPI(
      url,
      {
        AssignTo: assigneeId,
        ClientId: clientId,
      },
      successCallback,
      "post"
    );
  };

  useEffect(() => {
    onOpen && getEmailType();
  }, [onOpen]);

  const getEmailTemplate = (id: number) => {
    setLoading(true);
    const url = `${process.env.emailbox_api_url}/emailbox/getemailtemplatebytype`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setEmailTemplateData(ResponseData);
        setLoading(false);
      } else {
        setEmailTemplateData([]);
        setLoading(false);
      }
    };

    callAPI(
      url,
      {
        EmailTypeIds: [id],
      },
      successCallback,
      "post"
    );
  };

  const handleSubmit = () => {
    if(activeTemplate===0) return toast.warning("Please select atleast one email template.")
    setLoading(true);
    const url = `${process.env.emailbox_api_url}/emailbox/getemailcontent`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setText(ResponseData);
        setLoading(false);
        handleClose(false);
      } else {
        setLoading(false);
      }
    };

    callAPI(
      url,
      {
        TemplateId: activeTemplate,
        TicketId: ticketId,
      },
      successCallback,
      "post"
    );
  };

  const handleClose = (IsReset: boolean) => {
    setEmailType(0);
    setEmailTemplateData([]);
    setActiveTemplate(0);
    setActiveTemplateDrawer([]);
    onClose();
    IsReset && onReset();
  };

  return (
    <div
      className={`fixed top-0 right-0 z-30 h-screen w-[650px] border border-lightSilver bg-pureWhite transform ${
        onOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between p-4 bg-gray-100">
        <div className="flex items-center">Email Template</div>
        <Tooltip title="Close" placement="top" arrow>
          <IconButton className="mr-[4px]" onClick={() => handleClose(true)}>
            <Close />
          </IconButton>
        </Tooltip>
      </div>
      <Autocomplete
        id="tags-standard"
        className="px-10 pt-4 pb-10 border-b border-gray-400"
        options={emailTypeOption}
        getOptionLabel={(option: LabelValue) => option.label}
        onChange={(e, data: any) => {
          setEmailType(data.value);
          getEmailTemplate(data.value);
          setActiveTemplate(0);
        }}
        value={
          emailTypeOption.find((i: LabelValue) => i.value === emailType) || null
        }
        renderInput={(params: any) => (
          <TextField {...params} variant="standard" label="Email Type" />
        )}
      />
      {emailTemplateData.length > 0 && (
        <div className="py-4 flex flex-col items-center justify-center gap-4 px-10 w-full text-darkCharcoal">
          {emailTemplateData.map((i: emailTemplateData) => (
            <div
              className={`border ${
                activeTemplate === i.Id ? "border-secondary" : "border-gray-300"
              } rounded-lg w-full`}
              key={i.Id}
              onClick={() => setActiveTemplate(i.Id)} // Works correctly now
            >
              <p
                className={`${
                  activeTemplateDrawer.includes(i.Id)
                    ? "border-b pb-2 border-gray-300"
                    : ""
                } px-4 flex gap-4 py-4`}
              >
                <span
                  className={`cursor-pointer ${
                    activeTemplateDrawer.includes(i.Id) ? "rotate-180" : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation(); // Prevents parent div's onClick from firing
                    setActiveTemplateDrawer((prev) =>
                      prev.includes(i.Id)
                        ? prev.filter((id) => id !== i.Id)
                        : [...prev, i.Id]
                    );
                  }}
                >
                  <ChevronDownIcon />
                </span>
                <span>{i.Title}</span>
              </p>
              {activeTemplateDrawer.includes(i.Id) && (
                <p
                  className="px-4 py-4 !break-all w-full [&>*]:w-full [&>font>pre]:w-full pretag"
                  dangerouslySetInnerHTML={{
                    __html: i.Content,
                  }}
                  style={{
                    wordBreak: "break-all",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
        <Button
          variant="outlined"
          color="error"
          className="rounded-[4px] !h-[36px]"
          onClick={() => handleClose(true)}
        >
          Close
        </Button>
        <Button
          variant="contained"
          className={`rounded-[4px] !h-[36px] !mx-6 !bg-secondary`}
          onClick={() => handleSubmit()}
        >
          Apply
        </Button>
      </div>
      {loading ? <OverLay className="!-top-[1px] !-left-[1px]" /> : ""}
    </div>
  );
};

export default EmailTemplateDrawer;
