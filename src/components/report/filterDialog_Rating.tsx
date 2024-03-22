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
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { getProjectDropdownData } from "@/utils/commonDropdownApiCall";
import { getFormattedDate } from "@/utils/timerFunctions";
import { LabelValue } from "@/utils/Types/types";

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

type FilterData = {
  Projects: number[];
  ReturnTypeId: number | null;
  Ratings: number | null;
  StartDate: string | null;
  EndDate: string | null;
};

const FilterDialog_Rating = ({
  onOpen,
  onClose,
  currentFilterData,
}: FilterModalProps) => {
  const [anyRatingFieldSelected, setAnyRatingFieldSelected] =
    useState<boolean>(false);
  const [currSelectedRatingFields, setCurrSelectedRatingFileds] = useState<
    FilterData | []
  >([]);
  const [projectFilterRatingDropdownData, setProjectFilterRatingDropdownData] =
    useState([]);
  const [startDateFilterRating, setStartDateFilterRating] = useState<
    null | string
  >(null);
  const [endDateFilterRating, setEndDateFilterRating] = useState<null | string>(
    null
  );
  const [projectFilterRating, setProjectFilterRating] =
    useState<null | LabelValue>(null);
  const [returnTypeFilterRating, setReturnTypeFilterRating] =
    useState<null | LabelValue>(null);
  const [ratingsFilterRating, setRatingsFilterRating] =
    useState<null | LabelValue>(null);

  const handleRatingResetAll = () => {
    setProjectFilterRating(null);
    setReturnTypeFilterRating(null);
    setRatingsFilterRating(null);
    setStartDateFilterRating(null);
    setEndDateFilterRating(null);
    currentFilterData(initialRatingFilter);
  };

  useEffect(() => {
    const isAnyRatingFieldSelected =
      projectFilterRating !== null ||
      returnTypeFilterRating !== null ||
      ratingsFilterRating !== null ||
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
      Projects: projectFilterRating !== null ? [projectFilterRating.value] : [],
      ReturnTypeId:
        returnTypeFilterRating !== null ? returnTypeFilterRating.value : null,
      Ratings: ratingsFilterRating !== null ? ratingsFilterRating.value : null,
      StartDate:
        startDateFilterRating === null
          ? endDateFilterRating === null
            ? null
            : getFormattedDate(endDateFilterRating) || ""
          : getFormattedDate(startDateFilterRating) || "",
      EndDate:
        endDateFilterRating === null
          ? startDateFilterRating === null
            ? null
            : getFormattedDate(startDateFilterRating) || ""
          : getFormattedDate(endDateFilterRating) || "",
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
    setProjectFilterRatingDropdownData(
      await getProjectDropdownData(clientId, null)
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
        onClose={() => onClose()}
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
                <Autocomplete
                  id="tags-standard"
                  options={projectFilterRatingDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setProjectFilterRating(data);
                  }}
                  value={projectFilterRating}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Project" />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={[
                    { label: "Individual Return", value: 1 },
                    { label: "Business Return", value: 2 },
                  ]}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setReturnTypeFilterRating(data);
                  }}
                  value={returnTypeFilterRating}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Return Type"
                    />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={[
                    { label: "1", value: 1 },
                    { label: "2", value: 2 },
                    { label: "3", value: 3 },
                    { label: "4", value: 4 },
                    { label: "5", value: 5 },
                  ]}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setRatingsFilterRating(data);
                  }}
                  value={ratingsFilterRating}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Ratings" />
                  )}
                />
              </FormControl>
            </div>
            <div className="flex gap-[20px]">
              <div className="inline-flex mt-[0px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    // shouldDisableDate={isWeekend}
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
              <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    // shouldDisableDate={isWeekend}
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

          <Button variant="outlined" color="info" onClick={() => onClose()}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilterDialog_Rating;
