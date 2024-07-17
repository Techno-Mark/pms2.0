import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FormControl, TextareaAutosize, FormHelperText } from "@mui/material";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { toHoursAndMinutes } from "@/utils/timerFunctions";

interface AcceptDiloagModalProps {
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onSetNote?: string;
  acceptWorkitem: (note: string, id: number[]) => void;
  selectedWorkItemIds: number[] | [];
  data: any;
  handleEditClicked: (click: boolean) => void;
}

const AcceptWithNoteDiloag = ({
  onOpen,
  onClose,
  acceptWorkitem,
  selectedWorkItemIds,
  data,
  handleEditClicked,
}: AcceptDiloagModalProps) => {
  const [note, setNote] = useState<string>("");
  const [noteErr, setNoteErr] = useState(false);

  const validateNote = () => {
    if (note.trim() === "" || note.length <= 0) {
      setNoteErr(true);
    } else {
      setNoteErr(false);
    }
  };

  const handleClose = () => {
    setNote("");
    setNoteErr(false);
    onClose();
  };

  const handleSaveAndApply = () => {
    validateNote();
    if (noteErr !== true || !noteErr) {
      acceptWorkitem(note, selectedWorkItemIds);
      handleClose();
    }
  };

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Accept with Note</span>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-[20px] pt-[20px]">
            <div className="flex flex-col mr-20 mb-8 mt-4">
              <p className="mb-2">
                Are you sure you want to Accept task with same time?
              </p>
              {data.length > 0 && (
                <>
                  <div>Preparer Time: {data[0].PreparorTime}</div>
                  <div>Reviewer Time: {toHoursAndMinutes(data[0].Timer)}</div>
                </>
              )}
            </div>
            <FormControl variant="standard">
              <label htmlFor="notes" className="pb-1 text-sm">
                Note<sup>*</sup>
              </label>
              <TextareaAutosize
                color="error"
                id="notes"
                name="notes"
                placeholder="Enter the accept note."
                minRows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                autoFocus
                required
                onBlur={() => {
                  if (note.trim() === "") {
                    setNoteErr(true);
                  } else {
                    setNoteErr(false);
                  }
                }}
                className={`outline-none w-90 border-b ${
                  noteErr ? "border-defaultRed" : ""
                }`}
              />
              {noteErr && (
                <FormHelperText error>Please enter a note.</FormHelperText>
              )}
            </FormControl>
          </div>
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

export default AcceptWithNoteDiloag;
