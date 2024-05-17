import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { DialogContentText } from "@mui/material";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { toHoursAndMinutes } from "@/utils/timerFunctions";

interface AcceptDiloagModalProps {
  onOpen: boolean;
  onClose: () => void;
  acceptWorkitem: (note: string, id: number[]) => void;
  selectedWorkItemIds: number[] | [];
  data: any;
  handleEditClicked: (click: boolean) => void;
}

const AcceptDiloag = ({
  onOpen,
  onClose,
  acceptWorkitem,
  selectedWorkItemIds,
  data,
  handleEditClicked,
}: AcceptDiloagModalProps) => {
  const handleClose = () => {
    onClose();
  };

  const handleSaveAndApply = () => {
    acceptWorkitem("", selectedWorkItemIds);
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
          <span className="text-lg font-medium">Accept Task</span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div className="flex flex-col mr-20 mb-8 mt-4">
              <p className="mb-2">
                Are you sure you want to Accept task with same time?
              </p>
              {data.length > 0 && (
                <>
                  <div>Preperor Time: {data[0].PreparorTime}</div>
                  <div>Reviewer Time: {toHoursAndMinutes(data[0].Timer)}</div>
                </>
              )}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
          {data.length > 0 && (
            <Button
              variant="outlined"
              onClick={() => {
                handleEditClicked(true);
                handleClose();
              }}
            >
              Edit Time
            </Button>
          )}
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

export default AcceptDiloag;
