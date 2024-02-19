import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import Select from "@mui/material/Select";
import {
  getCCDropdownData,
  getClientDropdownData,
  getProcessDropdownData,
  getProjectDropdownData,
  getStatusDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { isWeekend } from "@/utils/commonFunction";
import { getFormattedDate } from "@/utils/timerFunctions";

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
  TypeOfWork: null,
  userId: null,
  ProjectId: null,
  ProcessId: null,
  StatusId: null,
  dueDate: null,
  startDate: null,
  endDate: null,
  DateFilter: null,
};

const FilterDialog_Approval: React.FC<FilterModalProps> = ({
  activeTab,
  onOpen,
  onClose,
  currentFilterData,
}) => {
  const [clientName, setClientName] = useState<any>(null);
  const [workType, setWorkType] = useState<any>(null);
  const [userName, setUser] = useState<any>(null);
  const [projectName, setProjectName] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [processName, setProcessName] = useState<any>(null);
  const [clientDropdownData, setClientDropdownData] = useState([]);
  const [worktypeDropdownData, setWorktypeDropdownData] = useState([]);
  const [userDropdownData, setUserData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [anyFieldSelected, setAnyFieldSelected] = useState<any>(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<any | any[]>([]);
  const [statusDropdownData, setStatusDropdownData] = useState([]);
  const [processDropdownData, setProcessDropdownData] = useState([]);
  const [date, setDate] = useState<null | string>(null);
  const [dueDate, setDueDate] = useState<null | string>(null);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);

  const sendFilterToPage = () => {
    currentFilterData(currSelectedFields);
    onClose();
  };

  const handleResetAll = () => {
    setClientName(null);
    setWorkType(null);
    setUser(null);
    setProjectName(null);
    setProcessName(null);
    setStatus(null);
    setDate(null);
    setDueDate(null);
    setStartDate(null);
    setEndDate(null);
    setWorktypeDropdownData([]);
    setProjectDropdownData([]);
    setProcessDropdownData([]);
    setStatusDropdownData([]);
    currentFilterData(initialFilter);
  };

  const handleClose = () => {
    handleResetAll();
    onClose();
  };

  const getDropdownData = async () => {
    setClientDropdownData(await getClientDropdownData());
    setUserData(await getCCDropdownData());
  };

  const getClientData = async (clientName: any) => {
    setWorktypeDropdownData(await getTypeOfWorkDropdownData(clientName));
  };

  const getAllData = async (clientName: any, workType: any) => {
    const processData = await getProcessDropdownData(clientName, workType);
    processData.length > 0 &&
      setProcessDropdownData(
        processData?.map((i: any) => new Object({ label: i.Name, value: i.Id }))
      );
    setProjectDropdownData(await getProjectDropdownData(clientName, workType));
    const statusData = await getStatusDropdownData(workType);

    statusData.length > 0 &&
      setStatusDropdownData(
        activeTab === 1
          ? statusData.filter(
              (item: any) =>
                item.Type === "InReview" ||
                item.Type === "ReworkInReview" ||
                item.Type === "PartialSubmitted" ||
                item.Type === "Submitted" ||
                item.Type === "ReworkSubmitted" ||
                item.Type === "SecondManagerReview"
            )
          : statusData
      );
  };

  useEffect(() => {
    if (onOpen === true) {
      getDropdownData();
    }
  }, [onOpen]);

  useEffect(() => {
    clientName !== null && getClientData(clientName?.value);
  }, [clientName]);

  useEffect(() => {
    clientName !== null &&
      workType !== null &&
      getAllData(clientName?.value, workType?.value);
  }, [clientName, workType]);

  useEffect(() => {
    const isAnyFieldSelected: any =
      clientName !== null ||
      workType !== null ||
      userName !== null ||
      projectName !== null ||
      status !== null ||
      processName !== null ||
      date !== null ||
      dueDate !== null ||
      startDate !== null ||
      endDate !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [
    clientName,
    workType,
    userName,
    projectName,
    processName,
    status,
    date,
    dueDate,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    const selectedFields = {
      ClientId: clientName !== null ? clientName.value : null,
      TypeOfWork: workType !== null ? workType.value : null,
      userId: userName !== null ? userName.value : null,
      ProjectId: projectName !== null ? projectName.value : null,
      StatusId: status !== null ? status.value : null,
      ProcessId: processName !== null ? processName.value : null,
      DateFilter: date !== null ? getFormattedDate(date) : null,
      dueDate: dueDate !== null ? getFormattedDate(dueDate) : null,
      startDate: startDate !== null ? getFormattedDate(startDate) : null,
      endDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
    };
    setCurrSelectedFileds(selectedFields);
  }, [
    clientName,
    workType,
    userName,
    projectName,
    processName,
    status,
    date,
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
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={clientDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setClientName(data);
                    setWorkType(null);
                    setProjectName(null);
                    setProcessName(null);
                    setStatus(null);
                    setProcessName(null);
                  }}
                  value={clientName}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Client Name"
                    />
                  )}
                />
              </FormControl>

              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={worktypeDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setWorkType(data);
                    setProjectName(null);
                    setProcessName(null);
                    setStatus(null);
                  }}
                  value={workType}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Type Of Work"
                    />
                  )}
                />
              </FormControl>

              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={userDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setUser(data);
                  }}
                  value={userName}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Employee Name"
                    />
                  )}
                />
              </FormControl>
            </div>

            <div className="flex gap-[20px]">
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={projectDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setProjectName(data);
                  }}
                  value={projectName}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Project Name"
                    />
                  )}
                />
              </FormControl>

              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={processDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setProcessName(data);
                  }}
                  value={userName}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Process Name"
                    />
                  )}
                />
              </FormControl>

              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, minWidth: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={statusDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setStatus(data);
                  }}
                  value={status}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Status" />
                  )}
                />
              </FormControl>
            </div>
            <div className="flex gap-[20px]">
              {activeTab === 1 && (
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date"
                      value={date === null ? null : dayjs(date)}
                      onChange={(newDate: any) => {
                        setDate(newDate.$d);
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
              {activeTab === 2 && (
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
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
              {activeTab === 2 && (
                <>
                  <div
                    className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
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
                    className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
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
                </>
              )}
            </div>
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
