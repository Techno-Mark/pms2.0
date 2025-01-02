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
import RicheTextEditor from "@/components/common/RicheTextEditor";

export interface EmailNotificationContenRef {
  clearEmailNotificationData: () => void;
}

const EmailNotificationContent = forwardRef<
  EmailNotificationContenRef,
  {
    onEdit: number;
    onOpen: boolean;
    onClose: () => void;
    tab: string;
    onDataFetch: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
  }
>(({ onClose, onOpen, onEdit, tab, onDataFetch, onChangeLoader }, ref) => {
  const moduleDropdown = [
    { label: "PMS", value: 1 },
    { label: "Email Box", value: 2 },
  ];
  const [moduleName, setModuleName] = useState(0);
  const [moduleNameError, setModuleNameError] = useState(false);
  const [emailNotificationName, setEmailNotificationName] = useState("");
  const [emailNotificationNameErr, setEmailNotificationNameErr] =
    useState(false);
  const [description, setDescription] = useState("");
  const [descriptionErr, setDescriptionErr] = useState(false);
  const [subject, setSubject] = useState("");
  const [subjectErr, setSubjectErr] = useState(false);
  const [text, setText] = useState("");
  const [textError, setTextError] = useState(false);

  const fetchEditData = async () => {
    if (onEdit > 0) {
      const params = { Id: onEdit || 0 };
      const url = `${process.env.pms_api_url}/emailnotification/getbyid`;
      const successCallback = (
        ResponseData: {
          Id: number;
          Module: number;
          TemplateName: string;
          Description: string;
          Subject: string;
          EmailBody: string;
        },
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setEmailNotificationName(ResponseData.TemplateName);
          setModuleName(ResponseData.Module);
          setDescription(ResponseData.Description);
          setSubject(ResponseData.Subject);
          setText(ResponseData.EmailBody);
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
    setModuleName(0);
    setModuleNameError(false);
    setEmailNotificationName("");
    setEmailNotificationNameErr(false);
    setDescription("");
    setDescriptionErr(false);
    setText("");
    setTextError(false);
  };

  const clearEmailNotificationData = async () => {
    await clearData();
  };

  useImperativeHandle(ref, () => ({
    clearEmailNotificationData,
  }));

  const validateEmailNotificationName = () => {
    const trimmedEmailNotificationName = emailNotificationName.trim();

    if (
      trimmedEmailNotificationName.length === 0 ||
      trimmedEmailNotificationName.trim().length > 100
    ) {
      setEmailNotificationNameErr(true);
      return false;
    }

    setEmailNotificationNameErr(false);
    return true;
  };

  const validateText = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    if (!doc.body || !doc.body.childNodes.length) {
      return false;
    }

    const allSpacesOrEmpty = Array.from(doc.body.childNodes).every(
      (node: any) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent.trim() === "";
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const directText = Array.from(node.childNodes)
            .filter((child: any) => child.nodeType === Node.TEXT_NODE)
            .map((child: any) => child.textContent.trim())
            .join("");
          return directText === "" && !node.textContent.trim();
        }
        return true;
      }
    );

    return !allSpacesOrEmpty;
  };

  const handleSubmit = async (close: boolean) => {
    setModuleNameError(moduleName <= 0);
    setTextError(
      text.trim().length <= 0 || text.trim().length > 5000 || !validateText()
    );
    setDescriptionErr(
      description.trim().length < 5 || description.trim().length > 500
    );
    setSubjectErr(subject.trim().length <= 0 || subject.trim().length > 500);
    const isEmailNotificationValid = validateEmailNotificationName();

    if (
      moduleNameError ||
      moduleName <= 0 ||
      !isEmailNotificationValid ||
      textError ||
      text.trim().length <= 0 ||
      text.trim().length > 5000 ||
      !validateText() ||
      description.trim().length < 5 ||
      description.trim().length > 500 ||
      subject.trim().length <= 0 ||
      subject.trim().length > 500
    )
      return;

    onChangeLoader(true);
    const params = {
      Id: onEdit > 0 ? onEdit : 0,
      Module: moduleName,
      TemplateName: emailNotificationName.trim(),
      EmailBody: text.trim(),
      Description: description.trim(),
      Subject: subject.trim(),
    };
    const url = `${process.env.pms_api_url}/emailnotification/save`;
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
          `${onEdit > 0 ? "" : "New"} ${tab} has been ${
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
          options={moduleDropdown}
          value={
            moduleDropdown.find((i: LabelValue) => i.value === moduleName) ||
            null
          }
          onChange={(e, value: LabelValue | null) => {
            value && setModuleName(value.value);
            value && setModuleNameError(false);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label={
                <span>
                  Module Name
                  <span className="text-defaultRed">&nbsp;*</span>
                </span>
              }
              placeholder="Please Select Module Name"
              error={moduleNameError}
              onBlur={() => {
                if (moduleName > 0) {
                  setModuleNameError(false);
                }
              }}
              helperText={moduleNameError ? "Module Name is required." : ""}
            />
          )}
        />
        <TextField
          label={
            <span>
              Email Notification Name
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="-mt-1"
          value={emailNotificationName}
          onChange={(e) => {
            setEmailNotificationName(e.target.value);
            setEmailNotificationNameErr(false);
          }}
          onBlur={validateEmailNotificationName}
          error={emailNotificationNameErr}
          helperText={
            emailNotificationNameErr &&
            emailNotificationName.trim().length > 100
              ? "Email Notification Name cannot exceed 100 characters."
              : emailNotificationNameErr
              ? "Email Notification Name is required."
              : ""
          }
          margin="normal"
          variant="standard"
        />
        <TextField
          label={
            <span>
              Description
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="-mt-1"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setDescriptionErr(false);
          }}
          onBlur={() => {
            if (
              description.trim().length < 5 ||
              description.trim().length > 500
            ) {
              setDescriptionErr(true);
            }
          }}
          error={descriptionErr}
          helperText={
            descriptionErr && description.trim().length > 500
              ? "Description cannot exceed 500 characters."
              : descriptionErr &&
                description.trim().length > 0 &&
                description.trim().length < 5
              ? "Minimum 5 characters required."
              : descriptionErr
              ? "Description is required."
              : ""
          }
          margin="normal"
          variant="standard"
        />
        <TextField
          label={
            <span>
              Subject
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="-mt-1"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setSubjectErr(false);
          }}
          onBlur={() => {
            if (subject.trim().length <= 0 || subject.trim().length > 500) {
              setSubjectErr(true);
            }
          }}
          error={subjectErr}
          helperText={
            subjectErr && subject.trim().length > 500
              ? "Subject cannot exceed 500 characters."
              : subjectErr
              ? "Subject is required."
              : ""
          }
          margin="normal"
          variant="standard"
        />
        <FormLabel
          id="demo-radio-buttons-group-label"
          className="text-black my-2"
        >
          Notification (Email Body)
        </FormLabel>
        <RicheTextEditor
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
          Save
        </Button>
      </div>
    </>
  );
});

export default EmailNotificationContent;
