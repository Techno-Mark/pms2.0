import CustomActionBar from "@/components/common/actionBar/CustomActionBar";
import React, { useState } from "react";
import Client from "./components/Client";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { Close } from "@mui/icons-material";

const UnProcessActionBar = ({
  selectedRowsCount,
  selectedRows,
  selectedRowIds,
  getData,
  handleClearSelection,
  getOverLay,
  tab = "Unprocess",
  getTabData,
}: {
  selectedRowsCount: number;
  selectedRows: number[];
  selectedRowIds: number[];
  getData: () => void;
  handleClearSelection: () => void;
  getOverLay?: (e: boolean) => void;
  tab?: string;
  getTabData?: () => void;
}) => {
  const [isSentOpen, setIsSentOpen] = useState(false);
  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowIds,
    getData,
    handleClearSelection,
    getOverLay,
  };

  const ConditionalComponentWithoutConditions = ({
    Component,
    propsForActionBar,
    className,
    getOverLay,
  }: any) => (
    <span
      className={`pl-2 pr-2 cursor-pointer border-l-[1.5px] border-gray-300 ${className}`}
    >
      <Component {...propsForActionBar} getOverLay={getOverLay} />
    </span>
  );

  const submitWorkItem = async () => {
    getOverLay?.(true);
    const params = {
      TicketIds: selectedRowIds,
    };
    const url = `${process.env.emailbox_api_url}/emailbox/mailmove`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success(
          "Selected emails have been moved to the Inbox successfully."
        );
        handleClearSelection();
        setIsSentOpen(false);
        getData();
        getTabData?.();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning") {
        toast.warning(ResponseData);
        handleClearSelection();
        setIsSentOpen(false);
        getData();
        getOverLay?.(false);
      } else {
        getOverLay?.(false);
        setIsSentOpen(false);
        handleClearSelection();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const MoveToInboxButton = () => (
    <span className="pl-2 pr-2 border-t-0 cursor-pointer border-b-0 border-x-[1.5px] border-gray-300">
      <Button
        variant="outlined"
        className=" rounded-[4px] h-8 !text-[10px]"
        onClick={() => setIsSentOpen(true)}
      >
        Move to Inbox
      </Button>
    </span>
  );

  return (
    <div>
      <CustomActionBar small={true} {...propsForActionBar}>
        {tab === "Unprocess" && (
          <ConditionalComponentWithoutConditions
            Component={Client}
            className="border-r"
            propsForActionBar={{
              selectedRowIds: selectedRowIds,
              selectedRowsCount: selectedRowsCount,
              getData: getData,
              handleClearSelection: handleClearSelection,
              getTabData: getTabData,
            }}
            getOverLay={getOverLay}
          />
        )}
        {tab === "Junk" && <MoveToInboxButton />}
      </CustomActionBar>
      <Dialog
        open={isSentOpen}
        onClose={() => {
          setIsSentOpen(false);
          handleClearSelection();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <div className="flex flex-row justify-between items-center">
            <span>Move to Inbox</span>
            <ColorToolTip title="Close" placement="top" arrow>
              <IconButton
                onClick={() => {
                  setIsSentOpen(false);
                  handleClearSelection();
                }}
              >
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
              Are you sure you want to move the selected emails to the Inbox?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="mb-2">
          <Button
            className="bg-defaultRed"
            onClick={() => {
              setIsSentOpen(false);
              handleClearSelection();
            }}
            variant="contained"
            color="error"
          >
            Cancel
          </Button>
          <Button
            className="!bg-secondary"
            onClick={() => submitWorkItem()}
            autoFocus
            variant="contained"
          >
            Move to Inbox
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UnProcessActionBar;
