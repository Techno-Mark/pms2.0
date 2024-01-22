import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import {
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SearchIcon from "@/assets/icons/SearchIcon";
import Datatable_BillingType from "../Datatables/Datatable_BillingType";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { getBillingTypeData } from "@/utils/commonDropdownApiCall";

interface Status {
  Type: string;
  label: string;
  value: number;
}

interface BillingTypeDialogProps {
  onOpen: boolean;
  onClose: () => void;
  onSelectedWorkType: number;
  onSelectedStatusName: string;
}

const Dialog_BillingType: React.FC<BillingTypeDialogProps> = ({
  onOpen,
  onClose,
  onSelectedWorkType,
  onSelectedStatusName,
}) => {
  const [allBillingType, setAllBillingType] = useState<Status[]>([]);
  const [billingType, setBillingType] = useState<number | any>(0);
  const [clickedStatusName, setClickedStatusName] = useState<string>("");
  const [searchValue, setSearchValue] = useState("");

  const handleClose = () => {
    onClose();
    setBillingType(0);
    setClickedStatusName("");
    setSearchValue("");
  };

  function getValueByLabelOrType(labelOrType: any): number {
    const billingType = allBillingType.find(
      (billingType: Status) =>
        billingType.Type === labelOrType || billingType.label === labelOrType
    );
    if (billingType) {
      return billingType.value;
    } else {
      return 0;
    }
  }

  useEffect(() => {
    setClickedStatusName(onSelectedStatusName);
    const billingTypeValue: number = getValueByLabelOrType(clickedStatusName);
    setBillingType(billingTypeValue);
  }, [clickedStatusName, onSelectedStatusName]);

  const handleChangeValue = (e: any) => {
    setBillingType(e.target.value);
    setSearchValue("");
  };

  const getAllStatus = async () => {
    setAllBillingType(await getBillingTypeData());
  };

  useEffect(() => {
    getAllStatus();
  }, []);

  return (
    <div>
      <Dialog
        fullWidth
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="xl"
        onClose={handleClose}
      >
        <DialogTitle className="flex justify-between p-5 bg-whiteSmoke">
          <span className="font-semibold text-lg">Billing Type</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px]">
          <div className="flex justify-between items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <div className="flex items-center h-full relative">
                <TextField
                  className="m-0"
                  placeholder="Search"
                  fullWidth
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  margin="normal"
                  variant="standard"
                  sx={{ mx: 0.75, maxWidth: 300 }}
                />
                <span className="absolute right-1 pl-1">
                  <SearchIcon />
                </span>
              </div>
            </FormControl>

            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="Billing Type"
                id="Billing Type"
                value={billingType ? billingType : 0}
                onChange={handleChangeValue}
                sx={{ height: "36px" }}
              >
                <MenuItem value={0}>All</MenuItem>
                {allBillingType.map((i: any) => (
                  <MenuItem value={i.value} key={i.value}>
                    {i.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Datatable_BillingType
            onSelectedWorkType={onSelectedWorkType}
            onSelectedStatusName={onSelectedStatusName}
            onCurrentSelectedBillingType={billingType}
            onSearchValue={searchValue}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_BillingType;
