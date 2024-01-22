import React, { useState } from "react";
import { Avatar, InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { toast } from "react-toastify";
import EditUserIcon from "@/assets/icons/EditUserIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import { getReviewerDropdownData } from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";

const Reviewer = ({
  selectedWorkItemIds,
  selectedRowClientId,
  selectedRowWorkTypeId,
  selectedRowStatusId,
  selectedRowsCount,
  handleClearSelection,
  getReviewList,
  getOverLay,
}: any) => {
  const [searchQueryRW, setSearchQueryRW] = useState("");
  const [reviewer, setReviewer] = useState<any | any[]>([]);

  const [anchorElReviewer, setAnchorElReviewer] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickReviewer = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElReviewer(event.currentTarget);
    setReviewer(
      await getReviewerDropdownData(
        selectedRowClientId,
        selectedRowWorkTypeId[0]
      )
    );
  };

  const handleCloseReviewer = () => {
    setAnchorElReviewer(null);
  };

  const openReviewer = Boolean(anchorElReviewer);
  const idReviewer = openReviewer ? "simple-popover" : undefined;

  const handleSearchChangeRW = (event: any) => {
    setSearchQueryRW(event.target.value);
  };

  const filteredReviewer = reviewer.filter((reviewer: any) =>
    reviewer.label.toLowerCase().includes(searchQueryRW.toLowerCase())
  );

  const handleOptionReviewer = (id: any) => {
    updateReviewer(selectedWorkItemIds, id);
    handleCloseReviewer();
  };

  const updateReviewer = async (id: number[], reviewerId: number) => {
    getOverLay(true);
    const params = {
      workitemIds: id,
      ReviewerId: reviewerId,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdateReviewer`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        toast.success("Reviewer has been updated successfully.");
        handleClearSelection();
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
      <ColorToolTip title="Reviewer" arrow>
        <span aria-describedby={idReviewer} onClick={handleClickReviewer}>
          <EditUserIcon />
        </span>
      </ColorToolTip>

      {/* Reviewer Popover */}
      <Popover
        id={idReviewer}
        open={openReviewer}
        anchorEl={anchorElReviewer}
        onClose={handleCloseReviewer}
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

export default Reviewer;
