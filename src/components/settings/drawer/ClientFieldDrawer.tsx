import React, { useEffect, useState } from "react";
import TaskIcon from "@/assets/icons/TaskIcon";
import OverLay from "@/components/common/OverLay";
import { callAPI } from "@/utils/API/callAPI";
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tooltip,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const ClientFieldsDrawer = ({ onOpen, onClose, selectedRowId }: any) => {
  const [isLoadingClientFields, setIsLoadingClientFields] = useState(false);
  const [fieldsData, setFieldsData] = useState<string[] | any>([]);
  const [typeOfWorkDropdown, setTypeOfWorkDropdown] = useState([]);
  const [typeOfWork, setTypeOfWork] = useState(0);

  const handleClose = () => {
    onClose();
  };

  const getWorkTypeData = async () => {
    const params = {
      clientId: selectedRowId || 0,
    };
    const url = `${process.env.pms_api_url}/WorkType/GetDropdown`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setTypeOfWorkDropdown(ResponseData);
        setTypeOfWork(ResponseData[0].value);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const getFieldsByClient = async () => {
    const params = {
      clientId: selectedRowId || 0,
      WorkTypeId: typeOfWork,
    };
    const url = `${process.env.pms_api_url}/client/GetFields`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setFieldsData(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const SaveFieldByClient = async (fieldId: number, isChecked: boolean) => {
    setIsLoadingClientFields(true);
    const params = {
      clientId: selectedRowId || 0,
      FieldId: fieldId,
      IsChecked: isChecked,
      WorkTypeId: typeOfWork,
    };
    const url = `${process.env.pms_api_url}/client/SaveFields`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        getFieldsByClient();
        setIsLoadingClientFields(false);
      } else {
        setIsLoadingClientFields(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    if (selectedRowId && onOpen) {
      getWorkTypeData();
    }
  }, [selectedRowId, onOpen]);

  useEffect(() => {
    if (typeOfWork > 0) {
      getFieldsByClient();
    }
  }, [typeOfWork, onOpen]);

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-30 h-screen overflow-y-auto w-[70vw] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex p-[20px] justify-between items-center bg-whiteSmoke border-b border-lightSilver">
          <span className="text-pureBlack text-lg font-medium">
            Edit Fields
          </span>
          <div>
            <FormControl
              variant="standard"
              sx={{ width: 300, mt: -0.3, my: -1, mx: 0.75, mr: 4 }}
            >
              <InputLabel id="demo-simple-select-standard-label">
                Type Of Work
                <span className="text-defaultRed">&nbsp;*</span>
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={typeOfWork === 0 ? "" : typeOfWork}
                onChange={(e: any) => setTypeOfWork(parseInt(e.target.value))}
              >
                {typeOfWorkDropdown.map((i: any, index: number) => (
                  <MenuItem value={i.value} key={index}>
                    {i.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Close" placement="left" arrow>
              <IconButton onClick={handleClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-[10px] p-5 border-b border-dashed border-lightSilver">
            <span>
              <TaskIcon />
            </span>
            <span className="text-lg">Task</span>
          </div>

          <div className="py-5 grid grid-cols-3 justify-items-center">
            {fieldsData.map((field: any) => (
              <div
                key={field.FieldId}
                className="py-[15px] flex items-center w-64 justify-between"
              >
                <span>{field.DisplayName}</span>
                <span
                  onClick={() => {
                    const toggledChecked = !field.IsChecked;
                    const isSubProcess = fieldsData
                      .map((i: any) =>
                        i.Type === "SubProcessName" ? i.FieldId : 0
                      )
                      .filter((j: any) => j !== 0);
                    const isProcess =
                      field.Type === "ProcessName" &&
                      field.IsChecked === true &&
                      isSubProcess.length > 0;
                    field.Type !== "TypeOfWork" &&
                      isProcess &&
                      SaveFieldByClient(isSubProcess[0], false);
                    field.Type !== "TypeOfWork" &&
                      SaveFieldByClient(field.FieldId, toggledChecked);
                  }}
                >
                  <Switch
                    checked={field.IsChecked}
                    disabled={field.Type === "TypeOfWork"}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end fixed w-full bottom-0 gap-[20px] px-[20px] py-[15px] bg-pureWhite border-t border-lightSilver">
          <Button
            variant="outlined"
            className="rounded-[4px] !h-[36px] !text-secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </div>
      {isLoadingClientFields ? <OverLay /> : ""}
    </>
  );
};

export default ClientFieldsDrawer;
