import React, { useEffect, useState } from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import AcceptIcon from "@/assets/icons/worklogs/AcceptIcon";
import AcceptDiloag from "../../AcceptDiloag";
import { List } from "@/utils/Types/approvalsTypes";

interface Accept {
  reviewList: List[] | [];
  selectedRowIds: number[] | [];
  acceptWorkitem: (note: string, id: number[]) => void;
  handleEditClicked: (click: boolean) => void;
}

const Accept = ({
  reviewList,
  selectedRowIds,
  acceptWorkitem,
  handleEditClicked,
}: Accept) => {
  const [isAcceptOpen, setisAcceptOpen] = useState<boolean>(false);
  const [data, setData] = useState<any>([]);

  const closeModal = () => {
    setisAcceptOpen(false);
  };

  useEffect(() => {
    if (selectedRowIds.length === 1) {
      const item = reviewList.find(
        (i: List) => i.SubmissionId === selectedRowIds[0]
      );
      !!item ? setData([{ ...item }]) : setData([]);
    } else {
      setData([]);
    }
  }, [selectedRowIds]);

  return (
    <div>
      <ColorToolTip title="Accept" arrow>
        <span onClick={() => setisAcceptOpen(true)}>
          <AcceptIcon />
        </span>
      </ColorToolTip>

      <AcceptDiloag
        onOpen={isAcceptOpen}
        onClose={closeModal}
        acceptWorkitem={acceptWorkitem}
        selectedWorkItemIds={selectedRowIds}
        data={data}
        handleEditClicked={handleEditClicked}
      />
    </div>
  );
};

export default Accept;
