import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FormControl, TextareaAutosize, FormHelperText } from "@mui/material";
import { DialogTransition } from "@/utils/style/DialogTransition";

interface AcceptDiloagModalProps {
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onSetNote?: string;
  acceptWorkitem: (note: string, id: number[]) => void;
  selectedWorkItemIds: number[] | any;
}

const AcceptDiloag: React.FC<AcceptDiloagModalProps> = ({
  onOpen,
  onClose,
  acceptWorkitem,
  selectedWorkItemIds,
}) => {
  const [note, setNote] = useState<string | any>("");
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
          <div className="flex gap-[20px] pt-[20px]">
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
                className={`outline-none w-80 border-b ${
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
          <Button
            className="!bg-secondary"
            variant="contained"
            onClick={handleSaveAndApply}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AcceptDiloag;
