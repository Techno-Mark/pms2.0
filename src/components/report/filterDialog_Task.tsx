import { DialogTransition } from "@/utils/style/DialogTransition";
import { isWeekend } from "@/utils/commonFunction";
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
import {
  getProjectDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { getFormattedDate } from "@/utils/timerFunctions";
import { LabelValue } from "@/utils/Types/types";
import { priorityOptions } from "@/utils/staticDropdownData";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData?: (data: any) => void;
}

interface FilterData {
  ProjectIdsForFilter: number[];
  WorkType: number | null;
  Priority: number | null;
  DueDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
}

const initialTaskFilter = {
  ProjectIdsForFilter: [],
  WorkType: null,
  Priority: null,
  StartDate: null,
  EndDate: null,
};

const FilterDialog_Task = ({
  onOpen,
  onClose,
  currentFilterData,
}: FilterModalProps) => {
  const [anyTaskFieldSelected, setAnyTaskFieldSelected] =
    useState<boolean>(false);
  const [currSelectedTaskFields, setCurrSelectedTaskFileds] = useState<
    FilterData | []
  >([]);
  const [projectFilterTaskDropdownData, setProjectFilterTaskDropdownData] =
    useState([]);
  const [typeOfWorkFilterTask, setTypeOfWorkFilterTask] =
    useState<LabelValue | null>(null);
  const [
    typeOfWorkFilterTaskDropdownData,
    setTypeOfWorkFilterTaskDropdownData,
  ] = useState([]);
  const [projectFilterTask, setProjectFilterTask] = useState<null | LabelValue>(
    null
  );
  const [priorityFilterTask, setPriorityFilterTask] =
    useState<null | LabelValue>(null);
  const [dueDateFilterTask, setDueDateFilterTask] = useState<null | string>(
    null
  );
  const [startDateFilterTask, setStartDateFilterTask] = useState<null | string>(
    null
  );
  const [endDateFilterTask, setEndDateFilterTask] = useState<null | string>(
    null
  );

  const handleTaskResetAll = () => {
    setProjectFilterTask(null);
    setTypeOfWorkFilterTask(null);
    setPriorityFilterTask(null);
    setDueDateFilterTask(null);
    setStartDateFilterTask(null);
    setEndDateFilterTask(null);
    setAnyTaskFieldSelected(false);
    currentFilterData?.(initialTaskFilter);
  };

  useEffect(() => {
    const isAnyTaskFieldSelected =
      projectFilterTask !== null ||
      typeOfWorkFilterTask !== null ||
      priorityFilterTask !== null ||
      dueDateFilterTask !== null ||
      startDateFilterTask !== null ||
      endDateFilterTask !== null;

    setAnyTaskFieldSelected(isAnyTaskFieldSelected);
  }, [
    projectFilterTask,
    typeOfWorkFilterTask,
    priorityFilterTask,
    dueDateFilterTask,
    startDateFilterTask,
    endDateFilterTask,
  ]);

  useEffect(() => {
    const selectedFields = {
      ProjectIdsForFilter:
        projectFilterTask !== null ? [projectFilterTask.value] : [],
      WorkType:
        typeOfWorkFilterTask !== null ? typeOfWorkFilterTask.value : null,
      Priority: priorityFilterTask !== null ? priorityFilterTask.value : null,
      DueDate:
        dueDateFilterTask !== null
          ? getFormattedDate(dueDateFilterTask) || ""
          : null,
      StartDate:
        startDateFilterTask === null
          ? endDateFilterTask === null
            ? null
            : getFormattedDate(endDateFilterTask) || ""
          : getFormattedDate(startDateFilterTask) || "",
      EndDate:
        endDateFilterTask === null
          ? startDateFilterTask === null
            ? null
            : getFormattedDate(startDateFilterTask) || ""
          : getFormattedDate(endDateFilterTask) || "",
    };
    setCurrSelectedTaskFileds(selectedFields);
  }, [
    projectFilterTask,
    typeOfWorkFilterTask,
    priorityFilterTask,
    dueDateFilterTask,
    startDateFilterTask,
    endDateFilterTask,
  ]);

  const sendTaskFilterToPage = () => {
    currentFilterData?.(currSelectedTaskFields);
    onClose();
  };

  const getWorkTypeData = async () => {
    const clientId = await localStorage.getItem("clientId");
    setTypeOfWorkFilterTaskDropdownData(
      await getTypeOfWorkDropdownData(clientId)
    );
    setProjectFilterTaskDropdownData(
      await getProjectDropdownData(clientId, null)
    );
  };

  useEffect(() => {
    onOpen && getWorkTypeData();
  }, [onOpen]);

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
          <Button color="error" onClick={handleTaskResetAll}>
            Reset all
          </Button>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-[20px] pt-[15px]">
            <div className="flex gap-[20px]">
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={typeOfWorkFilterTaskDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setTypeOfWorkFilterTask(data);
                  }}
                  value={typeOfWorkFilterTask}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Type Of Work"
                    />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={projectFilterTaskDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setProjectFilterTask(data);
                  }}
                  value={projectFilterTask}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Project" />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={priorityOptions}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setPriorityFilterTask(data);
                  }}
                  value={priorityFilterTask}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Priority"
                    />
                  )}
                />
              </FormControl>
            </div>
            <div className="flex gap-[20px]">
              {/* <div
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[200px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={<span>Due Date</span>}
                    shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    value={dueDate === null ? null : dayjs(dueDate)}
                    onChange={(newDate: any) => {
                      setDueDate(newDate.$d);
                    }}
                    slotProps={{
                      textField: {
                        readOnly: true,
                      } as Record<string, any>,
                    }}
                  />
                </LocalizationProvider>
              </div> */}
              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    value={
                      startDateFilterTask === null
                        ? null
                        : dayjs(startDateFilterTask)
                    }
                    onChange={(newDate: any) =>
                      setStartDateFilterTask(newDate.$d)
                    }
                    slotProps={{
                      textField: {
                        readOnly: true,
                      } as Record<string, any>,
                    }}
                  />
                </LocalizationProvider>
              </div>

              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    value={
                      endDateFilterTask === null
                        ? null
                        : dayjs(endDateFilterTask)
                    }
                    onChange={(newDate: any) =>
                      setEndDateFilterTask(newDate.$d)
                    }
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
            className={`${anyTaskFieldSelected && "!bg-secondary"}`}
            disabled={!anyTaskFieldSelected}
            onClick={sendTaskFilterToPage}
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

export default FilterDialog_Task;
