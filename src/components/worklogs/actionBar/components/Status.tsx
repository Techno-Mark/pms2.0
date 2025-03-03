import React, { useState } from "react";
import { toast } from "react-toastify";
import { List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import DetectorStatus from "@/assets/icons/worklogs/DetectorStatus";
import { getStatusDropdownData } from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { WorkitemList } from "@/utils/Types/worklogsTypes";
import { LabelValueType } from "@/utils/Types/types";

const Status = ({
  selectedRowIds,
  workItemData,
  getWorkItemList,
  handleClearSelection,
  selectedRowWorkTypeId,
  selectedRowDepartmentType,
  getOverLay,
}: {
  selectedRowIds: number[];
  workItemData: WorkitemList[];
  getWorkItemList: () => void;
  handleClearSelection: () => void;
  selectedRowWorkTypeId: number[];
  selectedRowDepartmentType: (string | null)[];
  getOverLay?: (e: boolean) => void;
}) => {
  const [allStatus, setAllStatus] = useState<LabelValueType[]>([]);

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

  const handleOptionStatus = (id: number) => {
    updateStatus(selectedRowIds, id);
    handleCloseStatus();
  };
console.log(selectedRowDepartmentType)
  const getAllStatus = async () => {
    let isRework: number[] = [];
    let isNotRework: number[] = [];
    workItemData.map((i: WorkitemList) => {
      if (selectedRowIds.includes(i.WorkitemId)) {
        if (i.ErrorlogSignedOffPending) {
          isRework.push(i.WorkitemId);
        } else {
          isNotRework.push(i.WorkitemId);
        }
      }
    });

    const data = await getStatusDropdownData(
      Array.from(new Set(selectedRowWorkTypeId))[0]
    );
    const newData =
      data.length > 0 &&
      data.filter(
        (item: LabelValueType) =>
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
      );
    setAllStatus(
      selectedRowDepartmentType.includes("WhitelabelTaxation") ||
        selectedRowDepartmentType.includes(null)
        ? newData.filter((i: LabelValueType) => i.Type !== "OnHoldFromClient")
        : newData
    );
  };

  const updateStatus = async (id: number[], statusId: number) => {
    let isRework: number[] = [];
    let isNotRework: number[] = [];
    workItemData.map((i: WorkitemList) => {
      if (selectedRowIds.includes(i.WorkitemId)) {
        if (i.ErrorlogSignedOffPending) {
          isRework.push(i.WorkitemId);
        } else {
          isNotRework.push(i.WorkitemId);
        }
      }
    });

    getOverLay?.(true);
    const params = {
      workitemIds: isNotRework.length > 0 ? isNotRework : isRework,
      statusId: statusId,
      SecondManagerReviewId: null,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdateStatus`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Status has been updated successfully.");
        handleClearSelection();
        isNotRework = [];
        isRework = [];
        getWorkItemList();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        handleClearSelection();
        isNotRework = [];
        isRework = [];
        getWorkItemList();
        getOverLay?.(false);
      } else {
        handleClearSelection();
        getWorkItemList();
        getOverLay?.(false);
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
              allStatus.map((option: LabelValueType) => {
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
