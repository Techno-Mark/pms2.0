import React, { useEffect, useState } from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import EditTimeIcon from "@/assets/icons/worklogs/EditTime";
import EditDialog from "../../EditDialog";

interface EditTime {
  workitemId: number;
  id: number;
  getReviewList: () => void;
  handleClearSelection: () => void;
  getOverLay?: (e: boolean) => void;
  editClicked: boolean;
  handleEditClicked: (click: boolean) => void;
}

const EditTime = ({
  workitemId,
  id,
  getReviewList,
  handleClearSelection,
  getOverLay,
  editClicked,
  handleEditClicked,
}: EditTime) => {
  const [isEditOpen, setisEditOpen] = useState<boolean>(false);

  const closeModal = () => {
    setisEditOpen(false);
  };

  useEffect(() => {
    editClicked && setisEditOpen(true);
  }, [editClicked]);

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
        handleEditClicked={handleEditClicked}
      />
    </div>
  );
};

export default EditTime;
