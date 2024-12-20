import { Button, TextField } from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";

export interface NatureOfErrorContentRef {
  NatureOfErrorDataValue: () => void;
}

const NatureOfErrorContent = forwardRef<
  NatureOfErrorContentRef,
  {
    onEdit: number;
    onOpen: boolean;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
  }
>(({ onEdit, onOpen, onClose, onDataFetch, onChangeLoader }, ref) => {
  const [natureOfError, setNatureOfError] = useState("");
  const [natureOfErrorErr, setNatureOfErrorErr] = useState(false);
  const [type, setType] = useState("");
  const [typeErr, setTypeErr] = useState(false);
  const [isDefualt, setIsDefualt] = useState(false);

  const fetchEditData = async () => {
    if (onEdit > 0) {
      const params = { Id: onEdit || 0 };
      const url = `${process.env.pms_api_url}/natureOfError/getbyid`;
      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setNatureOfError(ResponseData.Name);
          setType(ResponseData.Type);
          setIsDefualt(ResponseData.IsDefault);
        } else {
          setNatureOfError("");
          setNatureOfErrorErr(false);
          setType("");
          setTypeErr(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      setNatureOfError("");
      setNatureOfErrorErr(false);
      setType("");
      setTypeErr(false);
    }
  };

  useEffect(() => {
    onOpen && onEdit > 0 && fetchEditData();
  }, [onEdit, onOpen]);

  const clearData = () => {
    setNatureOfError("");
    setNatureOfErrorErr(false);
    setType("");
    setTypeErr(false);
    setIsDefualt(false);
  };

  const NatureOfErrorDataValue = async () => {
    await clearData();
  };

  useImperativeHandle(ref, () => ({
    NatureOfErrorDataValue,
  }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    natureOfError.trim().length < 1 && setNatureOfErrorErr(true);
    natureOfError.trim().length > 50 && setNatureOfErrorErr(true);
    type.trim().length <= 0 && setTypeErr(true);
    type.trim().length > 50 && setTypeErr(true);

    if (
      !natureOfErrorErr &&
      natureOfError !== "" &&
      natureOfError.trim().length > 0 &&
      natureOfError.trim().length <= 50 &&
      !typeErr &&
      type.trim().length > 0 &&
      type.trim().length <= 50 &&
      /^[a-zA-Z0-9]+$/.test(type)
    ) {
      onChangeLoader(true);
      const params = {
        Id: onEdit > 0 ? onEdit : 0,
        Name: natureOfError.trim(),
        Type: type,
      };
      const url = `${process.env.pms_api_url}/natureOfError/save`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          onDataFetch?.();
          onChangeLoader(false);
          onClose();
          NatureOfErrorDataValue();
          toast.success(
            `${onEdit > 0 ? "" : "New"} Error Details ${
              onEdit > 0 ? "Updated" : "added"
            }  successfully.`
          );
        } else {
          onChangeLoader(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const addMoreSubmit = async (e: any) => {
    e.preventDefault();
    natureOfError.trim().length < 1 && setNatureOfErrorErr(true);
    natureOfError.trim().length > 50 && setNatureOfErrorErr(true);
    type.trim().length <= 0 && setTypeErr(true);
    type.trim().length > 50 && setTypeErr(true);

    if (
      !natureOfErrorErr &&
      natureOfError !== "" &&
      natureOfError.trim().length > 0 &&
      natureOfError.trim().length <= 50 &&
      !typeErr &&
      type.trim().length > 0 &&
      type.trim().length <= 50 &&
      /^[a-zA-Z0-9]+$/.test(type)
    ) {
      const params = {
        Id: onEdit > 0 ? onEdit : 0,
        Name: natureOfError.trim(),
        Type: type,
      };
      const url = `${process.env.pms_api_url}/natureOfError/save`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(
            `${onEdit > 0 ? "" : "New"} Error Details ${
              onEdit > 0 ? "Updated" : "added"
            }  successfully.`
          );
          onDataFetch?.();
          NatureOfErrorDataValue();
          setNatureOfError("");
          setNatureOfErrorErr(false);
          setType("");
          setTypeErr(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
      setNatureOfError("");
      setNatureOfErrorErr(false);
      setType("");
      setTypeErr(false);
    }
  };

  return (
    <>
      <div className="flex flex-col px-[20px] pb-[150px] max-h-[73.5vh] overflow-y-auto">
        <TextField
          label={
            <span>
              Error Details
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="pt-1"
          value={natureOfError?.trim().length <= 0 ? "" : natureOfError}
          onChange={(e) => {
            setNatureOfError(e.target.value);
            setNatureOfErrorErr(false);
          }}
          onBlur={(e) => {
            if (
              e.target.value.trim().length < 1 ||
              e.target.value.trim().length > 50
            ) {
              setNatureOfErrorErr(true);
            }
          }}
          error={natureOfErrorErr}
          helperText={
            natureOfErrorErr && natureOfError?.trim().length > 50
              ? "Maximum 50 characters allowed."
              : natureOfErrorErr
              ? "This is a required field."
              : ""
          }
          margin="normal"
          variant="standard"
        />
        <TextField
          label={
            <span>
              Type
              <span className="text-defaultRed">&nbsp;*</span>
            </span>
          }
          disabled={isDefualt}
          fullWidth
          className="pt-1"
          value={type?.trim().length <= 0 ? "" : type}
          onChange={(e) => setType(e.target.value.trim())}
          onBlur={(e) => {
            if (
              !isDefualt &&
              (e.target.value.trim().length < 1 ||
                e.target.value.trim().length > 50 ||
                !/^[a-zA-Z0-9]+$/.test(e.target.value))
            ) {
              setTypeErr(true);
            } else {
              setTypeErr(false);
            }
          }}
          error={!isDefualt && typeErr}
          helperText={
            !isDefualt && typeErr && type?.trim().length > 50
              ? "Maximum 50 characters allowed."
              : !/^[a-zA-Z0-9]+$/.test(type) && typeErr
              ? "Special characters are not allowed.."
              : !isDefualt && typeErr
              ? "This is a required field."
              : ""
          }
          margin="normal"
          variant="standard"
        />
      </div>

      <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
        <>
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
              variant="outlined"
              className="rounded-[4px] !h-[36px] !text-secondary cursor-pointer"
              onClick={addMoreSubmit}
            >
              Add More
            </Button>
          )}
          <Button
            variant="contained"
            className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
            type="submit"
            onClick={handleSubmit}
          >
            {onEdit > 0 ? "Save" : "Create Error Details"}
          </Button>
        </>
      </div>
    </>
  );
});

export default NatureOfErrorContent;
