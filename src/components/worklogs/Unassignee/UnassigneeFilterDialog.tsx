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
  Select,
  TextField,
} from "@mui/material";
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

  const [clientName, setClientName] = useState<any>(null);
  const [typeOfWork, setTypeOfWork] = useState<any>(null);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<any | any[]>([]);

  const handleResetAll = () => {
    setClientName(null);
    setTypeOfWork(null);
    currentFilterData(initialFilter);
    onClose();
  };

  useEffect(() => {
    const isAnyFieldSelected = clientName !== null || typeOfWork !== null;

    setAnyFieldSelected(isAnyFieldSelected);
  }, [clientName, typeOfWork]);

  useEffect(() => {
    const selectedFields = {
      ClientId: clientName !== null ? clientName.value : null,
      TypeOfWork: typeOfWork !== null ? typeOfWork.value : null,
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
    clientName !== null && getWorkTypeData(clientName?.value);
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
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setClientName(data);
                    setTypeOfWork(null);
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
                  options={typeOfWorkDropdownData}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setTypeOfWork(data);
                  }}
                  value={typeOfWork}
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

export default UnassigneeFilterDialog;
