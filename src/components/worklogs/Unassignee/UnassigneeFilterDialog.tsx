import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Autocomplete, FormControl, TextField } from "@mui/material";
import { DialogTransition } from "@/utils/style/DialogTransition";
import {
  getClientDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { LabelValue } from "@/utils/Types/types";

interface FilterModalProps {
  onOpen: boolean;
  onClose: () => void;
  currentFilterData?: any;
}

interface InitialFilter {
  ClientId: number | null;
  TypeOfWork: number | null;
}

const initialFilter = {
  ClientId: null,
  TypeOfWork: null,
};

const UnassigneeFilterDialog = ({
  onOpen,
  onClose,
  currentFilterData,
}: FilterModalProps) => {
  const [clientDropdownData, setClientDropdownData] = useState([]);
  const [typeOfWorkDropdownData, setTypeOfWorkDropdownData] = useState([]);

  const [clientName, setClientName] = useState<LabelValue | null>(null);
  const [typeOfWork, setTypeOfWork] = useState<LabelValue | null>(null);
  const [anyFieldSelected, setAnyFieldSelected] = useState(false);
  const [currSelectedFields, setCurrSelectedFileds] = useState<
    InitialFilter | []
  >([]);

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
    const selectedFields: InitialFilter = {
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
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
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
                  getOptionLabel={(option: LabelValue) => option.label}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    data: LabelValue | null
                  ) => {
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
