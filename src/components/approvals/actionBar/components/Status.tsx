import React, { useState } from "react";
import { toast } from "react-toastify";
import { Avatar, InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import DetectorStatus from "@/assets/icons/worklogs/DetectorStatus";
import {
  getReviewerDropdownData,
  getStatusDropdownData,
} from "@/utils/commonDropdownApiCall";
import SearchIcon from "@/assets/icons/SearchIcon";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue, LabelValueType } from "@/utils/Types/types";

interface Status {
  selectedWorkItemIds: number[];
  reviewList: any;
  handleClearSelection: () => void;
  getReviewList: () => void;
  selectedRowClientId: number[] | [];
  selectedRowWorkTypeId: number[] | [];
  getOverLay?: (e: boolean) => void;
  activeTab: number;
}

const Status = ({
  selectedWorkItemIds,
  reviewList,
  handleClearSelection,
  getReviewList,
  selectedRowClientId,
  selectedRowWorkTypeId,
  getOverLay,
  activeTab,
}: Status) => {
  const [allStatus, setAllStatus] = useState<LabelValueType[] | []>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [reviewer, setReviewer] = useState<LabelValue[] | []>([]);
  const [searchQueryRW, setSearchQueryRW] = useState("");

  const handleSearchChangeRW = (e: string) => {
    setSearchQueryRW(e);
  };

  const filteredReviewer = reviewer.filter((reviewer: LabelValue) =>
    reviewer.label.toLowerCase().includes(searchQueryRW.toLowerCase())
  );

  const handleOptionReviewer = (id: number) => {
    const data = allStatus.find(
      (i: LabelValueType) => i.Type == "SecondManagerReview"
    );
    !!data && updateStatus(data.value, id);
  };

  const [anchorElStatus, setAnchorElStatus] =
    React.useState<HTMLButtonElement | null>(null);
  const [anchorElSecondPopover, setAnchorElSecondPopover] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickStatus = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElStatus(event.currentTarget);
    getAllStatus();
  };

  const handleCloseStatus = () => {
    setAnchorElStatus(null);
  };

  const handleClickSecondPopover = () => {
    setAnchorElSecondPopover(anchorElStatus);
    setOpenDrawer(true);
  };

  const handleCloseSecondPopover = () => {
    setAnchorElSecondPopover(null);
    setOpenDrawer(false);
  };

  const openStatus = Boolean(anchorElStatus);
  const idStatus = openStatus ? "simple-popover" : undefined;

  const openSecondPopover = Boolean(anchorElSecondPopover);
  const idSecondPopover = openSecondPopover ? "simple-popover" : undefined;

  const handleOptionStatus = async (Type: string | number, id: number) => {
    if (Type == "SecondManagerReview") {
      setReviewer(
        await getReviewerDropdownData(
          selectedRowClientId,
          selectedRowWorkTypeId[0]
        )
      );
      setOpenDrawer(true);
      handleClickSecondPopover();
    } else {
      updateStatus(id, null);
    }
    handleCloseStatus();
  };

  const getAllStatus = async () => {
    let isRework: any = [];
    let isNotRework: any = [];
    reviewList.map((i: any) => {
      if (selectedWorkItemIds.includes(i.WorkitemId)) {
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

    data.length > 0 && activeTab === 1
      ? setAllStatus(
          data.filter(
            (item: LabelValueType) =>
              item.Type === "InReviewWithClients" ||
              item.Type === "Rework" ||
              (isNotRework.length > 0
                ? item.Type === "InReview" || item.Type === "Submitted"
                : // ||
                  // item.Type === "Accept"
                  item.Type === "ReworkInReview" ||
                  item.Type === "ReworkSubmitted") ||
              // ||
              // item.Type === "ReworkAccept"
              item.Type === "SecondManagerReview" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient"
          )
        )
      : data.length > 0 && activeTab === 2
      ? setAllStatus(data)
      : setAllStatus([]);
  };

  const updateStatus = async (
    statusId: number,
    secondReviewerId: number | null
  ) => {
    let isRework: any = [];
    let isNotRework: any = [];
    reviewList.map((i: any) => {
      if (selectedWorkItemIds.includes(i.WorkitemId)) {
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
      SecondManagerReviewId: secondReviewerId,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdateStatus`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Status has been updated successfully.");
        isNotRework = [];
        isRework = [];
        handleClearSelection();
        getReviewList();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        handleClearSelection();
        isNotRework = [];
        isRework = [];
        getReviewList();
        getOverLay?.(false);
      } else {
        getReviewList();
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
            {allStatus.map((option: LabelValueType) => {
              return (
                <span
                  key={option.value}
                  className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                >
                  <span
                    className="p-1 cursor-pointer"
                    onClick={() =>
                      handleOptionStatus(option.Type, option.value)
                    }
                  >
                    {option.label}
                  </span>
                </span>
              );
            })}
          </List>
        </nav>
      </Popover>

      <Popover
        id={idSecondPopover}
        open={openDrawer}
        anchorEl={anchorElSecondPopover}
        onClose={handleCloseSecondPopover}
        anchorReference="anchorEl"
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
          <div className="mr-4 ml-4 mt-4">
            <div
              className="flex items-center h-10 rounded-md pl-2 flex-row"
              style={{
                border: "1px solid lightgray",
              }}
            >
              <span className="mr-2">
                <SearchIcon />
              </span>
              <span>
                <InputBase
                  placeholder="Search"
                  inputProps={{ "aria-label": "search" }}
                  value={searchQueryRW}
                  onChange={(e) => handleSearchChangeRW(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {reviewer.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredReviewer.map((reviewer: LabelValue) => {
                return (
                  <span
                    key={reviewer.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => handleOptionReviewer(reviewer.value)}
                    >
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                        {reviewer.label
                          ?.split(" ")
                          .map((word: string) => word.charAt(0).toUpperCase())
                          .join("")}
                      </Avatar>

                      <span className="pt-[0.8px]">{reviewer.label}</span>
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
