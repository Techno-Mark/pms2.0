import React, { useState } from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import AcceptDiloag from "../../AcceptDiloag";
import AcceptNote from "@/assets/icons/worklogs/AcceptNote";

const AcceptWithNotes = ({ selectedRowIds, acceptWorkitem }: any) => {
  const [isAcceptOpen, setisAcceptOpen] = useState<boolean>(false);

  const closeModal = () => {
    setisAcceptOpen(false);
  };

  return (
    <div>
      <ColorToolTip title="Accept with Note" arrow>
        <span
          onClick={() => setisAcceptOpen(true)}
        >
          <AcceptNote />
        </span>
      </ColorToolTip>

      <AcceptDiloag
        onOpen={isAcceptOpen}
        onClose={closeModal}
        acceptWorkitem={acceptWorkitem}
        selectedWorkItemIds={selectedRowIds}
      />
    </div>
  );
};

export default AcceptWithNotes;
