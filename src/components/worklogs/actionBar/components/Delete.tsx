import React, { useState } from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import DeleteIcon from "@/assets/icons/worklogs/Delete";
import { toast } from "react-toastify";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { callAPI } from "@/utils/API/callAPI";

const Delete = ({
  workItemData,
  selectedRowId,
  selectedRowIds,
  selectedRowStatusId,
  handleClearSelection,
  getWorkItemList,
  getOverLay,
}: any) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const deleteWorkItem = async () => {
    const deletedId = workItemData
      .map((item: any) =>
        selectedRowIds.includes(item.WorkitemId) && !item.IsCreatedByClient
          ? item.WorkitemId
          : undefined
      )
      .filter((i: any) => i !== undefined);

    if (selectedRowIds.length > 0) {
      if (
        workItemData.some(
          (item: any) =>
            selectedRowIds.includes(item.WorkitemId) && item.IsCreatedByClient
        )
      ) {
        toast.warning("You can not delete task which is created by Client.");
      }
      if (deletedId.length > 0) {
        getOverLay(true);
        const params = {
          workitemIds: deletedId,
        };
        const url = `${process.env.worklog_api_url}/workitem/deleteworkitem`;
        const successCallback = (
          ResponseData: any,
          error: any,
          ResponseStatus: any
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success("Task has been deleted successfully.");
            handleClearSelection();
            getWorkItemList();
            getOverLay(false);
          } else if (ResponseStatus === "Warning") {
            toast.warning(ResponseData);
            handleClearSelection();
            getWorkItemList();
            getOverLay(false);
          } else {
            handleClearSelection();
            getWorkItemList();
            getOverLay(false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      }
    }
  };

  return (
    <div>
      <ColorToolTip title="Delete" arrow>
        <span onClick={() => setIsDeleteOpen(true)}>
          <DeleteIcon />
        </span>
      </ColorToolTip>

      {/* Delete Dialog Box */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onActionClick={deleteWorkItem}
        Title={"Delete Task"}
        firstContent={"Are you sure you want to delete Task?"}
        secondContent={
          "If you delete task, you will permanently loose task and task related data."
        }
      />
    </div>
  );
};

export default Delete;
