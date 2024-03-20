import React, { useState } from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import EditTimeIcon from "@/assets/icons/worklogs/EditTime";
import EditDialog from "../../EditDialog";

interface EditTime {
  workitemId: number;
  id: number;
  getReviewList: () => void;
  handleClearSelection: () => void;
  getOverLay?: (e: boolean) => void;
}

const EditTime = ({
  workitemId,
  id,
  getReviewList,
  handleClearSelection,
  getOverLay,
}: EditTime) => {
  const [isEditOpen, setisEditOpen] = useState<boolean>(false);

  const closeModal = () => {
    setisEditOpen(false);
  };

  return (
    <div>
      <ColorToolTip title="Edit Time" arrow>
        <span onClick={() => setisEditOpen(true)}>
          <EditTimeIcon />
        </span>
      </ColorToolTip>

      <EditDialog
        onOpen={isEditOpen}
        onClose={closeModal}
        onSelectWorkItemId={workitemId}
        onSelectedSubmissionId={id}
        onReviewerDataFetch={getReviewList}
        onClearSelection={handleClearSelection}
        getOverLay={getOverLay}
      />
    </div>
  );
};

export default EditTime;
