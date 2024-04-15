import React from "react";
import { toast } from "react-toastify";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import ContentCopy from "@/assets/icons/worklogs/ContentCopy";
import { callAPI } from "@/utils/API/callAPI";
import { WorkitemList } from "@/utils/Types/worklogsTypes";

const Duplicate = ({
  workItemData,
  selectedRowIds,
  handleClearSelection,
  getWorkItemList,
  getOverLay,
}: {
  workItemData: WorkitemList[];
  selectedRowIds: number[];
  handleClearSelection: () => void;
  getWorkItemList: () => void;
  getOverLay?: (e: boolean) => void;
}) => {
  const duplicateWorkItem = async () => {
    const dontDuplicateId = workItemData
      .map((item: WorkitemList) =>
        selectedRowIds.includes(item.WorkitemId) && item.IsCreatedByClient
          ? item.WorkitemId
          : undefined
      )
      .filter((i: number | undefined) => i !== undefined);

    const duplicateId = workItemData
      .map((item: WorkitemList) =>
        selectedRowIds.includes(item.WorkitemId) && !item.IsCreatedByClient
          ? item.WorkitemId
          : undefined
      )
      .filter((i: number | undefined) => i !== undefined);

    if (dontDuplicateId.length > 0) {
      toast.warning("You can not duplicate task which is created by PABS.");
    }
    if (duplicateId.length > 0) {
      getOverLay?.(true);
      const params = {
        workitemIds: duplicateId,
      };
      const url = `${process.env.worklog_api_url}/workitem/copyworkitem`;
      const successCallback = (
        ResponseData: boolean | string,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Task has been duplicated successfully");
          handleClearSelection();
          getWorkItemList();
          getOverLay?.(false);
        } else if (ResponseStatus === "Warning" && error === false) {
          toast.warning(ResponseData);
          handleClearSelection();
          getWorkItemList();
          getOverLay?.(false);
        } else {
          getOverLay?.(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };
  return (
    <div>
      <ColorToolTip title="Duplicate Task" arrow>
        <span onClick={duplicateWorkItem}>
          <ContentCopy />
        </span>
      </ColorToolTip>
    </div>
  );
};

export default Duplicate;
