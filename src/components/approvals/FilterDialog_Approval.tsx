import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FormControl, InputLabel, MenuItem } from "@mui/material";
import Select from "@mui/material/Select";
import {
  getCCDropdownData,
  getClientDropdownData,
  getProcessDropdownData,
  getProjectDropdownData,
  getStatusDropdownData,
} from "@/utils/commonDropdownApiCall";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { isWeekend } from "@/utils/commonFunction";

interface FilterModalProps {
  activeTab: number;
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onDataFetch: () => void;
  currentFilterData?: any;
}

const initialFilter = {
  ClientId: null,
  userId: null,
  ProjectId: null,
  ProcessId: null,
  StatusId: null,
  dueDate: null,
  startDate: null,
  endDate: null,
};

const FilterDialog_Approval: React.FC<FilterModalProps> = ({
  activeTab,
  onOpen,
  onClose,
  currentFilterData,
}) => {
  const [clientName, setClientName] = useState<any>(0);
  const [userName, setUser] = useState<number | string>(0);
  const [projectName, setProjectName] = useState<number | string>(0);
  const [status, setStatus] = useState<number | string>(0);
  const [processName, setProcessName] = useState<number | string>(0);
  const [clientDropdownData, setClientDropdownData] = useState([]);
  const [userDropdownData, setUserData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [anyFieldSelected, setAnyFieldSelected] = useState<any>(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<any | any[]>([]);
  const [statusDropdownData, setStatusDropdownData] = useState([]);
  const [processDropdownData, setProcessDropdownData] = useState([]);
  const [dueDate, setDueDate] = useState<null | string>(null);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);

  const sendFilterToPage = () => {
    currentFilterData(currSelectedFields);
    onClose();
  };

  const handleResetAll = () => {
    setClientName(0);
    setUser(0);
    setProjectName(0);
    setProjectDropdownData([]);
    setStatus(0);
    setDueDate(null);
    setStartDate(null);
    setEndDate(null);
    setProcessName(0);
    setProcessDropdownData([]);
    currentFilterData(initialFilter);
  };

  const handleClose = () => {
    handleResetAll();
    onClose();
  };

  const getDropdownData = async () => {
    setClientDropdownData(await getClientDropdownData());
    setUserData(await getCCDropdownData());
    const data = await getStatusDropdownData();
    data.length > 0 &&
      setStatusDropdownData(
        activeTab === 1
          ? data.filter(
              (item: any) =>
                item.Type === "InReview" ||
                item.Type === "OnHoldFromClient" ||
                item.Type === "ReworkInReview" ||
                item.Type === "Submitted" ||
                item.Type === "ReworkSubmitted" ||
                item.Type === "SecondManagerReview" ||
                item.Type === "WithDraw" ||
                item.Type === "WithdrawnbyClient"
            )
          : data
      );
  };

  const getAllData = async (clientName: any) => {
    setProcessDropdownData(await getProcessDropdownData(clientName));
    setProjectDropdownData(await getProjectDropdownData(clientName));
  };

  useEffect(() => {
    if (onOpen === true) {
      getDropdownData();
    }
  }, [onOpen]);

  useEffect(() => {
    clientName > 0 && getAllData(clientName);
  }, [clientName]);

  useEffect(() => {
    const isAnyFieldSelected: any =
      clientName !== 0 ||
      userName !== 0 ||
      projectName !== 0 ||
      status !== 0 ||
      processName !== 0 ||
      dueDate !== null ||
      startDate !== null ||
      endDate !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [
    clientName,
    userName,
    projectName,
    processName,
    status,
    dueDate,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    const selectedFields = {
      ClientId: clientName || null,
      userId: userName || null,
      ProjectId: projectName || null,
      StatusId: status || null,
      ProcessId: processName || null,
      startDate:
        startDate !== null
          ? new Date(
              new Date(startDate).getTime() + 24 * 60 * 60 * 1000
            )?.toISOString()
          : null,
      dueDate:
        dueDate !== null
          ? new Date(
              new Date(dueDate).getTime() + 24 * 60 * 60 * 1000
            )?.toISOString()
          : null,
      endDate:
        endDate !== null
          ? new Date(
              new Date(endDate).getTime() + 24 * 60 * 60 * 1000
            )?.toISOString()
          : null,
    };
    setCurrSelectedFileds(selectedFields);
  }, [
    clientName,
    userName,
    projectName,
    processName,
    status,
    dueDate,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    handleResetAll();
  }, [activeTab]);

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="md"
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Filter</span>
          <Button color="error" onClick={handleResetAll}>
            Reset all
          </Button>
        </DialogTitle>

        <DialogContent>
          <div className="flex flex-col gap-[20px] pt-[15px]">
            <div className="flex gap-[20px]">
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 200 }}>
                <InputLabel id="client_Name">Client Name</InputLabel>
                <Select
                  labelId="client_Name"
                  id="client_Name"
                  value={clientName === 0 ? "" : clientName}
                  onChange={(e) => setClientName(e.target.value)}
                >
                  {clientDropdownData.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 200 }}>
                <InputLabel id="employee">Employee Name</InputLabel>
                <Select
                  labelId="employee"
                  id="employee"
                  value={userName === 0 ? "" : userName}
                  onChange={(e) => setUser(e.target.value)}
                >
                  {userDropdownData.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 200 }}>
                <InputLabel id="project_Name">Project Name</InputLabel>
                <Select
                  labelId="project_Name"
                  id="project_Name"
                  value={projectName === 0 ? "" : projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                >
                  {projectDropdownData.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="flex gap-[20px]">
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 200 }}>
                <InputLabel id="process_Name">Process Name</InputLabel>
                <Select
                  labelId="process_Name"
                  id="process_Name"
                  value={processName === 0 ? "" : processName}
                  onChange={(e) => setProcessName(e.target.value)}
                >
                  {processDropdownData.map((i: any) => (
                    <MenuItem value={i.Id} key={i.Id}>
                      {i.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 200 }}>
                <InputLabel id="status">Status</InputLabel>
                <Select
                  labelId="status"
                  id="status"
                  value={status === 0 ? "" : status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusDropdownData.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {activeTab === 2 && (
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[200px] max-w-[300px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Due Date"
                      value={dueDate === null ? null : dayjs(dueDate)}
                      onChange={(newDate: any) => {
                        setDueDate(newDate.$d);
                      }}
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
              )}
            </div>
            {activeTab === 2 && (
              <div className="flex gap-[20px]">
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[200px] max-w-[300px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From"
                      value={startDate === null ? null : dayjs(startDate)}
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      onChange={(newDate: any) => {
                        setStartDate(newDate.$d);
                      }}
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[200px] max-w-[300px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="To"
                      value={endDate === null ? null : dayjs(endDate)}
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      onChange={(newDate: any) => {
                        setEndDate(newDate.$d);
                      }}
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
          <Button
            variant="contained"
            color="info"
            className={`${anyFieldSelected && "!bg-secondary"}`}
            disabled={!anyFieldSelected}
            onClick={sendFilterToPage}
          >
            Apply Filter
          </Button>

          <Button variant="outlined" color="info" onClick={() => onClose()}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilterDialog_Approval;
