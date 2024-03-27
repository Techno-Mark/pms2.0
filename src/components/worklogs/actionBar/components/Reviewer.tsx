import React, { useState } from "react";
import { toast } from "react-toastify";
import { InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import ReviewerIcon from "@/assets/icons/worklogs/Reviewer";
import SearchIcon from "@/assets/icons/SearchIcon";
import { callAPI } from "@/utils/API/callAPI";
import { getReviewerDropdownData } from "@/utils/commonDropdownApiCall";
import { LabelValue } from "@/utils/Types/types";

const Reviewer = ({
  selectedRowIds,
  getWorkItemList,
  selectedRowClientId,
  selectedRowWorkTypeId,
  areAllValuesSame,
  getOverLay,
}: {
  selectedRowIds: number[];
  selectedRowClientId: number[];
  selectedRowWorkTypeId: number[];
  areAllValuesSame: any;
  getWorkItemList: () => void;
  getOverLay: (e: boolean) => void;
}) => {
  const [reviewerSearchQuery, setReviewerSearchQuery] = useState("");
  const [reviewer, setReviewer] = useState<LabelValue[]>([]);

  const [anchorElReviewer, setAnchorElReviewer] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickReviewer = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElReviewer(event.currentTarget);
    if (
      selectedRowClientId.length > 0 &&
      selectedRowWorkTypeId.length > 0 &&
      areAllValuesSame(selectedRowClientId) &&
      areAllValuesSame(selectedRowWorkTypeId)
    ) {
      const getReviewer = async () => {
        setReviewer(
          await getReviewerDropdownData(
            selectedRowClientId,
            selectedRowWorkTypeId[0]
          )
        );
      };

      getReviewer();
    } else {
      setReviewer([]);
    }
  };

  const handleCloseReviewer = () => {
    setAnchorElReviewer(null);
  };

  const openReviewer = Boolean(anchorElReviewer);
  const idReviewer = openReviewer ? "simple-popover" : undefined;

  const handleReviewerSearchChange = (e: string) => {
    setReviewerSearchQuery(e);
  };

  const filteredReviewer = reviewer?.filter((Reviewer: LabelValue) =>
    Reviewer.label.toLowerCase().includes(reviewerSearchQuery.toLowerCase())
  );

  const handleOptionReviewer = (id: number) => {
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
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Reviewer has been updated successfully.");
        getWorkItemList();
        getOverLay(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
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
                  onChange={(e) => handleReviewerSearchChange(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {reviewer?.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredReviewer?.map((Reviewer: LabelValue) => {
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
