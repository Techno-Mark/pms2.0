import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { DialogTransition } from "@/utils/style/DialogTransition";
import {
  getClientDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData?: any;
}

const initialFilter = {
  ClientId: null,
  TypeOfWork: null,
};

const UnassigneeFilterDialog: React.FC<FilterModalProps> = ({
  onOpen,
  onClose,
  currentFilterData,
}) => {
  const [clientDropdownData, setClientDropdownData] = useState([]);
  const [typeOfWorkDropdownData, setTypeOfWorkDropdownData] = useState([]);

  const [clientName, setClientName] = useState<any>(0);
  const [typeOfWork, setTypeOfWork] = useState<any>(0);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<any | any[]>([]);

  const handleClose = () => {
    handleResetAll();
    onClose();
  };

  const handleResetAll = () => {
    setClientName(0);
    setTypeOfWork(0);
    currentFilterData(initialFilter);
  };

  useEffect(() => {
    const isAnyFieldSelected = clientName !== 0 || typeOfWork !== 0;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [clientName, typeOfWork]);

  useEffect(() => {
    const selectedFields = {
      ClientId: clientName || null,
      TypeOfWork: typeOfWork || null,
    };
    setCurrSelectedFileds(selectedFields);
  }, [clientName, typeOfWork]);

  const sendFilterToPage = () => {
    currentFilterData(currSelectedFields);
    onClose();
  };

  const getClientData = async () => {
    setClientDropdownData(await getClientDropdownData());
  };

  const getWorkTypeData = async (clientName: string | number) => {
    setTypeOfWorkDropdownData(await getTypeOfWorkDropdownData(clientName));
  };

  useEffect(() => {
    if (onOpen === true) {
      getClientData();
    }
  }, [onOpen]);

  useEffect(() => {
    clientName > 0 && getWorkTypeData(clientName);
  }, [clientName]);

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
                  onChange={(e) => {
                    setClientName(e.target.value);
                    setTypeOfWork(0);
                  }}
                >
                  {clientDropdownData.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ mx: 0.75, minWidth: 200 }}>
                <InputLabel id="workType">Type Of Work</InputLabel>
                <Select
                  labelId="workType"
                  id="workType"
                  value={typeOfWork === 0 ? "" : typeOfWork}
                  onChange={(e) => setTypeOfWork(e.target.value)}
                >
                  {typeOfWorkDropdownData.map((i: any) => (
                    <MenuItem value={i.value} key={i.value}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
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

          <Button variant="outlined" color="info" onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UnassigneeFilterDialog;
