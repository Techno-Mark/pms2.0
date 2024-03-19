import React, { useState } from "react";
// material imports
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { FormControl, TextareaAutosize, FormHelperText } from "@mui/material";

interface RejectDialogModalProps {
  onOpen: boolean;
  onClose: () => void;
  onActionClick?: () => void;
  onSetNote?: string;
  rejectWorkItem: (note: string, id: number[]) => void;
  selectedWorkItemIds: number[] | [];
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const RejectDialog: React.FC<RejectDialogModalProps> = ({
  onOpen,
  onClose,
  rejectWorkItem,
  selectedWorkItemIds,
}) => {
  const [note, setNote] = useState("");
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
      // Check if noteErr is false
      rejectWorkItem(note, selectedWorkItemIds);
      handleClose();
    }
  };

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={Transition}
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Reject with Note</span>
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
                placeholder="Enter the reject note."
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

export default RejectDialog;
