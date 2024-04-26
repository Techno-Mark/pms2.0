import React, {
  useState,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import PlusIcon from "@/assets/icons/PlusIcon";
import MinusIcon from "@/assets/icons/MinusIcon";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  createFilterOptions,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { ProcessGetByIdList } from "@/utils/Types/settingTypes";
import { LabelValue } from "@/utils/Types/types";

export interface ProcessContentRef {
  ProcessDataValue: () => void;
}

type Options = {
  label: string;
  value: string;
};

const filter = createFilterOptions<Options>();

const ProcessContent = forwardRef<
  ProcessContentRef,
  {
    onEdit: number;
    onOpen: boolean;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
    onValuesChange: (
      childValue1: React.SetStateAction<number | null>,
      childValue2: boolean | ((prevState: boolean) => boolean)
    ) => void;
  }
>(
  (
    { onEdit, onOpen, onClose, onDataFetch, onChangeLoader, onValuesChange },
    ref
  ) => {
    const [typeOfWorkDropdown, setTypeOfWorkDropdown] = useState<Options[]>([]);
    const [typeOfWork, setTypeOfWork] = useState(0);
    const [typeOfWorkError, setTypeOfWorkError] = useState(false);
    const [data, setData] = useState<Options[]>([]);
    const [hoveredItem, setHoveredItem] = useState<Options | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [open, toggleOpen] = useState(false);
    const [addMoreClicked, setAddMoreClicked] = useState(false);
    const [processValue, setProcessValue] = useState<number>(0);
    const [processName, setProcessName] = useState("");
    const [processNameError, setProcessNameError] = useState(false);
    const [processNameErrText, setProcessNameErrText] = useState<string>(
      "This is a required field!."
    );
    const [processValueError, setProcessValueError] = useState(false);

    const [subProcessName, setSubProcessName] = useState("");
    const [subProcessNameError, setSubProcessNameError] = useState(false);
    const [returnType, setReturnType] = useState<number>(0);
    const [returnTypeError, setReturnTypeError] = useState(false);
    const returnTypeDrpdown = [
      {
        label: "None",
        value: 3,
      },
      {
        label: "Individual Return",
        value: 1,
      },
      {
        label: "Business Return",
        value: 2,
      },
    ];
    const [estTime, setEstTime] = useState<string>("");
    const [estTimeError, setEstTimeError] = useState(false);
    const [productive, setProductive] = useState<boolean>(true);
    const [billable, setBillable] = useState<boolean>(true);
    const [activity, setActivity] = useState<string[]>([]);

    const handleEstTimeChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      let newValue = event.target.value;
      newValue.length > 0 && setEstTimeError(false);
      newValue = newValue.replace(/\D/g, "");
      if (newValue.length > 8) {
        return;
      }

      let formattedValue = "";
      if (newValue.length >= 1) {
        const hours = parseInt(newValue.slice(0, 2));
        if (hours >= 0 && hours <= 23) {
          formattedValue = newValue.slice(0, 2);
        } else {
          formattedValue = "23";
        }
      }

      if (newValue.length >= 3) {
        const minutes = parseInt(newValue.slice(2, 4));
        if (minutes >= 0 && minutes <= 59) {
          formattedValue += ":" + newValue.slice(2, 4);
        } else {
          formattedValue += ":59";
        }
      }

      if (newValue.length >= 5) {
        const seconds = parseInt(newValue.slice(4, 6));
        if (seconds >= 0 && seconds <= 59) {
          formattedValue += ":" + newValue.slice(4, 6);
        } else {
          formattedValue += ":59";
        }
      }
      setEstTime(formattedValue);
    };

    const initialInputList = activity.map((activityName) => ({
      activityName: activityName,
    }));

    const [inputList, setInputList] =
      useState<{ activityName: string }[]>(initialInputList);

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      if (e.target) {
        const { value } = e.target;
        const isValidInput = /^[a-zA-Z0-9\s,]*$/.test(value);

        if (isValidInput && value.trim().length <= 50) {
          const updatedInputList = [...inputList];
          updatedInputList[index].activityName = value.trim();
          setInputList(updatedInputList);

          const updatedActivity = [...activity];
          updatedActivity[index] = value;
          setActivity(updatedActivity);
        }
      }
    };

    const handleAddClick = () => {
      const newInputList = [...inputList, { activityName: "" }];
      setInputList(newInputList);
    };

    const handleRemoveClick = (index: number) => {
      const updatedInputList = [...inputList];
      updatedInputList.splice(index, 1);
      setInputList(updatedInputList);

      const updatedActivity = [...activity];
      updatedActivity.splice(index, 1);
      setActivity(updatedActivity);
    };

    useEffect(() => {
      const initialInputList = activity.map((activityName) => ({
        activityName: activityName,
      }));
      setInputList(initialInputList);
    }, [activity]);

    function secondsToHHMMSS(seconds: number) {
      const hours = Math.floor(seconds / 3600);
      const remainingSeconds = seconds % 3600;
      const minutes = Math.floor(remainingSeconds / 60);
      const remainingSecondsFinal = remainingSeconds % 60;

      const hoursStr = hours.toString().padStart(2, "0");
      const minsStr = minutes.toString().padStart(2, "0");
      const secsStr = remainingSecondsFinal.toString().padStart(2, "0");

      return `${hoursStr}:${minsStr}:${secsStr}`;
    }

    const fetchEditData = async () => {
      if (onEdit > 0) {
        const params = { ProcessId: onEdit };
        const url = `${process.env.pms_api_url}/process/GetById`;
        const successCallback = async (
          ResponseData: ProcessGetByIdList,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            setTypeOfWork(ResponseData.WorkTypeId);
            setProcessValue(ResponseData.ParentId);
            setSubProcessName(ResponseData.Name);
            setReturnType(
              ResponseData.ReturnType === null
                ? 0
                : ResponseData.ReturnType === 0
                ? 3
                : ResponseData.ReturnType
            );
            const estTimeConverted = secondsToHHMMSS(
              ResponseData.EstimatedHour
            );
            setEstTime(estTimeConverted);
            setActivity(ResponseData.ActivityList);
            setProductive(ResponseData.IsProductive);
            setBillable(ResponseData.IsBillable);
          }
        };
        callAPI(url, params, successCallback, "POST");
      }
    };

    const getDropdownData = async () => {
      const params = { WorkTypeId: typeOfWork };
      const url = `${process.env.pms_api_url}/Process/GetDropdown`;
      const successCallback = (
        ResponseData: Options[],
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setData(ResponseData);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    const handleFormButtonClick = async () => {
      typeOfWork <= 0 && setTypeOfWorkError(true);
      processName.trim().length <= 0 && setProcessNameError(true);
      if (
        typeOfWork > 0 &&
        !typeOfWorkError &&
        !processNameError &&
        processName !== ""
      ) {
        const params = {
          name: processName,
          WorkTypeId: typeOfWork,
          ProcessId: processValue !== 0 ? processValue : 0,
        };
        const url = `${process.env.pms_api_url}/process/SaveParentProcess`;
        const successCallback = async (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(
              `${processValue !== 0 ? "" : "New"} Process ${
                processValue !== 0 ? "Updated" : "added"
              }  successfully.`
            );
            handleClose();
            await onDataFetch?.();
            getDropdownData();
            onEdit && fetchEditData();
          }
        };
        callAPI(url, params, successCallback, "POST");
      }
    };

    const clearData = () => {
      setTypeOfWork(0);
      setTypeOfWorkDropdown([]);
      setData([]);
      setSubProcessName("");
      setReturnType(0);
      setEstTime("");
      setInputList([]);
      setProcessValue(0);
      setActivity([]);
      setEstTime("");
      clearError();
    };

    const clearError = () => {
      setTypeOfWorkError(false);
      setProcessValueError(false);
      setSubProcessNameError(false);
      setReturnTypeError(false);
      setEstTimeError(false);
      !onEdit && setProductive(true);
      !onEdit && setBillable(true);
    };

    const ProcessDataValue = async () => {
      await clearData();
    };

    useImperativeHandle(ref, () => ({
      ProcessDataValue,
    }));

    const handleSubmit = async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      typeOfWork <= 0 && setTypeOfWorkError(true);
      processValue <= 0 && setProcessValueError(true);

      const [hours, minutes, seconds] = estTime.split(":");
      const estTimeTotalSeconds =
        parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
      subProcessName.trim().length <= 0 && setSubProcessNameError(true);
      typeOfWork === 3 && Number(returnType) <= 0 && setReturnTypeError(true);
      estTime.length < 8 && setEstTimeError(true);

      const saveData = () => {
        onChangeLoader(true);
        const params = {
          ProcessId: onEdit > 0 ? onEdit : 0,
          Name: subProcessName.trim(),
          ReturnTypeId:
            typeOfWork !== 3
              ? null
              : Number(returnType) === 3
              ? 0
              : Number(returnType),
          ActivityList: activity
            .map((i: string) =>
              i !== undefined && i.trim().length > 0 ? i.trim() : false
            )
            .filter((j: string | boolean) => j !== false),
          EstimatedHour: estTimeTotalSeconds,
          IsProductive: productive,
          IsBillable: billable,
          ParentId: processValue,
          WorkTypeId: typeOfWork,
        };
        const url = `${process.env.pms_api_url}/process/Save`;
        const successCallback = async (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            ProcessDataValue();
            onDataFetch?.();
            onChangeLoader(false);
            toast.success(
              `${onEdit > 0 ? "" : "New"} Process ${
                onEdit > 0 ? "Updated" : "added"
              }  successfully.`
            );
            {
              !addMoreClicked && onClose();
            }
            clearData();
          } else {
            onChangeLoader(false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      };

      if (
        typeOfWork > 0 &&
        typeOfWork === 3 &&
        !typeOfWorkError &&
        processValue > 0 &&
        subProcessName.trim().length > 0 &&
        returnType > 0 &&
        estTime !== "00:00:00" &&
        estTime !== "" &&
        estTime.length >= 8 &&
        estTimeTotalSeconds > 0 &&
        !processValueError &&
        !subProcessNameError &&
        !returnTypeError &&
        !estTimeError
      ) {
        saveData();
      } else if (
        typeOfWork > 0 &&
        typeOfWork !== 3 &&
        !typeOfWorkError &&
        processValue > 0 &&
        subProcessName.trim().length > 0 &&
        estTime !== "00:00:00" &&
        estTime !== "" &&
        estTime.length >= 8 &&
        estTimeTotalSeconds > 0 &&
        !processValueError &&
        !subProcessNameError &&
        !estTimeError
      ) {
        saveData();
      }
    };

    if (inputList.length === 0) {
      setInputList([{ activityName: "" }]);
    }

    const getWorkTypeData = async () => {
      const params = {
        ClientId: null,
        OrganizationId: await localStorage.getItem("Org_Id"),
      };
      const url = `${process.env.pms_api_url}/WorkType/GetDropdown`;
      const successCallback = async (
        ResponseData: Options[],
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setTypeOfWorkDropdown(ResponseData);
        } else {
          onChangeLoader(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    useEffect(() => {
      clearError();
      onOpen && typeOfWorkDropdown.length <= 0 && getWorkTypeData();
      onOpen && typeOfWork > 0 && getDropdownData();
    }, [onEdit, onOpen, typeOfWork]);

    useEffect(() => {
      // clearError();
      if (onEdit <= 0) {
        onOpen && setActivity([]);
      } else {
        onOpen && fetchEditData();
      }
    }, [onEdit, onOpen]);

    const handleBillableChange = (value: string) => {
      const isBillable = value === "billable";
      setBillable(isBillable);
    };

    const handleProductiveChange = (id: string) => {
      if (id === "p1") {
        setProductive(true);
      } else {
        setProductive(false);
        setBillable(false);
      }
    };

    const handleClose = () => {
      toggleOpen(false);
      setEditDialogOpen(false);
    };

    const handleProcess = (e: React.SyntheticEvent, value: any) => {
      if (value !== null) {
        if (typeof value.value == "string") {
          toggleOpen(true);
          setProcessName(value.value);
          setProcessValue(0);
        }
        if (value !== null && typeof value.value == "number") {
          const selectedValue = value.value;
          setProcessValue(selectedValue);
          setProcessValueError(false);
        } else {
          setProcessValue(0);
        }
      }
    };

    const handleProcessName = (e: string) => {
      if (e.trim() === "" || e.trim().length <= 0) {
        setProcessName(e);
        setProcessNameError(true);
        setProcessNameErrText("This is required field.");
      } else {
        setProcessName(e);
        setProcessNameError(false);
        setProcessNameErrText("");
      }
    };

    const handleValueChange = (
      isDeleteOpen: boolean,
      selectedRowId: number
    ) => {
      onValuesChange(selectedRowId, isDeleteOpen);
    };

    interface CheckboxComponentParams {
      id: string;
      name: string;
      checked: boolean;
      onChangeFunction: () => void;
      value: string;
      label: string;
      disabled?: boolean;
    }

    const CheckboxComponent = ({
      id,
      name,
      checked,
      onChangeFunction,
      value,
      label,
      disabled,
    }: CheckboxComponentParams) => (
      <div className="checkboxRadio">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChangeFunction}
          value={value}
          disabled={disabled}
        />
        <span>{label}</span>
      </div>
    );

    return (
      <>
        <form className="max-h-[78vh] overflow-y-auto" onSubmit={handleSubmit}>
          <div className="flex flex-col my-5 px-[20px]">
            <FormControl variant="standard" error={typeOfWorkError}>
              <InputLabel id="demo-simple-select-standard-label">
                Type of Work
                <span className="text-defaultRed">&nbsp;*</span>
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={typeOfWork === 0 ? "" : typeOfWork}
                onChange={(e) => {
                  setTypeOfWork(Number(e.target.value));
                  setProcessValue(0);
                  setProcessValueError(false);
                  setProcessNameError(false);
                  setProcessNameErrText("");
                  setSubProcessName("");
                  setSubProcessNameError(false);
                  setReturnType(0);
                  setReturnTypeError(false);
                  Number(e.target.value) > 0 && setTypeOfWorkError(false);
                }}
                onBlur={() => {
                  if (typeOfWork > 0) {
                    setTypeOfWorkError(false);
                  }
                }}
              >
                {typeOfWorkDropdown.map((i: Options, index: number) => (
                  <MenuItem value={i.value} key={index}>
                    {i.label}
                  </MenuItem>
                ))}
              </Select>
              {typeOfWorkError && (
                <FormHelperText>This is a required field.</FormHelperText>
              )}
            </FormControl>
          </div>

          <div className="flex flex-col px-[20px]">
            <Autocomplete
              className={`${processValueError ? "errorAutocomplete" : ""}`}
              limitTags={2}
              id="checkboxes-tags-demo"
              options={data}
              value={
                processValue !== 0
                  ? data.find((option: any) => option.value === processValue) ||
                    null
                  : null
              }
              getOptionLabel={(option: any) => option.label}
              onChange={handleProcess}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                if (params.inputValue !== "") {
                  const isExistingProject = options.some(
                    (option) =>
                      option.label.toLowerCase() ===
                      params.inputValue.toLowerCase()
                  );

                  if (!isExistingProject && onEdit <= 0) {
                    filtered.push({
                      label: `Add "${params.inputValue}"`,
                      value: params.inputValue,
                    });
                  }
                }

                return filtered;
              }}
              renderOption={(props, option) => {
                const isItemHovered = option === hoveredItem;

                const handleEditClick = () => {
                  setProcessName(option.label);
                  setEditDialogOpen(true);
                };

                const handleDeleteClick = () => {
                  handleValueChange(true, Number(option.value));
                };

                return (
                  <li
                    {...props}
                    onMouseEnter={() => setHoveredItem(option)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {option.label}
                    {isItemHovered && (
                      <div className="flex justify-center items-center">
                        <span
                          className="absolute right-3"
                          onClick={handleDeleteClick}
                        >
                          <Delete />
                        </span>
                        <span
                          className="absolute right-10 pt-1"
                          onClick={handleEditClick}
                        >
                          <Edit />
                        </span>
                      </div>
                    )}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <span>
                      Process
                      <span className="text-defaultRed">&nbsp;*</span>
                    </span>
                  }
                  placeholder="Please Select..."
                  variant="standard"
                />
              )}
            />
            {processValueError && (
              <span className="text-[#D32F2F] text-[14px] mt-1">
                {processNameErrText}
              </span>
            )}
          </div>

          <div className="flex flex-col px-[20px]">
            <TextField
              label={
                <span>
                  Sub-Process Name
                  <span className="!text-defaultRed">&nbsp;*</span>
                </span>
              }
              autoComplete="off"
              fullWidth
              className="pt-1"
              value={subProcessName?.trim().length <= 0 ? "" : subProcessName}
              onChange={(e) => {
                setSubProcessName(e.target.value);
                setSubProcessNameError(false);
              }}
              onBlur={(e) => {
                if (
                  e.target.value.trim().length <= 0 ||
                  e.target.value.trim().length > 50
                ) {
                  setSubProcessNameError(false);
                }
              }}
              error={subProcessNameError}
              helperText={
                subProcessNameError && subProcessName?.trim().length > 50
                  ? "Maximum 50 characters allowed."
                  : subProcessNameError
                  ? "This is a required field."
                  : ""
              }
              margin="normal"
              variant="standard"
            />
          </div>
          {typeOfWork === 3 && (
            <div className="flex flex-col px-[20px] mt-2">
              <FormControl variant="standard" error={returnTypeError}>
                <InputLabel id="demo-simple-select-standard-label">
                  Return Type
                  <span className="text-defaultRed">&nbsp;*</span>
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={returnType === 0 ? "" : returnType}
                  onChange={(e) => setReturnType(Number(e.target.value))}
                  onBlur={() => {
                    if (returnType > 0) {
                      setReturnTypeError(false);
                    }
                  }}
                >
                  {returnTypeDrpdown.map((i: LabelValue, index: number) => (
                    <MenuItem value={i.value} key={index}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
                {returnTypeError && (
                  <FormHelperText>This is a required field.</FormHelperText>
                )}
              </FormControl>
            </div>
          )}
          <div className="flex flex-col px-[20px]">
            <TextField
              label={
                <span>
                  Estimated Time (HH:MM:SS)
                  <span className="!text-defaultRed">&nbsp;*</span>
                </span>
              }
              autoComplete="off"
              placeholder="00:00:00"
              fullWidth
              value={estTime}
              onChange={handleEstTimeChange}
              onBlur={(e) => {
                if (e.target.value.trim().length < 7) {
                  setEstTimeError(true);
                }
              }}
              error={estTimeError}
              helperText={
                estTime.trim().length > 0 &&
                estTime.trim().length < 8 &&
                estTimeError
                  ? "Start time must be in HH:MM:SS"
                  : estTime.trim().length <= 0 && estTimeError
                  ? "This is a required field"
                  : ""
              }
              margin="normal"
              variant="standard"
            />
          </div>

          <div className="flex flex-col px-[20px] mb-4">
            {inputList.map((inputItem, i) => (
              <>
                <span
                  key={`input-${i}`}
                  className={`flex items-center ${i > 0 && "!mt-[-15px]"}`}
                >
                  <TextField
                    label="Activities"
                    fullWidth
                    value={
                      inputItem?.activityName?.trim().length <= 0
                        ? ""
                        : inputItem?.activityName
                    }
                    onChange={(e: any) => handleInputChange(e, i)}
                    margin="normal"
                    variant="standard"
                    autoComplete="off"
                  />
                  <div className="btn-box">
                    {i === 0 ? (
                      <span className="cursor-pointer" onClick={handleAddClick}>
                        <PlusIcon />
                      </span>
                    ) : (
                      <span
                        className="cursor-pointer"
                        onClick={() => handleRemoveClick(i)}
                      >
                        <MinusIcon />
                      </span>
                    )}
                  </div>
                </span>
              </>
            ))}
          </div>
          <span className="flex items-center pr-[20px] pl-[20px] pb-[20px] gap-[100px]">
            <CheckboxComponent
              id="p1"
              name="group1"
              checked={productive}
              onChangeFunction={() => handleProductiveChange("p1")}
              value="productive"
              label="Productive"
            />
            <CheckboxComponent
              id="non_p1"
              name="group1"
              checked={!productive}
              onChangeFunction={() => handleProductiveChange("non_p1")}
              value="non_productive"
              label="Non-Productive"
            />
          </span>
          <span className="flex items-center pr-[20px] pl-[20px] pb-[20px] gap-[123px]">
            <CheckboxComponent
              id="billable"
              name="group2"
              checked={billable}
              onChangeFunction={() => handleBillableChange("billable")}
              value="billable"
              label="Billable"
              disabled={!productive}
            />
            <CheckboxComponent
              id="non_billable"
              name="group2"
              checked={!billable}
              onChangeFunction={() => handleBillableChange("non_billable")}
              value="non_billable"
              label="Non-Billable"
              disabled={!productive}
            />
          </span>

          {/* Footer */}
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
                  type="submit"
                  variant="outlined"
                  className="rounded-[4px] !h-[36px] !text-secondary cursor-pointer"
                  onClick={() => setAddMoreClicked(true)}
                >
                  Add More
                </Button>
              )}
              <Button
                variant="contained"
                className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
                type="submit"
                onClick={() => setAddMoreClicked(false)}
              >
                {onEdit > 0 ? "Save" : `Create Process`}
              </Button>
            </>
          </div>
        </form>

        <Dialog open={editDialogOpen || open} onClose={handleClose}>
          <DialogTitle>
            {editDialogOpen ? "Edit Process" : "Add a new Process"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {editDialogOpen
                ? "Are you sure you want to update this Process?"
                : "Are you sure you want to add this Process?"}
            </DialogContentText>
            <TextField
              className="w-full"
              value={processName}
              error={processNameError}
              helperText={processNameError && processNameErrText}
              id="standard-basic"
              label="Process"
              placeholder={
                editDialogOpen ? "Edit a process" : "Add new process"
              }
              variant="standard"
              onChange={(e) => handleProcessName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              variant="outlined"
              className="rounded-[4px] !h-[36px]"
            >
              Close
            </Button>
            <Button
              variant="contained"
              className="rounded-[4px] !h-[36px] !bg-[#0592c6]"
              type="button"
              onClick={handleFormButtonClick}
            >
              {editDialogOpen ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

export default ProcessContent;
