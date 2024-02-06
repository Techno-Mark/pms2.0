import React, { useState } from "react";
import { toast } from "react-toastify";
import { InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import ReviewerIcon from "@/assets/icons/worklogs/Reviewer";
import SearchIcon from "@/assets/icons/SearchIcon";
import { callAPI } from "@/utils/API/callAPI";

const Reviewer = ({
  selectedRowIds,
  getWorkItemList,
  reviewerDropdownData,
  getOverLay,
}: any) => {
  const [reviewerSearchQuery, setReviewerSearchQuery] = useState("");

  const [anchorElReviewer, setAnchorElReviewer] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickReviewer = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElReviewer(event.currentTarget);
  };

  const handleCloseReviewer = () => {
    setAnchorElReviewer(null);
  };

  const openReviewer = Boolean(anchorElReviewer);
  const idReviewer = openReviewer ? "simple-popover" : undefined;

  const handleReviewerSearchChange = (event: any) => {
    setReviewerSearchQuery(event.target.value);
  };

  const filteredReviewer = reviewerDropdownData?.filter((Reviewer: any) =>
    Reviewer.label.toLowerCase().includes(reviewerSearchQuery.toLowerCase())
  );

  const handleOptionReviewer = (id: any) => {
    updateReviewer(selectedRowIds, id);
    handleCloseReviewer();
  };

  const updateReviewer = async (id: number[], ReviewerId: number) => {
    getOverLay(true);
    const params = {
      WorkitemIds: id,
      ReviewerId: ReviewerId,
    };
    const url = `${process.env.worklog_api_url}/workitem/bulkupdateworkitemreviewer`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Reviewer has been updated successfully.");
        getWorkItemList();
        getOverLay(false);
      } else {
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Reviewer" arrow>
        <span aria-describedby={idReviewer} onClick={handleClickReviewer}>
          <ReviewerIcon />
        </span>
      </ColorToolTip>

      {/* Process Reviewer */}
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
                  value={reviewerSearchQuery}
                  onChange={handleReviewerSearchChange}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {reviewerDropdownData?.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredReviewer?.map((Reviewer: any) => {
                return (
                  <span
                    key={Reviewer.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => handleOptionReviewer(Reviewer.value)}
                    >
                      <span className="pt-[0.8px]">{Reviewer.label}</span>
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
