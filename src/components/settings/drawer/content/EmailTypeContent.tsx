import { Button, TextField, Chip, Autocomplete } from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import { ColorPicker } from "next-ts-lib";
import { LabelValue } from "@/utils/Types/types";
import { getDeptData } from "@/utils/commonDropdownApiCall";

export interface EmailTypeContentRef {
  EmailTypeDataValue: () => void;
}

const EmailTypeContent = forwardRef<
  EmailTypeContentRef,
  {
    onEdit: number;
    onOpen: boolean;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
  }
>(({ onEdit, onOpen, onClose, onDataFetch, onChangeLoader }, ref) => {
  const [depts, setDepts] = useState<LabelValue[]>([]);
  const [deptName, setDeptName] = useState<number[]>([]);
  const [deptError, setDeptError] = useState(false);
  const [departmentDropdown, setDepartmentDropdown] = useState<LabelValue[]>(
    []
  );

  const [emailType, setEmailType] = useState("");
  const [emailTypeErr, setEmailTypeErr] = useState("");

  const [tat, setTat] = useState(""); // TAT state
  const [tatErr, setTatErr] = useState(""); // TAT error state

  const [keywords, setKeywords] = useState<string[]>([]); // Keywords state
  const [newKeyword, setNewKeyword] = useState(""); // New keyword input
  const [keywordErr, setKeywordErr] = useState(""); // Keyword error state
  const [colorName, setColorName] = useState("");
  const [colorNameError, setColorNameError] = useState(false);
  console.log(colorName);

  const fetchEditData = async () => {
    if (onEdit > 0) {
      const params = { Id: onEdit || 0 };
      const url = `${process.env.pms_api_url}/emailType/getemailtypebyid`;
      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          console.log(ResponseData);
          setDepts(
            ResponseData.DepartmentIds.length <= 0 ||
              ResponseData.DepartmentIds.length === null
              ? []
              : departmentDropdown.filter((dept: LabelValue) =>
                  ResponseData.DepartmentIds.includes(dept.value)
                )
          );
          setDeptName(
            !!ResponseData.DepartmentIds ? ResponseData.DepartmentIds : 0
          );
          setEmailType(ResponseData.Type);
          setTat(
            `${Math.floor(ResponseData.TAT / 3600)
              .toString()
              .padStart(2, "0")}:${Math.floor((ResponseData.TAT % 3600) / 60)
              .toString()
              .padStart(2, "0")}`
          );
          setKeywords(ResponseData.Keywords || []);
          setColorName(ResponseData.Color);
        } else {
          clearData();
        }
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      clearData();
    }
  };

  const getData = async () => {
    setDepartmentDropdown(await getDeptData());
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setColorName("");
    onOpen && onEdit > 0 && fetchEditData();
  }, [onEdit, onOpen]);

  useEffect(() => {
    !onOpen && setColorName("#000000");
  }, [onOpen]);

  const clearData = () => {
    setDepts([]);
    setDeptName([]);
    setDeptError(false);
    setEmailType("");
    setEmailTypeErr("");
    setTat("");
    setTatErr("");
    setKeywords([]);
    setNewKeyword("");
    setKeywordErr("");
    setColorName("");
    setColorNameError(false);
  };

  const EmailTypeDataValue = async () => {
    await clearData();
  };

  useImperativeHandle(ref, () => ({
    EmailTypeDataValue,
  }));

  const validateEmailType = () => {
    const trimmedEmailType = emailType.trim();

    if (trimmedEmailType.length === 0) {
      setEmailTypeErr(
        "Email Type Name cannot be empty. Please provide a valid name."
      );
      return false;
    }
    if (trimmedEmailType.length > 50) {
      setEmailTypeErr(
        "Email Type Name cannot exceed 50 characters. Please provide a shorter name."
      );
      return false;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(trimmedEmailType)) {
      setEmailTypeErr(
        "Email Type Name can only include letters, numbers, hyphens, and underscores. Please remove invalid characters."
      );
      return false;
    }

    setEmailTypeErr("");
    return true;
  };

  const validateTAT = () => {
    const tatRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/; // Regex for hh:mm format
    const trimmedTAT = tat.trim();

    if (!trimmedTAT) {
      setTatErr("TAT is a mandatory field.");
      return false;
    }

    if (!tatRegex.test(trimmedTAT)) {
      setTatErr("Please enter a valid time in hh:mm format.");
      return false;
    }

    // Ensure minimum time is 1 minute
    const [hours, minutes] = trimmedTAT.split(":").map(Number);
    if (hours === 0 && minutes === 0) {
      setTatErr("TAT must be at least 1 minute.");
      return false;
    }

    setTatErr("");
    return true;
  };

  const validateKeyword = () => {
    const trimmedKeyword = newKeyword.trim();

    if (!trimmedKeyword) {
      setKeywordErr("Keyword cannot be blank.");
      return false;
    }

    if (trimmedKeyword.length > 50) {
      setKeywordErr("Keyword cannot exceed 50 characters.");
      return false;
    }

    if (keywords.includes(trimmedKeyword)) {
      setKeywordErr("Keyword already exists.");
      return false;
    }

    setKeywordErr("");
    return true;
  };

  const addKeyword = () => {
    if (!validateKeyword()) return;
    setKeywords([...keywords, newKeyword.trim()]);
    setNewKeyword("");
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const hhMMToSeconds = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return (hours * 60 + minutes) * 60;
  };

  const handleSubmit = async (close: boolean) => {
    const isEmailTypeValid = validateEmailType();
    const isTATValid = validateTAT();
    setDeptError(deptName.length <= 0);
    setColorNameError(colorName.length <= 0);

    if (
      deptError ||
      deptName.length <= 0 ||
      colorNameError ||
      colorName.length <= 0 ||
      !isEmailTypeValid ||
      !isTATValid
    )
      return;

    onChangeLoader(true);
    const params = {
      Id: onEdit > 0 ? onEdit : 0,
      DepartmentIds: deptName,
      Type: emailType.trim(),
      TAT: hhMMToSeconds(tat.trim()),
      Keywords: keywords,
      Color: colorName,
    };
    const url = `${process.env.pms_api_url}/emailtype/saveemailtype`;
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
          `${onEdit > 0 ? "" : "New"} Email Type ${
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
      <div className="flex flex-col px-[20px] pb-[150px] max-h-[73.5vh] overflow-y-auto">
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

        <TextField
          label={
            <span>
              Email Type
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="pt-1"
          value={emailType}
          onChange={(e) => {
            setEmailType(e.target.value);
            setEmailTypeErr("");
          }}
          onBlur={validateEmailType}
          error={!!emailTypeErr}
          helperText={emailTypeErr}
          margin="normal"
          variant="standard"
        />

        <TextField
          label={
            <span>
              SLA TAT
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="pt-1"
          value={tat}
          onChange={(e) => {
            const input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
            let formattedTat = input;

            if (input.length >= 3) {
              // Automatically format as hh:mm
              formattedTat =
                input.substring(0, 2) + ":" + input.substring(2, 4);
            }

            setTat(formattedTat);
            setTatErr("");
          }}
          onBlur={validateTAT}
          error={!!tatErr}
          helperText={tatErr}
          margin="normal"
          variant="standard"
          placeholder="hh:mm"
        />

        <TextField
          label="Keyword"
          fullWidth
          className="pt-1"
          value={newKeyword}
          onChange={(e) => {
            setNewKeyword(e.target.value);
            setKeywordErr("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") addKeyword();
          }}
          error={!!keywordErr}
          helperText={keywordErr}
          margin="normal"
          variant="standard"
          placeholder="Type and press Enter"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((keyword) => (
            <Chip
              key={keyword}
              label={keyword}
              onDelete={() => removeKeyword(keyword)}
              color="primary"
            />
          ))}
        </div>

        <ColorPicker
          value={colorName}
          onChange={(e) => {
            setColorName(e);
            setColorNameError(false);
          }}
        />
        {colorNameError && (
          <p className="text-red-500">
            Please select a valid color from the predefined list.
          </p>
        )}
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
          {onEdit > 0 ? "Save" : "Create Error Details"}
        </Button>
      </div>
    </>
  );
});

export default EmailTypeContent;
