import { Autocomplete, Button, Checkbox, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import { getCCDropdownData } from "@/utils/commonDropdownApiCall";

export interface GroupContentRef {
  groupDataValue: () => void;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type Options = {
  label: string;
  value: string;
};

const GroupContent = forwardRef<
  GroupContentRef,
  {
    tab: any;
    onEdit: boolean;
    onOpen: boolean;
    onClose: () => void;
    onDataFetch: any;
    onChangeLoader: any;
  }
>(({ tab, onEdit, onOpen, onClose, onDataFetch, onChangeLoader }, ref) => {
  const [data, setData] = useState<Options[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupNameErr, setGroupNameErr] = useState(false);
  const [selectValue, setSelectValue] = useState<any[]>([]);
  const [selectedOptions, setSelectOptions] = useState<Options[]>([]);

  const fetchEditData = async () => {
    if (onEdit) {
      const params = { groupId: onEdit || 0 };
      const url = `${process.env.pms_api_url}/group/getbyid`;
      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          let groupuserIds = ResponseData.GroupUserIds;

          const filteredOptionsData = data.filter((d) => {
            return groupuserIds.some((id: number) => {
              return id === parseInt(d.value);
            });
          });

          setGroupName(ResponseData.Name);
          if (!groupuserIds) {
            groupuserIds = null;
          } else {
            setSelectOptions(filteredOptionsData);
            setSelectValue(ResponseData.GroupUserIds);
          }
        } else {
          setGroupName("");
          setGroupNameErr(false);
          setSelectOptions([]);
          setSelectValue([]);
        }
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      setGroupName("");
      setGroupNameErr(false);
      setSelectOptions([]);
      setSelectValue([]);
    }
  };

  useEffect(() => {
    onOpen && fetchEditData();
    data.length <= 0 && getDropdownData();
  }, [onEdit, onOpen]);

  const getDropdownData = async () => {
    setData(await getCCDropdownData());
  };

  const groupDataValue = async () => {
    const clearData = () => {
      setGroupName("");
      setSelectValue([]);
      setSelectOptions([]);
      setGroupNameErr(false);
    };
    await clearData();
  };

  useImperativeHandle(ref, () => ({
    groupDataValue,
  }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    groupName.trim().length < 1 && setGroupNameErr(true);
    groupName.trim().length > 20 && setGroupNameErr(true);

    if (
      !groupNameErr &&
      groupName !== "" &&
      groupName.trim().length > 0 &&
      groupName.trim().length < 20
    ) {
      onChangeLoader(true);
      const params = {
        id: onEdit || 0,
        name: groupName.trim(),
        groupUserIds: selectValue,
      };
      const url = `${process.env.pms_api_url}/group/save`;
      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          onDataFetch();
          onChangeLoader(false);
          onClose();
          groupDataValue();
          toast.success(
            `${onEdit ? "" : "New"} Group ${
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

  const addMoreSubmit = async (e: any) => {
    e.preventDefault();
    groupName.trim().length < 1 && setGroupNameErr(true);
    groupName.trim().length > 20 && setGroupNameErr(true);

    if (
      !groupNameErr &&
      groupName !== "" &&
      groupName.trim().length > 0 &&
      groupName.trim().length < 20
    ) {
      const params = {
        id: onEdit || 0,
        name: groupName.trim(),
        groupUserIds: selectValue,
      };
      const url = `${process.env.pms_api_url}/group/save`;
      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(
            `${onEdit ? "" : "New"} Group ${
              onEdit ? "Updated" : "added"
            }  successfully.`
          );
          onDataFetch();
          groupDataValue();
          setGroupName("");
          setGroupNameErr(false);
          setSelectValue([]);
          setSelectOptions([]);
        }
      };
      callAPI(url, params, successCallback, "POST");
      setGroupName("");
      setGroupNameErr(false);
      setSelectValue([]);
      setSelectOptions([]);
    }
  };

  const handleMultiSelect = (e: React.SyntheticEvent, value: any) => {
    if (value !== undefined) {
      const selectedValue = value.map((v: any) => v.value);
      setSelectOptions(value);
      setSelectValue(selectedValue);
    } else {
      setSelectValue([]);
    }
  };

  return (
    <>
      <div className="flex gap-[10px] flex-col px-[20px]">
        <TextField
          label={
            <span>
              Group Name
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="pt-1"
          value={groupName?.trim().length <= 0 ? "" : groupName}
          onChange={(e) => {
            setGroupName(e.target.value);
            setGroupNameErr(false);
          }}
          onBlur={(e) => {
            if (
              e.target.value.trim().length < 1 ||
              e.target.value.trim().length > 20
            ) {
              setGroupNameErr(true);
            }
          }}
          error={groupNameErr}
          helperText={
            groupNameErr && groupName?.trim().length > 20
              ? "Maximum 20 characters allowed."
              : groupNameErr
              ? "This is a required field."
              : ""
          }
          margin="normal"
          variant="standard"
          sx={{ width: 500 }}
        />
        <Autocomplete
          multiple
          limitTags={2}
          id="checkboxes-tags-demo"
          options={data}
          value={selectedOptions}
          getOptionLabel={(option) => option.label}
          getOptionDisabled={(option) => selectValue.includes(option.value)}
          disableCloseOnSelect
          onChange={handleMultiSelect}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selectValue.includes(option.value)}
              />
              {option.label}
            </li>
          )}
          style={{ width: 500 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="User"
              placeholder="Please Select..."
              variant="standard"
            />
          )}
        />
      </div>

      <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
        <>
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
            {onEdit ? "Save" : "Create Group"}
          </Button>
        </>
      </div>
    </>
  );
});

export default GroupContent;
