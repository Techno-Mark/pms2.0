/* eslint-disable react-hooks/rules-of-hooks */
import { DialogTransition } from "@/utils/style/DialogTransition";
import { isWeekend } from "@/utils/commonFunction";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  getProjectDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData?: any;
}

const initialTaskFilter = {
  ProjectIdsForFilter: [],
  WorkType: null,
  Priority: null,
  StartDate: null,
  EndDate: null,
};

const FilterDialog_Task: React.FC<FilterModalProps> = ({
  onOpen,
  onClose,
  currentFilterData,
}) => {
  const [anyTaskFieldSelected, setAnyTaskFieldSelected] = useState<any>(false);
  const [currSelectedTaskFields, setCurrSelectedTaskFileds] = useState<
    any | any[]
  >([]);
  const [projectFilterTaskDropdownData, setProjectFilterTaskDropdownData] =
    useState([]);
  const [typeOfWorkFilterTask, setTypeOfWorkFilterTask] = useState<
    null | number
  >(0);
  const [
    typeOfWorkFilterTaskDropdownData,
    setTypeOfWorkFilterTaskDropdownData,
  ] = useState([]);
  const [dueDateFilterTask, setDueDateFilterTask] = useState<null | string>(
    null
  );
  const [startDateFilterTask, setStartDateFilterTask] = useState<null | string>(
    null
  );
  const [endDateFilterTask, setEndDateFilterTask] = useState<null | string>(
    null
  );
  const [projectFilterTask, setProjectFilterTask] = useState<null | number>(0);
  const [priorityFilterTask, setPriorityFilterTask] = useState<null | number>(
    0
  );

  const handleTaskClose = () => {
    handleTaskResetAll();
    onClose();
  };

  const handleTaskResetAll = () => {
    setProjectFilterTask(0);
    setTypeOfWorkFilterTask(0);
    setPriorityFilterTask(0);
    setDueDateFilterTask(null);
    setStartDateFilterTask(null);
    setEndDateFilterTask(null);
    currentFilterData(initialTaskFilter);
  };

  useEffect(() => {
    const isAnyTaskFieldSelected =
      projectFilterTask !== 0 ||
      typeOfWorkFilterTask !== 0 ||
      priorityFilterTask !== 0 ||
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
        projectFilterTask === 0 ? [] : [projectFilterTask] || null,
      WorkType: typeOfWorkFilterTask || null,
      Priority: priorityFilterTask || null,
      DueDate:
        dueDateFilterTask !== null
          ? new Date(
              new Date(dueDateFilterTask).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : null,
      StartDate:
        startDateFilterTask !== null
          ? new Date(
              new Date(startDateFilterTask).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : null,
      EndDate:
        endDateFilterTask !== null
          ? new Date(
              new Date(endDateFilterTask).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : null,
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
    currentFilterData(currSelectedTaskFields);
    onClose();
  };

  const getProjectData = async () => {
    const clientId = await localStorage.getItem("clientId");
    setProjectFilterTaskDropdownData(await getProjectDropdownData(clientId));
    getWorkTypeData();
  };

  const getWorkTypeData = async () => {
    const clientId = await localStorage.getItem("clientId");
    setTypeOfWorkFilterTaskDropdownData(
      await getTypeOfWorkDropdownData(clientId)
    );
  };

  useEffect(() => {
    onOpen && getProjectData();
  }, [onOpen]);

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="md"
        onClose={handleTaskClose}
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
                <InputLabel id="project">Project</InputLabel>
                <Select
                  labelId="project"
                  id="project"
                  value={projectFilterTask === 0 ? "" : projectFilterTask}
                  onChange={(e: any) => setProjectFilterTask(e.target.value)}
                >
                  {projectFilterTaskDropdownData.map(
                    (i: any, index: number) => (
                      <MenuItem value={i.value} key={i.value}>
                        {i.label}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <InputLabel id="workTypes-label">Types of Work</InputLabel>
                <Select
                  labelId="workTypes-label"
                  id="workTypes-select"
                  value={typeOfWorkFilterTask === 0 ? "" : typeOfWorkFilterTask}
                  onChange={(e: any) => setTypeOfWorkFilterTask(e.target.value)}
                >
                  {typeOfWorkFilterTaskDropdownData.map(
                    (i: any, index: number) => (
                      <MenuItem value={i.value} key={i.value}>
                        {i.label}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <InputLabel id="priority">Priority</InputLabel>
                <Select
                  labelId="priority"
                  id="priority"
                  value={priorityFilterTask === 0 ? "" : priorityFilterTask}
                  onChange={(e: any) => setPriorityFilterTask(e.target.value)}
                >
                  <MenuItem value={1}>High</MenuItem>
                  <MenuItem value={2}>Medium</MenuItem>
                  <MenuItem value={3}>Low</MenuItem>
                </Select>
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
                    shouldDisableDate={isWeekend}
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
                    shouldDisableDate={isWeekend}
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

          <Button variant="outlined" color="info" onClick={handleTaskClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilterDialog_Task;
