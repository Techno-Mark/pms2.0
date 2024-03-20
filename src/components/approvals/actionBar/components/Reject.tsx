import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import React, { useState } from "react";
import RejectDialog from "../../RejectDialog";
import RejectIcon from "@/assets/icons/worklogs/RejectIcon";

interface Reject {
  selectedRowIds: number[] | [];
  rejectWorkitem: (note: string, id: number[]) => void;
}

const Reject = ({ selectedRowIds, rejectWorkitem }: any) => {
  const [isRejectOpen, setisRejectOpen] = useState<boolean>(false);

  const closeModal = () => {
    setisRejectOpen(false);
  };

  return (
    <div>
      <ColorToolTip title="Reject with Note" arrow>
        <span onClick={() => setisRejectOpen(true)}>
          <RejectIcon />
        </span>
      </ColorToolTip>

      <RejectDialog
        onOpen={isRejectOpen}
        onClose={closeModal}
        rejectWorkItem={rejectWorkitem}
        selectedWorkItemIds={selectedRowIds}
      />
    </div>
  );
};

export default Reject;
