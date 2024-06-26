import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import {
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Datatable_ReturnTypeData from "../datatable/Datatable_ReturnTypeData";
import { DialogTransition } from "@/utils/style/DialogTransition";

interface DialogProps {
  onOpen: boolean;
  onClose: () => void;
  onSelectedProjectIds: number[];
  onSelectedReturnTypeValue: number;
  onSelectedWorkType: number;
  onSelectedDepartment: number;
}

const Dialog_ReturnTypeData = ({
  onOpen,
  onClose,
  onSelectedProjectIds,
  onSelectedReturnTypeValue,
  onSelectedWorkType,
  onSelectedDepartment,
}: DialogProps) => {
  const [returnType, setReturnType] = useState<number | string>(0);

  const handleClose = () => {
    onClose();
    setReturnType(0);
  };

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
        <DialogTitle className="flex items-center justify-between p-2 bg-whiteSmoke">
          <span className="font-semibold text-lg">Task Status</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px] !py-0">
          <div className="flex justify-end items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="return type"
                id="return type"
                value={returnType ? returnType : onSelectedReturnTypeValue}
                onChange={(e) => setReturnType(e.target.value)}
                sx={{ height: "36px" }}
              >
                <MenuItem value={1}>Individual Return</MenuItem>
                <MenuItem value={2}>Business Return</MenuItem>
              </Select>
            </FormControl>
          </div>

          <Datatable_ReturnTypeData
            onSelectedProjectIds={onSelectedProjectIds}
            onSelectedReturnTypeValue={onSelectedReturnTypeValue}
            onCurrSelectedReturnType={returnType}
            onSelectedWorkType={onSelectedWorkType}
            onSelectedDepartment={onSelectedDepartment}
            onOpen={onOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_ReturnTypeData;
