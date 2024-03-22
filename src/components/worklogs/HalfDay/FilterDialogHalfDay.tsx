import { LabelValue } from "@/utils/Types/types";
import { getRMWiseUserDropdownData } from "@/utils/commonDropdownApiCall";
import { getYears } from "@/utils/commonFunction";
import { DialogTransition } from "@/utils/style/DialogTransition";
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
import React, { useEffect, useState } from "react";

interface FilterModalProps {
  onOpen: boolean;
  isOpen: boolean;
  onClose: () => void;
  currentFilterData?: any;
}

const monthsDropdownData: LabelValue[] = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const initialFilter = {
  MonthFilter: null,
  YearFilter: null,
  Users: [],
};

const FilterDialogHalfDay = ({
  onOpen,
  isOpen,
  onClose,
  currentFilterData,
}: FilterModalProps) => {
  const yearDropdown = getYears();
  const [userDropdownData, setUserDropdownData] = useState([]);
  const [userName, setUserName] = useState<LabelValue[]>([]);
  const [userNames, setUserNames] = useState<number[]>([]);
  const [month, setMonth] = useState<LabelValue | null>(null);
  const [year, setYear] = useState<LabelValue | null>(null);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<
    | {
        Users: number[];
        MonthFilter: number | null;
        YearFilter: number | null;
      }
    | []
  >([]);

  useEffect(() => {
    isOpen && handleResetAll();
  }, [isOpen]);

  const handleResetAll = () => {
    setUserName([]);
    setUserNames([]);
    setMonth(null);
    setYear(null);
    currentFilterData(initialFilter);
  };

  useEffect(() => {
    const isAnyFieldSelected =
      userNames.length > 0 || month !== null || year !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [userNames, month, year]);

  useEffect(() => {
    const selectedFields = {
      Users: userNames.length > 0 ? userNames : [],
      MonthFilter: month !== null ? month.value : null,
      YearFilter: year !== null ? year.value : null,
    };
    setCurrSelectedFileds(selectedFields);
  }, [userNames, month, year]);

  const sendFilterToPage = () => {
    currentFilterData(currSelectedFields);
    onClose();
  };

  const getUserData = async () => {
    setUserDropdownData(await getRMWiseUserDropdownData());
  };

  useEffect(() => {
    if (onOpen === true && userDropdownData.length <= 0) {
      getUserData();
    }
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
          <Button color="error" onClick={handleResetAll}>
            Reset all
          </Button>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-[20px] pt-[15px]">
            <div className="flex gap-[20px]">
              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  multiple
                  id="tags-standard"
                  options={userDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue[]) => {
                    setUserNames(data.map((d: LabelValue) => d.value));
                    setUserName(data);
                  }}
                  value={userName}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="User Name"
                    />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={monthsDropdownData}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setMonth(data);
                  }}
                  value={month}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Month" />
                  )}
                />
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 210 }}>
                <Autocomplete
                  id="tags-standard"
                  options={yearDropdown}
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(e, data: LabelValue | null) => {
                    setYear(data);
                  }}
                  value={year}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="standard" label="Year" />
                  )}
                />
              </FormControl>
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

export default FilterDialogHalfDay;
