import CustomActionBar from "@/components/common/actionBar/CustomActionBar";
import React from "react";
import Client from "./components/Client";
import { Button } from "@mui/material";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";

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
        toast.success("Task moved to inbox successfully.");
        handleClearSelection();
        getData();
        getTabData?.();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning") {
        toast.warning(ResponseData);
        handleClearSelection();
        getData();
        getOverLay?.(false);
      } else {
        getOverLay?.(false);
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
        onClick={submitWorkItem}
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
    </div>
  );
};

export default UnProcessActionBar;
