import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { LabelValue } from "@/utils/Types/types";
import {
  getClientDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { getFormattedDate } from "@/utils/timerFunctions";
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
  activeTab: number;
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  currentFilterData?: any;
}

const ALL = -1;

const FilterDialogDashboard = ({
  activeTab,
  onOpen,
  onClose,
  currentFilterData,
}: FilterModalProps) => {
  const initialFilter = {
    Clients: [],
    TypeOfWork: activeTab === 1 ? 3 : null,
    StartDate: null,
    EndDate: null,
  };

  const [clients, setClients] = useState<LabelValue[] | []>([]);
  const [clientName, setClientName] = useState<number[] | []>([]);
  const [clientDropdown, setClientDropdown] = useState<LabelValue[] | []>([]);
  const [workType, setWorkType] = useState<LabelValue | null>(null);
  const [worktypeDropdownData, setWorktypeDropdownData] = useState([]);
  const [startDate, setStartDate] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<null | string>(null);
  const [anyFieldSelected, setAnyFieldSelected] = useState<boolean>(false);
  const [currSelectedFields, setCurrSelectedFileds] =
    useState<DashboardInitialFilter>(initialFilter);

  const sendFilterToPage = () => {
    currentFilterData(currSelectedFields);
    onClose();
  };

  const handleResetAll = () => {
    setClientName([]);
    setClients([]);
    setWorkType(activeTab === 1 ? { label: "Tax", value: 3 } : null);
    setStartDate(null);
    setEndDate(null);
    currentFilterData(initialFilter);
  };

  const getDropdownData = async () => {
    const typeOfWorkData = await getTypeOfWorkDropdownData(0);
    setClientDropdown([
      { label: "Select All", value: ALL },
      ...(await getClientDropdownData()),
    ]);
    setWorktypeDropdownData(typeOfWorkData);
    typeOfWorkData.length > 0 &&
      activeTab === 1 &&
      workType === null &&
      setWorkType({ label: "Tax", value: 3 });
  };

  useEffect(() => {
    if (onOpen === true) {
      getDropdownData();
    }
  }, [onOpen]);

  useEffect(() => {
    const isAnyFieldSelected: boolean =
      clientName.length > 0 ||
      workType !== null ||
      startDate !== null ||
      endDate !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [clientName, workType, startDate, endDate]);

  useEffect(() => {
    const selectedFields: DashboardInitialFilter = {
      Clients: clientName,
      TypeOfWork: workType !== null ? workType.value : null,
      StartDate: startDate !== null ? getFormattedDate(startDate) : null,
      EndDate:
        endDate === null
          ? startDate === null
            ? null
            : getFormattedDate(startDate)
          : getFormattedDate(endDate),
    };
    setCurrSelectedFileds(selectedFields);
  }, [clientName, workType, startDate, endDate]);

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
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, mt: 0.5, width: 210 }}
              >
                <Autocomplete
                  multiple
                  id="tags-standard"
                  options={
                    clientDropdown.length - 1 === clients.length
                      ? []
                      : clientDropdown.filter(
                          (option) =>
                            !clients.find(
                              (client) => client.value === option.value
                            )
                        )
                  }
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue[] | []
                  ) => {
                    if (data.some((d: LabelValue) => d.value === -1)) {
                      setClients(
                        clientDropdown.filter((d: LabelValue) => d.value !== -1)
                      );
                      setClientName(
                        clientDropdown
                          .filter((d: LabelValue) => d.value !== -1)
                          .map((d: LabelValue) => d.value)
                      );
                    } else {
                      setClients(data);
                      setClientName(data.map((d: LabelValue) => d.value));
                    }
                  }}
                  value={clients}
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
                sx={{ mx: 0.75, mt: 0.5, width: 210 }}
              >
                <Autocomplete
                  id="tags-standard"
                  options={worktypeDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
                    setWorkType(data);
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
            </div>
            <div className="flex gap-[20px]">
              <div
                className={`inline-flex mx-[6px] muiDatepickerCustomizer w-[210px] max-w-[300px]`}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    value={startDate === null ? null : dayjs(startDate)}
                    // shouldDisableDate={isWeekend}
                    maxDate={dayjs(endDate) || dayjs(Date.now())}
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
                    // shouldDisableDate={isWeekend}
                    minDate={dayjs(startDate)}
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

export default FilterDialogDashboard;
