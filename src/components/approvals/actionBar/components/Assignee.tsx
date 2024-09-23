import React, { useState } from "react";
import { toast } from "react-toastify";
import { Avatar, InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import SearchIcon from "@/assets/icons/SearchIcon";
import AssigneeIcon from "@/assets/icons/worklogs/Assignee";
import { getAssigneeDropdownData } from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";
import ConfirmationDiloag from "@/components/common/ConfirmationDiloag";

interface Assignee {
  selectedWorkItemIds: number[];
  handleClearSelection: () => void;
  getReviewList: () => void;
  selectedRowClientId: number[] | [];
  selectedRowWorkTypeId: number[] | [];
  getOverLay?: (e: boolean) => void;
}

const Assignee = ({
  selectedWorkItemIds,
  handleClearSelection,
  getReviewList,
  selectedRowClientId,
  selectedRowWorkTypeId,
  getOverLay,
}: Assignee) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignee, setAssignee] = useState<LabelValue[] | []>([]);
  const [assigneeName, setAssigneeName] = useState<LabelValue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [anchorElAssignee, setAnchorElAssignee] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickAssignee = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElAssignee(event.currentTarget);
    setAssignee(
      await getAssigneeDropdownData(
        selectedRowClientId,
        selectedRowWorkTypeId[0]
      )
    );
  };

  const handleCloseAssignee = () => {
    setAnchorElAssignee(null);
  };

  const openAssignee = Boolean(anchorElAssignee);
  const idAssignee = openAssignee ? "simple-popover" : undefined;

  const handleSearchChange = (e: string) => {
    setSearchQuery(e);
  };

  const filteredAssignees = assignee.filter((assignee: LabelValue) =>
    assignee.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateAssignee = async (assigneeId: number) => {
    getOverLay?.(true);
    const params = {
      workitemIds: selectedWorkItemIds,
      assigneeId: assigneeId,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdateAssignee`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Assignee has been updated successfully.");
        handleClearSelection();
        getReviewList();
        getOverLay?.(false);
        setDialogOpen(false);
        setAssigneeName(null);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        handleClearSelection();
        getReviewList();
        getOverLay?.(false);
        setDialogOpen(false);
        setAssigneeName(null);
      } else {
        getOverLay?.(false);
        setDialogOpen(false);
        setAssigneeName(null);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Assignee" arrow>
        <span aria-describedby={idAssignee} onClick={handleClickAssignee}>
          <AssigneeIcon />
        </span>
      </ColorToolTip>

      {/* Assignee Popover */}
      <Popover
        id={idAssignee}
        open={openAssignee}
        anchorEl={anchorElAssignee}
        onClose={handleCloseAssignee}
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
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {assignee.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredAssignees.map((assignee: LabelValue) => {
                return (
                  <span
                    key={assignee.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => {
                        setDialogOpen(true);
                        setAssigneeName(assignee);
                        handleCloseAssignee();
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                        {assignee.label
                          .split(" ")
                          .map((word: string) => word.charAt(0).toUpperCase())
                          .join("")}
                      </Avatar>

                      <span className="pt-[0.8px]">{assignee.label}</span>
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
          setAssigneeName(null);
        }}
        heading="Change Assignee"
        title={`Are you sure you want to change assignee to ${assigneeName?.label} ?`}
        data={assigneeName}
        updateData={updateAssignee}
      />
    </div>
  );
};

export default Assignee;
