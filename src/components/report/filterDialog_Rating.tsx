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
import { getProjectDropdownData } from "@/utils/commonDropdownApiCall";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData?: any;
}

const initialRatingFilter = {
  Projects: [],
  ReturnTypeId: null,
  StartDate: null,
  EndDate: null,
  Ratings: null,
};

const FilterDialog_Rating: React.FC<FilterModalProps> = ({
  onOpen,
  onClose,
  currentFilterData,
}) => {
  const [anyRatingFieldSelected, setAnyRatingFieldSelected] =
    useState<any>(false);
  const [currSelectedRatingFields, setCurrSelectedRatingFileds] = useState<
    any | any[]
  >([]);
  const [projectFilterRatingDropdownData, setProjectFilterRatingDropdownData] =
    useState([]);
  const [returnTypeFilterRating, setReturnTypeFilterRating] = useState<
    null | number
  >(0);
  const [startDateFilterRating, setStartDateFilterRating] = useState<
    null | string
  >(null);
  const [endDateFilterRating, setEndDateFilterRating] = useState<null | string>(
    null
  );
  const [projectFilterRating, setProjectFilterRating] = useState<null | number>(
    0
  );
  const [ratingsFilterRating, setRatingsFilterRating] = useState<null | number>(
    0
  );

  const handleRatingClose = () => {
    handleRatingResetAll();
    onClose();
  };

  const handleRatingResetAll = () => {
    setProjectFilterRating(0);
    setReturnTypeFilterRating(0);
    setRatingsFilterRating(0);
    setStartDateFilterRating(null);
    setEndDateFilterRating(null);
    currentFilterData(initialRatingFilter);
  };

  useEffect(() => {
    const isAnyRatingFieldSelected =
      projectFilterRating !== 0 ||
      returnTypeFilterRating !== 0 ||
      ratingsFilterRating !== 0 ||
      startDateFilterRating !== null ||
      endDateFilterRating !== null;

    setAnyRatingFieldSelected(isAnyRatingFieldSelected);
  }, [
    projectFilterRating,
    returnTypeFilterRating,
    ratingsFilterRating,
    startDateFilterRating,
    endDateFilterRating,
  ]);

  useEffect(() => {
    const selectedFields = {
      Projects: projectFilterRating === 0 ? [] : [projectFilterRating] || null,
      ReturnTypeId: returnTypeFilterRating || null,
      Ratings: ratingsFilterRating || null,
      StartDate:
        startDateFilterRating !== null
          ? new Date(
              new Date(startDateFilterRating).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : null,
      EndDate:
        endDateFilterRating !== null
          ? new Date(
              new Date(endDateFilterRating).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : null,
    };
    setCurrSelectedRatingFileds(selectedFields);
  }, [
    projectFilterRating,
    returnTypeFilterRating,
    ratingsFilterRating,
    startDateFilterRating,
    endDateFilterRating,
  ]);

  const sendFilterToPage = () => {
    currentFilterData(currSelectedRatingFields);
    onClose();
  };

  const getProjectData = async () => {
    const clientId = await localStorage.getItem("clientId");
    setProjectFilterRatingDropdownData(await getProjectDropdownData(clientId));
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
        onClose={handleRatingClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Filter</span>
          <Button color="error" onClick={handleRatingResetAll}>
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
                  value={projectFilterRating === 0 ? "" : projectFilterRating}
                  onChange={(e: any) => setProjectFilterRating(e.target.value)}
                >
                  {projectFilterRatingDropdownData.map(
                    (i: any, index: number) => (
                      <MenuItem value={i.value} key={i.value}>
                        {i.label}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <InputLabel id="workTypes-label">Return Type</InputLabel>
                <Select
                  labelId="workTypes-label"
                  id="workTypes-select"
                  value={
                    returnTypeFilterRating === 0 ? "" : returnTypeFilterRating
                  }
                  onChange={(e: any) =>
                    setReturnTypeFilterRating(e.target.value)
                  }
                >
                  <MenuItem value={1}>Individual Return</MenuItem>
                  <MenuItem value={2}>Business Return</MenuItem>
                </Select>
              </FormControl>

              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    value={
                      startDateFilterRating === null
                        ? null
                        : dayjs(startDateFilterRating)
                    }
                    onChange={(newDate: any) =>
                      setStartDateFilterRating(newDate.$d)
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
            <div className="flex gap-[20px]">
              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    shouldDisableDate={isWeekend}
                    maxDate={dayjs(Date.now())}
                    value={
                      endDateFilterRating === null
                        ? null
                        : dayjs(endDateFilterRating)
                    }
                    onChange={(newDate: any) =>
                      setEndDateFilterRating(newDate.$d)
                    }
                    slotProps={{
                      textField: {
                        readOnly: true,
                      } as Record<string, any>,
                    }}
                  />
                </LocalizationProvider>
              </div>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <InputLabel id="ratings">Ratings</InputLabel>
                <Select
                  labelId="ratings"
                  id="ratings"
                  value={ratingsFilterRating === 0 ? "" : ratingsFilterRating}
                  onChange={(e: any) => setRatingsFilterRating(e.target.value)}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
          <Button
            variant="contained"
            color="info"
            className={`${anyRatingFieldSelected && "!bg-secondary"}`}
            disabled={!anyRatingFieldSelected}
            onClick={sendFilterToPage}
          >
            Apply Filter
          </Button>

          <Button variant="outlined" color="info" onClick={handleRatingClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilterDialog_Rating;
