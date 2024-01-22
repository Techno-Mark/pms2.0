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

const Status = ({
  selectedWorkItemIds,
  selectedRowStatusId,
  reviewList,
  selectedRowsCount,
  handleClearSelection,
  getReviewList,
  selectedRowClientId,
  selectedRowWorkTypeId,
  getOverLay,
}: any) => {
  const [allStatus, setAllStatus] = useState<any | any[]>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [reviewer, setReviewer] = useState<any | any[]>([]);
  const [searchQueryRW, setSearchQueryRW] = useState("");

  const handleSearchChangeRW = (event: any) => {
    setSearchQueryRW(event.target.value);
  };

  const filteredReviewer = reviewer.filter((reviewer: any) =>
    reviewer.label.toLowerCase().includes(searchQueryRW.toLowerCase())
  );

  const handleOptionReviewer = (id: any) => {
    updateStatus(56, id);
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

  const handleOptionStatus = async (id: any) => {
    if (id == 56) {
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
    const data = await getStatusDropdownData();
    data.length > 0 &&
      setAllStatus(
        data.filter(
          (item: any) =>
            item.Type === "Rework" ||
            (isNotRework.length > 0
              ? item.Type === "InReview" ||
                item.Type === "Submitted" ||
                item.Type === "Accept"
              : item.Type === "ReworkInReview" ||
                item.Type === "ReworkSubmitted" ||
                item.Type === "ReworkAccept") ||
            item.Type === "SecondManagerReview" ||
            item.Type === "OnHoldFromClient" ||
            item.Type === "WithDraw" ||
            item.Type === "WithdrawnbyClient"
        )
      );
  };

  const updateStatus = async (statusId: number, secondReviewerId: any) => {
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

    getOverLay(true);
    const params = {
      workitemIds: isNotRework.length > 0 ? isNotRework : isRework,
      statusId: statusId,
      SecondManagerReviewId: secondReviewerId,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdateStatus`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Status has been updated successfully.");
        isNotRework = [];
        isRework = [];
        handleClearSelection();
        getReviewList();
        getOverLay(false);
      } else if (ResponseStatus === "Warning") {
        toast.warning(ResponseData);
        handleClearSelection();
        isNotRework = [];
        isRework = [];
        getReviewList();
        getOverLay(false);
      } else {
        getReviewList();
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
            {allStatus.map((option: any) => {
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
                  onChange={handleSearchChangeRW}
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
              filteredReviewer.map((reviewer: any) => {
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
                          .map((word: any) => word.charAt(0).toUpperCase())
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
