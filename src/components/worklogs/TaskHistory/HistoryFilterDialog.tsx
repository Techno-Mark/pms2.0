import {
  getClientDropdownData,
  getDepartmentDropdownData,
  getProcessDropdownData,
  getProjectDropdownData,
} from "@/utils/commonDropdownApiCall";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { getFormattedDate } from "@/utils/timerFunctions";
import {
  IdNameEstimatedHour,
  LabelValue,
  LabelValueType,
} from "@/utils/Types/types";
import { AppliedFilterHistoryPage } from "@/utils/Types/worklogsTypes";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData?: any;
}

const initialFilter = {
  ClientId: null,
  ProjectId: null,
  ProcessId: null,
  Department: null,
  StartDate: null,
  EndDate: null,
};

const HistoryFilterDialog = ({
  onOpen,
  onClose,
  currentFilterData,
}: FilterModalProps) => {
  const [clientDropdownData, setClientDropdownData] = useState([]);
  const [projectDropdownData, setProjectDropdownData] = useState([]);
  const [processDropdownData, setProcessDropdownData] = useState([]);
  const [departmentDropdownData, setDepartmentDropdownData] = useState<
    LabelValueType[]
  >([]);

  const [clientName, setClientName] = useState<LabelValue | null>(null);
  const [project, setProject] = useState<LabelValue | null>(null);
  const [process, setProcess] = useState<LabelValue | null>(null);
  const [department, setDepartment] = useState<LabelValueType | null>(null);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<
    AppliedFilterHistoryPage | []
  >([]);

  const handleResetAll = () => {
    setClientName(null);
    setProject(null);
    setProcess(null);
    setDepartment(null);
    setStartDate(null);
    setEndDate(null);
    currentFilterData?.(initialFilter);
  };

  useEffect(() => {
    const isAnyFieldSelected =
      clientName !== null ||
      project !== null ||
      process !== null ||
      department !== null ||
      startDate !== null ||
      endDate !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [clientName, project, process, department, startDate, endDate]);

  useEffect(() => {
    const selectedFields = {
      ClientId: clientName !== null ? clientName.value : null,
      ProjectId: project !== null ? project.value : null,
      ProcessId: process !== null ? process.value : null,
      Department: department !== null ? department.value : null,
      StartDate:
        startDate === null
          ? endDate === null
            ? null
            : getFormattedDate(endDate)
          : getFormattedDate(startDate),
      EndDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
    };
    setCurrSelectedFileds(selectedFields);
  }, [clientName, project, process, department, startDate, endDate]);

  const sendFilterToPage = () => {
    currentFilterData(currSelectedFields);
    onClose();
  };

  const getData = async () => {
    setClientDropdownData(await getClientDropdownData());
    const departmentData = await getDepartmentDropdownData();
    setDepartmentDropdownData(departmentData.DepartmentList);
  };

  const getProjectData = async (clientName: string | number) => {
    setProjectDropdownData(await getProjectDropdownData(clientName, null));
  };

  const getProcessData = async (clientName: string | number) => {
    setProcessDropdownData(
      (await getProcessDropdownData(clientName, null, null))?.map(
        (i: IdNameEstimatedHour) => new Object({ label: i.Name, value: i.Id })
      )
    );
  };

  useEffect(() => {
    if (onOpen === true) {
      getData();
    }
  }, [onOpen]);

  useEffect(() => {
    clientName !== null
      ? getProjectData(clientName?.value)
      : setProjectDropdownData([]);
    clientName !== null
      ? getProcessData(clientName?.value)
      : setProcessDropdownData([]);
  }, [clientName]);
  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="md"
        onClose={() => onClose()}
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
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={clientDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setClientName(data);
                    setProject(null);
                    setProcess(null);
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

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={projectDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setProject(data);
                  }}
                  value={project}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Project" />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={processDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setProcess(data);
                  }}
                  value={process}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Process Name"
                    />
                  )}
                />
              </FormControl>
            </div>

            <div className="flex gap-[20px]">
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={departmentDropdownData}
                  getOptionLabel={(option: LabelValueType) => option.label}
                  onChange={(e, data: LabelValueType | null) => {
                    setDepartment(data);
                  }}
                  value={department}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Department"
                    />
                  )}
                />
              </FormControl>

              <div
                className={`inline-flex mt-[-4px] mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={startDate === null ? null : dayjs(startDate)}
                    // shouldDisableDate={isWeekend}
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
                className={`inline-flex mt-[-4px] mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={endDate === null ? null : dayjs(endDate)}
                    // shouldDisableDate={isWeekend}
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

export default HistoryFilterDialog;
