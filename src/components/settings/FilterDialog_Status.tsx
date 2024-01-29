import { callAPI } from "@/utils/API/callAPI";
import { DialogTransition } from "@/utils/style/DialogTransition";
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
import React, { useEffect, useState } from "react";

const initialFilter = {
  SortColumn: "",
  IsDec: true,
  globalFilter: null,
  IsDefault: null,
  Type: "",
  Export: false,
  GlobalSearch: null,
  WorkTypeId: null,
};

const FilterDialog_Status = ({ onOpen, onClose, currentFilterData }: any) => {
  const [currSelectedFields, setCurrSelectedFileds] = useState<any | any[]>([]);
  const [anyFieldSelected, setAnyFieldSelected] = useState<any>(false);
  const [typeOfWorkDropdown, setTypeOfWorkDropdown] = useState([]);
  const [typeOfWork, setTypeOfWork] = useState(0);

  const getWorkTypeData = async () => {
    const params = {
      ClientId: null,
      OrganizationId: await localStorage.getItem("Org_Id"),
    };
    const url = `${process.env.pms_api_url}/WorkType/GetDropdown`;
    const successCallback = async (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setTypeOfWorkDropdown(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    typeOfWorkDropdown.length <= 0 && getWorkTypeData();
  }, []);

  const sendFilterToPage = () => {
    currentFilterData(currSelectedFields);
    onClose();
  };

  const handleResetAll = () => {
    setTypeOfWork(0);
    currentFilterData(initialFilter);
  };

  const handleClose = () => {
    handleResetAll();
    onClose();
  };

  useEffect(() => {
    const isAnyFieldSelected: any = typeOfWork !== 0;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [typeOfWork]);

  useEffect(() => {
    const selectedFields = {
      ...initialFilter,
      WorkTypeId: typeOfWork > 0 ? typeOfWork : null,
    };
    setCurrSelectedFileds(selectedFields);
  }, [typeOfWork]);

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
            Reset
          </Button>
        </DialogTitle>

        <DialogContent>
          <div className="flex flex-col gap-[20px] pt-[15px]">
            <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 230 }}>
              <InputLabel id="demo-simple-select-standard-label">
                Type Of Work
                <span className="text-defaultRed">&nbsp;*</span>
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={typeOfWork === 0 ? "" : typeOfWork}
                onChange={(e: any) => setTypeOfWork(e.target.value)}
              >
                {typeOfWorkDropdown.length > 0 &&
                  typeOfWorkDropdown.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
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

export default FilterDialog_Status;
