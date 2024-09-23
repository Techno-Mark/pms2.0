import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { DialogContentText } from "@mui/material";
import { DialogTransition } from "@/utils/style/DialogTransition";

interface ConfirmationDiloagModalProps {
  onOpen: boolean;
  onClose: () => void;
  heading: string;
  title: string;
  data: any;
  updateData: any;
}

const ConfirmationDiloag = ({
  onOpen,
  onClose,
  heading,
  title,
  data,
  updateData
}: ConfirmationDiloagModalProps) => {
  const handleClose = () => {
    updateData(data.value);
    onClose();
  };

  const handleSaveAndApply = () => {
    handleClose();
  };
  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">{heading}</span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div className="flex flex-col mr-20 mb-8 mt-4">
              <p className="mb-2">{title}</p>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="!bg-secondary"
            variant="contained"
            onClick={handleSaveAndApply}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfirmationDiloag;
