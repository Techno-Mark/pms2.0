import React, { useState } from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import EditTimeIcon from "@/assets/icons/worklogs/EditTime";
import EditDialog from "../../EditDialog";

const EditTime = ({
  workitemId,
  id,
  getReviewList,
  handleClearSelection,
  getOverLay,
}: any) => {
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

      {/* Filter Dialog Box */}
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
