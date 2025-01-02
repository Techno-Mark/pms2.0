import {
  Button,
  TextField,
  Chip,
  Autocomplete,
  FormLabel,
} from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";
import { getDeptData, getEmailTypeData } from "@/utils/commonDropdownApiCall";
import RicheTextEditor from "@/components/common/RicheTextEditor";

export interface EmailTemplateContentRef {
  EmailTemplateDataValue: () => void;
}

const EmailTemplateContent = forwardRef<
  EmailTemplateContentRef,
  {
    onEdit: number;
    onOpen: boolean;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
    departmentDropdown: LabelValue[];
    emailTypeDropdown: LabelValue[];
  }
>(
  (
    {
      onEdit,
      onOpen,
      onClose,
      onDataFetch,
      onChangeLoader,
      departmentDropdown,
      emailTypeDropdown,
    },
    ref
  ) => {
    const [depts, setDepts] = useState<LabelValue[]>([]);
    const [deptName, setDeptName] = useState<number[]>([]);
    const [deptError, setDeptError] = useState(false);
    const [emailType, setEmailType] = useState(0);
    const [emailTypeError, setEmailTypeError] = useState(false);
    const [emailTemplateName, setEmailTemplateName] = useState("");
    const [emailTemplateNameErr, setEmailTemplateNameErr] = useState("");
    const [text, setText] = useState("");
    const [textError, setTextError] = useState(false);

    const fetchEditData = async () => {
      if (onEdit > 0) {
        const params = { Id: onEdit || 0 };
        const url = `${process.env.pms_api_url}/emailtemplate/getbyid`;
        const successCallback = (
          ResponseData: {
            Id: number;
            EmailType: number;
            Departments: number[];
            EmailTemplateName: string;
            EmailContent: string;
          },
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            setDepts(
              ResponseData.Departments.length <= 0 ||
                ResponseData.Departments.length === null
                ? []
                : departmentDropdown.filter((dept: LabelValue) =>
                    ResponseData.Departments.includes(dept.value)
                  )
            );
            setDeptName(
              !!ResponseData.Departments ? ResponseData.Departments : []
            );
            setEmailType(ResponseData.EmailType);
            setEmailTemplateName(ResponseData.EmailTemplateName);
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
      setDepts([]);
      setDeptName([]);
      setDeptError(false);
      setEmailType(0);
      setEmailTypeError(false);
      setEmailTemplateName("");
      setEmailTemplateNameErr("");
      setText("");
      setTextError(false);
    };

    const EmailTemplateDataValue = async () => {
      await clearData();
    };

    useImperativeHandle(ref, () => ({
      EmailTemplateDataValue,
    }));

    const validateEmailTemplateName = () => {
      const trimmedEmailType = emailTemplateName.trim();

      if (trimmedEmailType.length === 0) {
        setEmailTemplateNameErr("Email Template Name is required.");
        return false;
      }
      if (trimmedEmailType.length > 100) {
        setEmailTemplateNameErr(
          "Email Template name cannot exceed 100 characters."
        );
        return false;
      }

      setEmailTemplateNameErr("");
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
      const isEmailTypeValid = validateEmailTemplateName();
      setDeptError(deptName.length <= 0);
      setEmailTypeError(emailType <= 0);
      setTextError(
        text.trim().length <= 0 || text.trim().length > 5000 || !validateText
      );

      if (
        deptError ||
        deptName.length <= 0 ||
        emailTypeError ||
        emailType <= 0 ||
        !isEmailTypeValid ||
        textError ||
        text.trim().length <= 0 ||
        text.trim().length > 5000 ||
        !validateText
      )
        return;

      onChangeLoader(true);
      const params = {
        Id: onEdit > 0 ? onEdit : 0,
        Departments: deptName,
        EmailTemplateName: emailTemplateName.trim(),
        EmailContent: text.trim(),
        EmailType: emailType,
      };
      const url = `${process.env.pms_api_url}/emailtemplate/save`;
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

    return (
      <>
        <div className="flex flex-col px-[20px] pb-[10px] max-h-[73.5vh] overflow-y-auto">
          <Autocomplete
            multiple
            id="tags-standard"
            sx={{ mt: "20px" }}
            options={departmentDropdown}
            getOptionLabel={(option: LabelValue) => option.label}
            onChange={(e, data: LabelValue[]) => {
              setDepts(data);
              setDeptName(data.map((d: LabelValue) => d.value));
              setDeptError(false);
            }}
            value={depts}
            onBlur={() => {
              if (deptName.length <= 0) {
                setDeptError(true);
              }
            }}
            renderInput={(params: any) => (
              <TextField
                {...params}
                variant="standard"
                label={
                  <span>
                    Department
                    <span className="!text-defaultRed">&nbsp;*</span>
                  </span>
                }
                error={deptError}
                helperText={deptError ? "This is a required field." : ""}
              />
            )}
          />
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            sx={{ my: "15px" }}
            options={emailTypeDropdown}
            value={
              emailTypeDropdown.find(
                (i: LabelValue) => i.value === emailType
              ) || null
            }
            onChange={(e, value: LabelValue | null) => {
              value && setEmailType(value.value);
              value && setEmailTypeError(false);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label={
                  <span>
                    Email Type
                    <span className="text-defaultRed">&nbsp;*</span>
                  </span>
                }
                placeholder="Please Select Email Type"
                error={emailTypeError}
                onBlur={() => {
                  if (emailType > 0) {
                    setEmailTypeError(false);
                  }
                }}
                helperText={emailTypeError ? "Email Type is required." : ""}
              />
            )}
          />

          <TextField
            label={
              <span>
                Email Type Name
                <span className="!text-defaultRed">&nbsp;*</span>
              </span>
            }
            fullWidth
            className="-mt-1"
            value={emailTemplateName}
            onChange={(e) => {
              setEmailTemplateName(e.target.value);
              setEmailTemplateNameErr("");
            }}
            onBlur={validateEmailTemplateName}
            error={!!emailTemplateNameErr}
            helperText={emailTemplateNameErr}
            margin="normal"
            variant="standard"
          />

          <FormLabel
            id="demo-radio-buttons-group-label"
            className={`mt-4 mb-2 text-sm ${
              textError ? "text-defaultRed" : ""
            }`}
          >
            Description
            <span className="!text-defaultRed">&nbsp;*</span>
          </FormLabel>
          <RicheTextEditor
            text={text}
            setText={setText}
            textError={textError}
            setTextError={setTextError}
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
            {onEdit > 0 ? "Save" : "Create Email Type"}
          </Button>
        </div>
      </>
    );
  }
);

export default EmailTemplateContent;
