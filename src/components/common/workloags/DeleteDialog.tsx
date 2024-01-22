import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  IconButton,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tooltipClasses,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const ColorToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#0281B9",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#0281B9",
  },
}));

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick: () => void;
  Title: string;
  firstContent: string;
  secondContent: string;
}

const DeleteDialog: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onActionClick,
  Title,
  firstContent,
  secondContent,
}) => {
  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <div className="flex flex-row justify-between items-center">
            <span>{Title}</span>
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
            className="border-y border-y-lightSilver w-full p-4"
          >
            <Typography className="pb-2 text-darkCharcoal">
              {firstContent ? firstContent : ""}
            </Typography>
            <Typography className="text-darkCharcoal">
              {secondContent ? secondContent : ""}
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
            No, cancel
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
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeleteDialog;
