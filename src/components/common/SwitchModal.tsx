import React from "react";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { Close } from "@mui/icons-material";

interface SwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  firstContent: any;
  actionText: string;
  onActionClick: () => void;
}

const SwitchModal: React.FC<SwitchModalProps> = ({
  isOpen,
  onClose,
  title,
  firstContent,
  actionText,
  onActionClick,
}) => {
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <div className="flex flex-row justify-between items-center">
            <span>{title}</span>
            <ColorToolTip title="Close" placement="top" arrow>
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </ColorToolTip>
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            className="border-y border-y-lightSilver w-full py-4"
          >
            <Typography className="pb-2 text-darkCharcoal flex items-start">
              {firstContent ? firstContent : ""}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="mb-2">
          <Button
            className="bg-defaultRed"
            onClick={onClose}
            variant="contained"
            color="error"
          >
            Cancel
          </Button>
          <Button
            className="!bg-secondary"
            onClick={() => {
              onActionClick();
              onClose();
            }}
            autoFocus
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SwitchModal;
