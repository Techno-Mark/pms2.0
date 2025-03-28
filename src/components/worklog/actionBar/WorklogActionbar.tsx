import React, { useEffect, useState } from "react";
import { Card, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import Minus from "@/assets/icons/worklogs/Minus";
import Priority from "@/assets/icons/worklogs/Priority";
import DetectorStatus from "@/assets/icons/worklogs/DetectorStatus";
import Delete from "@/assets/icons/worklogs/Delete";
import ContentCopy from "@/assets/icons/worklogs/ContentCopy";
import Comments from "@/assets/icons/worklogs/Comments";
import EditIcon from "@/assets/icons/worklogs/EditIcon";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import { toast } from "react-toastify";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { getStatusDropdownData } from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { DatatableWorklog } from "@/utils/Types/clientWorklog";
import { LabelValueType } from "@/utils/Types/types";
import { priorityOptions } from "@/utils/staticDropdownData";

interface Props {
  selectedRowsCount: number;
  selectedRows: number[];
  selectedRowId: null | number;
  selectedRowIds: number[];
  selectedRowWorkTypeId: number[];
  onEdit: (rowData: number) => void;
  handleClearSelection: () => void;
  onComment: (rowData: boolean, selectedId: number) => void;
  workItemData: DatatableWorklog[];
  getWorkItemList: () => void;
  isCreatedByClient: null | boolean;
  selectedRowDepartmentType: (string | null)[];
  getOverLay: (e: boolean) => void;
}

const WorklogActionbar = ({
  selectedRowsCount,
  selectedRows,
  selectedRowId,
  selectedRowIds,
  selectedRowWorkTypeId,
  onEdit,
  handleClearSelection,
  onComment,
  workItemData,
  getWorkItemList,
  isCreatedByClient,
  selectedRowDepartmentType,
  getOverLay,
}: Props) => {
  const [allStatus, setAllStatus] = useState<LabelValueType[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [anchorElPriority, setAnchorElPriority] =
    React.useState<HTMLButtonElement | null>(null);
  const [anchorElStatus, setAnchorElStatus] =
    React.useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape") {
        handleClearSelection();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClickPriority = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElPriority(event.currentTarget);
  };

  const handleClosePriority = () => {
    setAnchorElPriority(null);
  };

  const handleClickStatus = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElStatus(event.currentTarget);
    getAllStatus();
  };

  const handleCloseStatus = () => {
    setAnchorElStatus(null);
  };

  const openPriority = Boolean(anchorElPriority);
  const idPriority = openPriority ? "simple-popover" : undefined;

  const openStatus = Boolean(anchorElStatus);
  const idStatus = openStatus ? "simple-popover" : undefined;

  const handleOptionPriority = (id: number) => {
    updatePriority(selectedRowIds, id);
    handleClosePriority();
  };

  const handleOptionStatus = (id: number) => {
    updateStatus(selectedRowIds, id);
    handleCloseStatus();
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const updatePriority = async (id: number[], priorityId: number) => {
    getOverLay(true);
    const params = {
      workitemIds: id,
      priority: priorityId,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdatePriority`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Priority has been updated successfully.");
        handleClearSelection();
        getWorkItemList();
        getOverLay(false);
      } else {
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const deleteWorkItem = async () => {
    const deletedId = workItemData
      .map((item: DatatableWorklog) =>
        selectedRowIds.includes(item.WorkitemId) && item.IsCreatedByClient
          ? item.WorkitemId
          : undefined
      )
      .filter((i: number | undefined) => i !== undefined);

    if (selectedRowIds.length > 0) {
      // if (
      //   workItemData.some(
      //     (item: DatatableWorklog) =>
      //       selectedRowIds.includes(item.WorkitemId) && item.IsHasErrorlog
      //   )
      // ) {
      //   toast.warning("After resolving the error log, users can delete it.");
      // }
      if (
        workItemData.some(
          (item: DatatableWorklog) =>
            selectedRowIds.includes(item.WorkitemId) && !item.IsCreatedByClient
        )
      ) {
        toast.warning("You can not delete task which is created by PABS.");
      }
      if (deletedId.length > 0) {
        getOverLay(true);
        const params = {
          workitemIds: deletedId,
        };
        const url = `${process.env.worklog_api_url}/workitem/deleteworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success("Task has been deleted successfully.");
            handleClearSelection();
            getWorkItemList();
            getOverLay(false);
          } else {
            getOverLay(false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      }
    }
  };

  const duplicateWorkItem = async () => {
    const dontDuplicateId = workItemData
      .map((item: DatatableWorklog) =>
        selectedRowIds.includes(item.WorkitemId) && !item.IsCreatedByClient
          ? item.WorkitemId
          : undefined
      )
      .filter((i: number | undefined) => i !== undefined);

    const duplicateId = workItemData
      .map((item: DatatableWorklog) =>
        selectedRowIds.includes(item.WorkitemId) && item.IsCreatedByClient
          ? item.WorkitemId
          : undefined
      )
      .filter((i: number | undefined) => i !== undefined);

    if (dontDuplicateId.length > 0) {
      toast.warning("You can not duplicate task which is created by PABS.");
    }
    if (duplicateId.length > 0) {
      getOverLay(true);
      const params = {
        workitemIds: selectedRowIds,
      };
      const url = `${process.env.worklog_api_url}/workitem/copyworkitem`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Task has been duplicated successfully");
          handleClearSelection();
          getWorkItemList();
          getOverLay(false);
        } else {
          getOverLay(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };
  
  const getAllStatus = async () => {
    const data = await getStatusDropdownData(
      Array.from(new Set(selectedRowWorkTypeId))[0]
    );
    const newData =
      data.length > 0 &&
      data
        .map((i: LabelValueType) =>
          i.Type === "WithdrawnbyClient" || i.Type === "OnHoldFromClient"
            ? i
            : ""
        )
        .filter((i: LabelValueType | undefined | string) => i !== "");
    setAllStatus(
      selectedRowDepartmentType.includes("WhitelabelTaxation") ||
        selectedRowDepartmentType.includes(null)
        ? newData.filter((i: LabelValueType) => i.Type !== "OnHoldFromClient")
        : newData
    );
  };

  const updateStatus = async (id: number[], statusId: number) => {
    getOverLay(true);
    const params = {
      workitemIds: id,
      statusId: statusId,
      SecondManagerReviewId: null,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdateStatus`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Status has been updated successfully.");
        handleClearSelection();
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
      {selectedRowsCount > 0 && (
        <div className="flex items-center justify-center">
          <Card className="rounded-full flex border p-2 border-[#1976d2] absolute shadow-lg w-[65%] bottom-0 -translate-y-1/2">
            <div className="flex flex-row w-full">
              <div className="pt-1 pl-2 flex w-[40%]">
                <span className="cursor-pointer" onClick={handleClearSelection}>
                  <Minus />
                </span>
                <span className="pl-2 pt-[1px] pr-6 text-[14px]">
                  {selectedRowsCount || selectedRows} task selected
                </span>
              </div>

              <div className="flex flex-row z-10 h-8 justify-center w-[90%]">
                {hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
                  selectedRowsCount === 1 &&
                  isCreatedByClient && (
                    <ColorToolTip title="Edit" arrow>
                      <span
                        className="pl-2 pr-2 pt-1 text-slatyGrey cursor-pointer border-l border-lightSilver"
                        onClick={() => {
                          onEdit(Number(selectedRowId));
                        }}
                      >
                        <EditIcon />
                      </span>
                    </ColorToolTip>
                  )}
                {hasPermissionWorklog("Task/SubTask", "Delete", "WorkLogs") &&
                  workItemData
                    .map((i: DatatableWorklog) =>
                      selectedRowIds.includes(i.WorkitemId) &&
                      i.AssignedToId !== null
                        ? i.WorkitemId
                        : undefined
                    )
                    .filter((j: number | undefined) => j !== undefined)
                    .length <= 0 && (
                    <ColorToolTip title="Delete" arrow>
                      <span
                        className="pl-2 pr-2 pt-1 cursor-pointer border-l border-lightSilver"
                        onClick={() => setIsDeleteOpen(true)}
                      >
                        <Delete />
                      </span>
                    </ColorToolTip>
                  )}
                <ColorToolTip title="Priority" arrow>
                  <span
                    aria-describedby={idPriority}
                    onClick={handleClickPriority}
                    className="pl-2 pr-2 pt-1 cursor-pointer border-l border-lightSilver"
                  >
                    <Priority />
                  </span>
                </ColorToolTip>
                {/* Priority Popover */}
                <Popover
                  id={idPriority}
                  open={openPriority}
                  anchorEl={anchorElPriority}
                  onClose={handleClosePriority}
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
                      {priorityOptions.map(
                        (option: { value: number; label: string }) => (
                          <span
                            key={option.value}
                            className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                          >
                            <span
                              className="p-1 cursor-pointer"
                              onClick={() => handleOptionPriority(option.value)}
                            >
                              {option.label}
                            </span>
                          </span>
                        )
                      )}
                    </List>
                  </nav>
                </Popover>

                {hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
                  Array.from(new Set(selectedRowWorkTypeId)).length === 1 && (
                    <ColorToolTip title="Status" arrow>
                      <span
                        aria-describedby={idStatus}
                        onClick={handleClickStatus}
                        className="pl-2 pr-2 pt-1 cursor-pointer border-l border-lightSilver"
                      >
                        <DetectorStatus />
                      </span>
                    </ColorToolTip>
                  )}

                {/* Status Popover */}
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
                <ColorToolTip title="Duplicate Task" arrow>
                  <span
                    className={`pl-2 pr-2 pt-1 cursor-pointer border-l border-lightSilver ${
                      selectedRowsCount > 0 && "border-r"
                    }`}
                    onClick={duplicateWorkItem}
                  >
                    <ContentCopy />
                  </span>
                </ColorToolTip>

                {selectedRowsCount === 1 && (
                  <ColorToolTip title="Comments" arrow>
                    <span
                      className="pl-2 pr-2 pt-1 cursor-pointer border-l border-lightSilver"
                      onClick={() =>
                        onComment(
                          true,
                          selectedRowId !== null ? selectedRowId : 0
                        )
                      }
                    >
                      <Comments />
                    </span>
                  </ColorToolTip>
                )}
              </div>

              <div className="flex right-0 justify-end pr-3 pt-1 w-[60%]">
                <span className="text-gray-400 italic text-[14px] pl-2">
                  shift+click to select, esc to deselect all
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Dialog Box */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onActionClick={deleteWorkItem}
        Title={"Delete Process"}
        firstContent={"Are you sure you want to delete Task?"}
        secondContent={
          "If you delete task, you will permanently loose task and task related data."
        }
      />
    </div>
  );
};

export default WorklogActionbar;
