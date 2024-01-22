/* eslint-disable react/display-name */
/* eslint-disable react-hooks/exhaustive-deps */
import { callAPI } from "@/utils/API/callAPI";
import { Button, TextField } from "@mui/material";
import { ColorPicker } from "next-ts-lib";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";

export interface StatusContenRef {
  clearStatusData: () => void;
}
const StatusContent = forwardRef<
  StatusContenRef,
  {
    tab: string;
    onEdit: any;
    statusData: any;
    onClose: () => void;
    onDataFetch: any;
    onChangeLoader: any;
  }
>(({ tab, onClose, onEdit, statusData, onDataFetch, onChangeLoader }, ref) => {
  const [statusName, setStatusName] = useState("");
  const [statusNameErr, setStatusNameErr] = useState(false);
  const [type, setType] = useState("");
  const [colorName, setColorName] = useState("");
  const [isDefualt, setIsDefualt] = useState(false);

  const token = localStorage.getItem("token");
  const org_token = localStorage.getItem("Org_Token");

  const fetchEditData = async () => {
    if (onEdit) {
      const params = {
        statusId: onEdit || 0,
      };
      const url = `${process.env.pms_api_url}/status/GetById`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setStatusName(ResponseData.Name);
          setType(ResponseData.Type);
          setIsDefualt(ResponseData.IsDefault);
          setColorName(ResponseData.ColorCode);
        } else {
          setStatusName("");
          setColorName("");
        }
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      setStatusName("");
      setColorName("");
    }
  };

  useEffect(() => {
    setStatusNameErr(false);
    setColorName("#000000");
    setIsDefualt(false);
    setType("");
  }, [onClose]);

  useEffect(() => {
    fetchEditData();
    setColorName("");
  }, [onEdit]);

  const clearStatusData = async () => {
    const clearData = () => {
      setStatusName("");
      setColorName("");
      setStatusNameErr(false);
    };
    await clearData();
  };

  useImperativeHandle(ref, () => ({
    clearStatusData,
  }));

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    statusName.trim().length <= 0 && setStatusNameErr(true);
    statusName.trim().length > 50 && setStatusNameErr(true);
    
    if (!statusNameErr) {
      onChangeLoader(true);
      const params = {
        statusId: onEdit || 0,
        name: statusName.trim(),
        Type: type,
        colorCode: colorName.trim(),
      };
      const url = `${process.env.pms_api_url}/status/Save`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          onDataFetch();
          clearStatusData();
          onChangeLoader(false);
          onClose();
          toast.success(
            `${onEdit ? "" : "New"} Status ${
              onEdit ? "Updated" : "added"
            }  successfully.`
          );
        } else {
          onChangeLoader(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const addMoreSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    statusName.trim().length <= 0 && setStatusNameErr(true);
    statusName.trim().length > 50 && setStatusNameErr(true);
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    if (statusNameErr) {
      const params = { groupId: onEdit || 0 };
      const url = `${process.env.pms_api_url}/group/getbyid`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          onDataFetch();
          clearStatusData();
          toast.success(
            `${onEdit ? "" : "New"} Status ${
              onEdit ? "Updated" : "added"
            }  successfully.`
          );
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  return (
    <>
      <div className="flex flex-col px-[20px] min-h-[calc(100vh-145px)]">
        <TextField
          label={
            <span>
              Status
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="pt-1"
          value={statusName?.trim().length <= 0 ? "" : statusName}
          onChange={(e) => {
            setStatusName(e.target.value);
            setStatusNameErr(false);
          }}
          onBlur={(e: any) => {
            if (
              e.target.value.trim().length < 1 ||
              e.target.value.trim().length > 50
            ) {
              setStatusNameErr(true);
            }
          }}
          error={statusNameErr}
          helperText={
            statusNameErr && statusName?.trim().length > 50
              ? "Maximum 50 characters allowed."
              : statusNameErr
              ? "This is a required field."
              : ""
          }
          margin="normal"
          variant="standard"
          sx={{ width: 570 }}
        />
        <TextField
          label="Type"
          disabled={isDefualt}
          fullWidth
          className="pt-1"
          value={type?.trim().length <= 0 ? "" : type}
          onChange={(e) => setType(e.target.value)}
          margin="normal"
          variant="standard"
          sx={{ width: 570 }}
        />

        <ColorPicker
          value={colorName}
          onChange={(e) => {
            setColorName(e);
          }}
        />
      </div>

      <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
        {onEdit ? (
          <Button
            variant="outlined"
            className="rounded-[4px] !h-[36px] !text-secondary"
            onClick={() => onClose()}
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
          {onEdit ? "Save" : "Create Status"}
        </Button>
      </div>
    </>
  );
});
export default StatusContent;
