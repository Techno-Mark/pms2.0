import EditIcon from "@/assets/icons/EditIcon";
import axios from "axios";
import { CheckBox, DataTable, Text } from "next-ts-lib";
import React, { useEffect, useState } from "react";
import Select from "@mui/material/Select";
import {
  Button,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { toast } from "react-toastify";
import OverLay from "@/components/common/OverLay";
import { callAPI } from "@/utils/API/callAPI";
import { Close, Save } from "@mui/icons-material";
import SearchIcon from "@/assets/icons/SearchIcon";
import { LabelValue } from "@/utils/Types/types";
import { getDepartmentDataByClient } from "@/utils/commonDropdownApiCall";

interface List {
  Id: number;
  Process: string;
  SubProcess: string;
  EstimatedHour: number;
  IsProductive: boolean;
  IsBillable: boolean;
  IsClientProcess: boolean;
}

const ClientProcessDrawer = ({
  onOpen,
  onClose,
  selectedRowId,
  onDataFetch,
}: {
  onOpen: boolean;
  onClose: () => void;
  selectedRowId: number | null;
  onDataFetch: () => void;
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingClientProcess, setIsLoadingClientProcess] = useState(false);
  const [typeOfWorkDropdown, setTypeOfWorkDropdown] = useState<LabelValue[]>(
    []
  );
  const [typeOfWork, setTypeOfWork] = useState(0);
  const [departmentDropdown, setDepartmentDropdown] = useState<LabelValue[]>(
    []
  );
  const [department, setDepartment] = useState(0);
  const [clientProcessData, setClientProcessData] = useState([]);
  const [thisclientProcess, setThisClientProcess] = useState([]);
  const [stndrdTime, setStndrdTime] = useState<any>([]);
  const [processType, setProcessType] = useState<any>([]);
  const [billableType, setBillableType] = useState<any>([]);

  const [selectedRowsData, setSelectedRowsData] = useState<any[]>([]);
  const [editingRows, setEditingRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  const checkAllCheked = Object.values(thisclientProcess).every(
    (value) => value === true
  );

  const handleSelectAll = () => {
    const updatedClientProcess: any = { ...thisclientProcess };
    const updatedRowsData = [...selectedRowsData];

    for (const id in updatedClientProcess) {
      updatedClientProcess[id] = !checkAllCheked;
    }

    setThisClientProcess(updatedClientProcess);

    if (!checkAllCheked) {
      clientProcessData.forEach((item: List) => {
        if (!updatedRowsData.some((data) => data.id === item.Id)) {
          const estimatedTime = stndrdTime[item.Id] || "00:00:00";
          const [hours, minutes, seconds] = estimatedTime.split(":");
          const estTimeTotalSeconds =
            parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

          updatedRowsData.push({
            id: item.Id,
            estimatedHour: estTimeTotalSeconds,
            isProductive: processType[item.Id] || false,
            isBillable: billableType[item.Id] || false,
            isActive: true,
          });
        }
      });
    } else {
      updatedRowsData.length = 0;
    }

    setSelectedRowsData(updatedRowsData);
  };

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

  const handleEstTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    dId: string
  ) => {
    let newValue = event.target.value;
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

    let totalSeconds = 0;

    if (formattedValue) {
      const timeComponents = formattedValue.split(":");
      const hours = parseInt(timeComponents[0]);
      const minutes = parseInt(timeComponents[1]);
      const seconds = parseInt(timeComponents[2]);
      totalSeconds = hours * 3600 + minutes * 60 + seconds;
    }
    setStndrdTime((prevStndrdTime: any) => ({
      ...prevStndrdTime,
      [dId]: formattedValue,
    }));
  };

  const headers = [
    {
      header: (
        <CheckBox
          id="select-all"
          checked={checkAllCheked}
          onChange={handleSelectAll}
        />
      ),
      accessor: "Check",
      sortable: false,
    },
    { header: "Process", accessor: "Process", sortable: true },
    { header: "Sub-Process", accessor: "SubProcess", sortable: true },
    { header: "Standard Hrs.", accessor: "EstimatedHour", sortable: false },
    { header: "Process Type", accessor: "IsProductive", sortable: false },
    { header: "Bill Type", accessor: "IsBillable", sortable: false },
    { header: "Actions", accessor: "actions", sortable: false },
  ];

  const handleClose = () => {
    setSearchValue("");
    setSelectedRowsData([]);
    onClose();
    setEditingRows({});
  };

  const handleSubmit = () => {
    if (selectedRowsData.length === 0) {
      toast.error("Please select a Process.");
      return false;
    }

    const timeStringToSeconds = (timeString: string) => {
      if (
        !timeString ||
        typeof timeString !== "string" ||
        !timeString.match(/^\d{2}:\d{2}:\d{2}$/)
      ) {
        return 0;
      }

      const timeComponents = timeString.split(":");
      const hours = parseInt(timeComponents[0], 10);
      const minutes = parseInt(timeComponents[1], 10);
      const seconds = parseInt(timeComponents[2], 10);
      return hours * 3600 + minutes * 60 + seconds;
    };

    const editedData = selectedRowsData.map((item) => ({
      Id: item.Id,
      EstimatedHour: timeStringToSeconds(stndrdTime[item.Id]),
      IsProductive: processType[item.Id],
      IsBillable: billableType[item.Id],
    }));

    setSelectedRowsData(editedData);
    saveProcess();
  };

  const saveProcess = async () => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");

    try {
      setIsLoadingClientProcess(true);
      const response = await axios.post(
        `${process.env.pms_api_url}/client/SaveClientProcess`,
        {
          clientId: selectedRowId,
          Processes: selectedRowsData,
        },
        {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
        }
      );

      if (response.status === 200) {
        if (response.data.ResponseStatus === "Success") {
          toast.success("Process updated successfully.");
          handleClose();
          onDataFetch();
          setIsLoadingClientProcess(false);
        } else {
          handleClose();
          const data = response.data.Message;
          if (data === null) {
            toast.error("Please try again later.");
          } else {
            toast.error(data);
          }
          setIsLoadingClientProcess(false);
        }
      } else {
        handleClose();
        const data = response.data.Message;
        if (data === null) {
          toast.error("Failed Please try again.");
        } else {
          toast.error(data);
        }
        setIsLoadingClientProcess(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getWorkTypeData = async () => {
    const params = {
      clientId: selectedRowId || 0,
    };
    const url = `${process.env.pms_api_url}/WorkType/GetDropdown`;
    const successCallback = (
      ResponseData: LabelValue[],
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

  const getDepartmentData = async () => {
    const data = await getDepartmentDataByClient(selectedRowId || 0);
    setDepartmentDropdown(data);
    setDepartment(data[0].value);
  };

  const getProcessByClient = async () => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");

    try {
      const response = await axios.post(
        `${process.env.pms_api_url}/client/GetClientProcess`,
        {
          clientId: selectedRowId || 0,
          WorkTypeId: typeOfWork,
          DepartmentId: department,
          globalSearch: searchValue,
        },
        {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
        }
      );

      if (response.status === 200) {
        if (response.data.ResponseStatus === "Success") {
          setClientProcessData(response.data.ResponseData);
          const stndrdTimeData: any = {};
          const processTypeData: any = {};
          const billableTypeData: any = {};
          const isClientProcess: any = {};
          response.data.ResponseData.forEach((item: List) => {
            stndrdTimeData[item.Id] = secondsToHHMMSS(item.EstimatedHour);
            processTypeData[item.Id] = item.IsProductive;
            billableTypeData[item.Id] = item.IsBillable;
            isClientProcess[item.Id] = item.IsClientProcess;
          });
          setStndrdTime(stndrdTimeData);
          setProcessType(processTypeData);
          setBillableType(billableTypeData);
          setThisClientProcess(isClientProcess);
        } else {
          const data = response.data.Message;
          if (data === null) {
            toast.error("Please try again later.");
          } else {
            toast.error(data);
          }
        }
      } else {
        const data = response.data.Message;
        if (data === null) {
          toast.error("Failed Please try again.");
        } else {
          toast.error(data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedRowId && onOpen) {
      getWorkTypeData();
      getDepartmentData();
    }
  }, [selectedRowId, onOpen]);

  useEffect(() => {
    if (typeOfWork > 0 && department > 0) {
      getProcessByClient();
    }
  }, [typeOfWork, department, onOpen, searchValue]);

  const handleActionValue = (id: number) => {
    setEditingRows((prevEditingRows) => ({
      ...prevEditingRows,
      [id]: !prevEditingRows[id],
    }));
  };

  const handleAddProcessData = (id: number) => {
    const existingIndex = selectedRowsData.findIndex(
      (data: any) => data.id === id
    );

    const estimatedTime = stndrdTime[id] || "00:00:00";
    const [hours, minutes, seconds] = estimatedTime.split(":");
    const estTimeTotalSeconds =
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

    const updatedRow = {
      id: id,
      estimatedHour: estTimeTotalSeconds,
      isProductive: processType[id] || false,
      isBillable: billableType[id] || false,
      isActive: !thisclientProcess[id],
    };

    const updatedRowsData = [...selectedRowsData];
    if (existingIndex !== -1) {
      updatedRowsData[existingIndex] = updatedRow;
    } else {
      updatedRowsData.push(updatedRow);
    }

    setSelectedRowsData(updatedRowsData);

    setThisClientProcess((prevClientProcess: any) => ({
      ...prevClientProcess,
      [id]: !thisclientProcess[id],
    }));
  };

  const handleUpdateProcessData = (id: number) => {
    const existingIndex = selectedRowsData.findIndex(
      (data: any) => data.id === id
    );

    const estimatedTime = stndrdTime[id] || "00:00:00";
    const [hours, minutes, seconds] = estimatedTime.split(":");
    const estTimeTotalSeconds =
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

    const updatedRow = {
      id: id,
      estimatedHour: estTimeTotalSeconds,
      isProductive: processType[id] || false,
      isBillable: billableType[id] || false,
      isActive: true,
    };

    const updatedRowsData = [...selectedRowsData];
    if (existingIndex !== -1) {
      updatedRowsData[existingIndex] = updatedRow;
    } else {
      updatedRowsData.push(updatedRow);
    }

    setSelectedRowsData(updatedRowsData);

    setThisClientProcess((prevClientProcess: any) => ({
      ...prevClientProcess,
      [id]: true,
    }));
  };

  const table_Data = clientProcessData.map(
    (d: List) =>
      new Object({
        ...d,
        Check: (
          <div>
            <CheckBox
              className="checkboxCssChange"
              id={d.Id.toString()}
              checked={thisclientProcess[d.Id]}
              onChange={() => handleAddProcessData(d.Id)}
            />
          </div>
        ),

        EstimatedHour: (
          <div className="w-36">
            <Text
              value={stndrdTime[d.Id] || ""}
              getValue={(e) => setStndrdTime({ ...stndrdTime, [d.Id]: e })}
              getError={() => {}}
              errorMessage={""}
              hasError={false}
              disabled={!editingRows[d.Id]}
              onChange={(event) => handleEstTimeChange(event, d.Id.toString())}
              className="[appearance:number] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        ),
        IsProductive: (
          <Select
            className="w-36"
            variant="standard"
            value={processType[d.Id]}
            onChange={(e) =>
              setProcessType({ ...processType, [d.Id]: e.target.value })
            }
            disabled={!editingRows[d.Id]}
          >
            <MenuItem value={"true"}>Productive</MenuItem>
            <MenuItem value={"false"}>Non-Productive</MenuItem>
          </Select>
        ),
        IsBillable: (
          <Select
            className="w-36"
            variant="standard"
            value={billableType[d.Id]}
            onChange={(e) =>
              setBillableType({ ...billableType, [d.Id]: e.target.value })
            }
            disabled={!editingRows[d.Id]}
          >
            <MenuItem value={"true"}>Billable</MenuItem>
            <MenuItem value={"false"}>Non-Billable</MenuItem>
          </Select>
        ),
        actions: (
          <div
            onClick={() => handleActionValue(d.Id)}
            className="cursor-pointer w-[66px] h-8 flex justify-center"
          >
            {editingRows[d.Id] ? (
              <>
                <Tooltip title="Save" placement="top" arrow>
                  <Button
                    variant="contained"
                    className="rounded-[4px] !h-[32px] !bg-secondary cursor-pointer"
                    onClick={() => handleUpdateProcessData(d.Id)}
                  >
                    <Save />
                  </Button>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Edit" placement="top" arrow>
                <Button
                  variant="contained"
                  className="rounded-[4px] !h-[32px] !bg-secondary cursor-pointer"
                >
                  <EditIcon />
                </Button>
              </Tooltip>
            )}
          </div>
        ),
      })
  );

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-30 h-screen overflow-y-auto w-[80vw] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex p-[20px] justify-between items-center bg-whiteSmoke border-b border-lightSilver">
          <span className="text-pureBlack text-lg font-medium">
            Edit Process
          </span>
          <div className="flex items-center">
            <div className="relative mt-[18px] mr-4">
              <InputBase
                className="pl-1 pr-7 border-b border-b-lightSilver w-56"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <span className="absolute top-2 right-2 text-slatyGrey">
                <SearchIcon />
              </span>
            </div>
            <FormControl
              variant="standard"
              sx={{ width: 210, mt: -0.3, my: -1, mx: 0.75, mr: 4 }}
            >
              <InputLabel id="demo-simple-select-standard-label">
                Type Of Work
                <span className="text-defaultRed">&nbsp;*</span>
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={typeOfWork === 0 ? "" : typeOfWork}
                onChange={(e) => {
                  setTypeOfWork(Number(e.target.value));
                  setSearchValue("");
                }}
              >
                {typeOfWorkDropdown.map((i: LabelValue, index: number) => (
                  <MenuItem value={i.value} key={index}>
                    {i.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              variant="standard"
              sx={{ width: 210, mt: -0.3, my: -1, mx: 0.75, mr: 4 }}
            >
              <InputLabel id="demo-simple-select-standard-label">
                Department
                <span className="text-defaultRed">&nbsp;*</span>
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={department === 0 ? "" : department}
                onChange={(e) => {
                  setDepartment(Number(e.target.value));
                  setSearchValue("");
                }}
              >
                {departmentDropdown.map((i: LabelValue, index: number) => (
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

        {table_Data.length > 0 ? (
          <div className="px-2 py-2 mb-10 h-[81vh] max-h-[73.5vh] overflow-y-auto">
            <DataTable columns={headers} data={table_Data} />
          </div>
        ) : (
          <span className="flex items-center justify-center mt-8">
            No Data Found.
          </span>
        )}

        <div className="flex justify-end fixed w-full bottom-0 gap-[20px] px-[20px] py-[15px] bg-pureWhite border-t border-lightSilver">
          <Button
            variant="outlined"
            className="rounded-[4px] !h-[36px] !text-secondary"
            onClick={handleClose}
          >
            Close
          </Button>

          <Button
            variant="contained"
            className={`rounded-[4px] !h-[36px] ${
              selectedRowsData.length !== 0 && "!bg-secondary"
            } cursor-pointer`}
            type="submit"
            onClick={() => {
              handleSubmit();
            }}
            disabled={selectedRowsData.length === 0}
          >
            Update Process
          </Button>
        </div>
      </div>
      {isLoadingClientProcess ? <OverLay /> : ""}
    </>
  );
};

export default ClientProcessDrawer;
