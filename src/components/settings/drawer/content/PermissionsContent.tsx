import { callAPI } from "@/utils/API/callAPI";
import { Button, Radio, TextField } from "@mui/material";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { toast } from "react-toastify";

export interface PermissionContentRef {
  clearAllData: () => void;
}

const PermissionsContent = forwardRef<
  PermissionContentRef,
  {
    tab: string;
    onClose: () => void;
    getPermissionDropdown: any;
    onChangeLoader: any;
  }
>(({ tab, onClose, getPermissionDropdown, onChangeLoader }, ref) => {
  const [role, setRole] = useState("");
  const [type, setType] = useState<any>("1");
  const [roleErr, setRoleErr] = useState(false);

  const clearData = () => {
    setRole("");
    setRoleErr(false);
    setType("1");
  };

  const clearAllData = () => {
    onClose();
    clearData();
  };

  useImperativeHandle(ref, () => ({
    clearAllData,
  }));

  const saveRole = async () => {
    onChangeLoader(true);
    const params = {
      Name: role.trim(),
      type: parseInt(type),
    };
    const url = `${process.env.pms_api_url}/Role/Save`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        clearAllData();
        getPermissionDropdown();
        onChangeLoader(false);
        toast.success(`Role created successfully.`);
      } else {
        onChangeLoader(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    role.trim().length < 3 && setRoleErr(true);
    role.trim().length > 50 && setRoleErr(true);

    if (!roleErr && role.trim().length > 2 && role.trim().length < 50) {
      saveRole();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col p-[20px]">
        <div className="flex items-center -ml-4">
          <Radio
            checked={type == 1}
            onChange={(e) => setType(e.target.value)}
            value="1"
            name="radio-buttons"
          />
          <span className="mr-5 cursor-pointer" onClick={(e) => setType("1")}>
            Employee
          </span>
          <Radio
            checked={type == 2}
            onChange={(e) => setType(e.target.value)}
            value="2"
            name="radio-buttons"
          />
          <span className="cursor-pointer" onClick={(e) => setType("2")}>
            Client
          </span>
        </div>

        <TextField
          label={
            <span>
              Role
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="pt-1"
          value={role?.trim().length <= 0 ? "" : role}
          onChange={(e) => {
            setRole(e.target.value);
            setRoleErr(false);
          }}
          onBlur={(e: any) => {
            if (
              e.target.value.trim().length < 3 ||
              e.target.value.trim().length > 50
            ) {
              setRoleErr(true);
            }
          }}
          error={roleErr}
          helperText={
            roleErr && role?.trim().length > 0 && role?.trim().length < 3
              ? "Minimum 3 characters allowed."
              : roleErr && role?.trim().length > 50
              ? "Maximum 50 characters allowed."
              : roleErr
              ? "This is a required field."
              : ""
          }
          margin="normal"
          variant="standard"
          sx={{ width: 570 }}
        />
      </div>

      <div className="flex justify-end fixed w-full bottom-0 px-[20px] py-[15px] border-t border-lightSilver">
        <Button
          variant="outlined"
          className="rounded-[4px] !h-[36px] !text-secondary"
          onClick={clearAllData}
        >
          Close
        </Button>
        <Button
          variant="contained"
          className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
          type="submit"
        >
          Create Role
        </Button>
      </div>
    </form>
  );
});

export default PermissionsContent;
