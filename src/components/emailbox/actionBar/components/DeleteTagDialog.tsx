import { callAPI } from "@/utils/API/callAPI";
import { DialogTransition } from "@/utils/style/DialogTransition";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React from "react";
import { toast } from "react-toastify";

const DeleteTagDialog = ({
  id,
  onOpen,
  handleClose,
  getOverLay,
  getTagDropdownData,
  handleClearSelection,
}: {
  id: string;
  onOpen: boolean;
  handleClose: () => void;
  getOverLay: (e: boolean) => void;
  getTagDropdownData: () => void;
  handleClearSelection: () => void;
}) => {
  const handleDelete = () => {
    getOverLay(true);
    const url = `${process.env.emailbox_api_url}/emailbox/deletetagfromtagmaster`;
    const successCallback = (
      ResponseData: boolean | number | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Tag has been updated successfully.");
        getTagDropdownData();
        getOverLay(false);
        handleClearSelection();
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        getOverLay(false);
      } else {
        getOverLay(false);
      }
    };
    callAPI(
      url,
      {
        Name: id,
      },
      successCallback,
      "POST"
    );
  };

  return (
    <Dialog
      open={onOpen}
      TransitionComponent={DialogTransition}
      onClose={handleClose}
    >
      <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
        <span className="text-lg font-medium">Delete Tag</span>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <div className="flex flex-col mr-20 mb-8 mt-4">
            <p className="mb-2">Are you sure you want to delete <b>{id}</b> tag?</p>
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
          onClick={handleDelete}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTagDialog;
