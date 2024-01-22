import React, { useState } from "react";
import { toast } from "react-toastify";
import { List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import DetectorStatus from "@/assets/icons/worklogs/DetectorStatus";
import { getStatusDropdownData } from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";

const Status = ({
  selectedRowIds,
  selectedRowStatusId,
  workItemData,
  selectedRowsCount,
  getWorkItemList,
  handleClearSelection,
  getOverLay,
}: any) => {
  const [allStatus, setAllStatus] = useState<any | any[]>([]);

  const [anchorElStatus, setAnchorElStatus] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickStatus = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElStatus(event.currentTarget);
    getAllStatus();
  };

  const handleCloseStatus = () => {
    setAnchorElStatus(null);
  };

  const openStatus = Boolean(anchorElStatus);
  const idStatus = openStatus ? "simple-popover" : undefined;

  const handleOptionStatus = (id: any) => {
    updateStatus(selectedRowIds, id);
    handleCloseStatus();
  };

  const getAllStatus = async () => {
    let isRework: any = [];
    let isNotRework: any = [];
    workItemData.map((i: any) => {
      if (selectedRowIds.includes(i.WorkitemId)) {
        if (i.ErrorlogSignedOffPending) {
          isRework.push(i.WorkitemId);
        } else {
          isNotRework.push(i.WorkitemId);
        }
      }
    });
    const data = await getStatusDropdownData();
    data.length > 0 &&
      setAllStatus(
        data.filter(
          (item: any) =>
            item.Type === "PendingFromAccounting" ||
            item.Type === "Rework" ||
            item.Type === "Assigned" ||
            (isNotRework.length > 0
              ? item.Type === "NotStarted" ||
                item.Type === "InProgress" ||
                item.Type === "Stop" ||
                item.Type === "Submitted"
              : item.Type === "ReworkInProgress" ||
                item.Type === "ReworkPrepCompleted" ||
                item.Type === "ReworkSubmitted") ||
            item.Type === "OnHoldFromClient" ||
            item.Type === "WithDraw" ||
            item.Type === "WithdrawnbyClient"
        )
      );
  };

  const updateStatus = async (id: number[], statusId: number) => {
    let isRework: any = [];
    let isNotRework: any = [];
    workItemData.map((i: any) => {
      if (selectedRowIds.includes(i.WorkitemId)) {
        if (i.ErrorlogSignedOffPending) {
          isRework.push(i.WorkitemId);
        } else {
          isNotRework.push(i.WorkitemId);
        }
      }
    });

    getOverLay(true);
    const params = {
      workitemIds: isNotRework.length > 0 ? isNotRework : isRework,
      statusId: statusId,
      SecondManagerReviewId: null,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdateStatus`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Status has been updated successfully.");
        handleClearSelection();
        isNotRework = [];
        isRework = [];
        getWorkItemList();
        getOverLay(false);
      } else if (ResponseStatus === "Warning") {
        toast.warning(ResponseData);
        handleClearSelection();
        isNotRework = [];
        isRework = [];
        getWorkItemList();
        getOverLay(false);
      } else {
        handleClearSelection();
        getWorkItemList();
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Status" arrow>
        <span aria-describedby={idStatus} onClick={handleClickStatus}>
          <DetectorStatus />
        </span>
      </ColorToolTip>
      <Popover
        id={idStatus}
        open={openStatus}
        anchorEl={anchorElStatus}
        onClose={handleCloseStatus}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <nav className="!w-52">
          <List>
            {allStatus.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              allStatus.map((option: any) => {
                return (
                  <span
                    key={option.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="p-1 cursor-pointer"
                      onClick={() => handleOptionStatus(option.value)}
                    >
                      {option.label}
                    </span>
                  </span>
                );
              })
            )}
          </List>
        </nav>
      </Popover>
    </div>
  );
};

export default Status;
