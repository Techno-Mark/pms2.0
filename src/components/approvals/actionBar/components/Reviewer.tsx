import React, { useState } from "react";
import { Avatar, InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { toast } from "react-toastify";
import EditUserIcon from "@/assets/icons/EditUserIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import { getReviewerDropdownData } from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";
import ConfirmationDiloag from "@/components/common/ConfirmationDiloag";

interface Reviewer {
  selectedWorkItemIds: number[];
  selectedRowClientId: number[] | [];
  selectedRowWorkTypeId: number[] | [];
  handleClearSelection: () => void;
  getReviewList: () => void;
  getOverLay?: (e: boolean) => void;
}

const Reviewer = ({
  selectedWorkItemIds,
  selectedRowClientId,
  selectedRowWorkTypeId,
  handleClearSelection,
  getReviewList,
  getOverLay,
}: Reviewer) => {
  const [searchQueryRW, setSearchQueryRW] = useState("");
  const [reviewer, setReviewer] = useState<LabelValue[] | []>([]);
  const [reviewerName, setReviewerName] = useState<LabelValue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleSearchChangeRW = (e: string) => {
    setSearchQueryRW(e);
  };

  const filteredReviewer = reviewer.filter((reviewer: LabelValue) =>
    reviewer.label.toLowerCase().includes(searchQueryRW.toLowerCase())
  );

  const updateReviewer = async (reviewerId: number) => {
    getOverLay?.(true);
    const params = {
      workitemIds: selectedWorkItemIds,
      ReviewerId: reviewerId,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdateReviewer`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        toast.success("Reviewer has been updated successfully.");
        handleClearSelection();
        getReviewList();
        getOverLay?.(false);
        setDialogOpen(false);
        setReviewerName(null);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        handleClearSelection();
        getReviewList();
        getOverLay?.(false);
        setDialogOpen(false);
        setReviewerName(null);
      } else {
        getReviewList();
        getOverLay?.(false);
        setDialogOpen(false);
        setReviewerName(null);
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
                      onClick={() => {
                        setDialogOpen(true);
                        setReviewerName(reviewer);
                        handleCloseReviewer();
                      }}
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

      <ConfirmationDiloag
        onOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setReviewerName(null);
        }}
        heading="Change Reviewer"
        title={`Are you sure you want to change reviewer to ${reviewerName?.label} ?`}
        data={reviewerName}
        updateData={updateReviewer}
      />
    </div>
  );
};

export default Reviewer;
