import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Datatable_FullScreen from "@/components/dashboard/datatable/Datatable_FullScreen";

interface TaskListDialogProps {
  onOpen: boolean;
  onClose: () => void;
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
}

const Dialog_TaskList: React.FC<TaskListDialogProps> = ({
  onOpen,
  onClose,
  onSelectedProjectIds,
  onSelectedWorkType,
}) => {
  const handleClose = () => {
    onClose();
  };
  return (
    <div>
      <Dialog
        fullWidth
        fullScreen
        open={onOpen}
        keepMounted
        maxWidth="xl"
        onClose={handleClose}
      >
        <DialogContent>
          <Datatable_FullScreen
            onClose={handleClose}
            onSelectedWorkType={onSelectedWorkType}
            onSelectedProjectIds={onSelectedProjectIds}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_TaskList;
