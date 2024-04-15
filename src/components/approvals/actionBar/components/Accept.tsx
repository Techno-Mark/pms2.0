import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import AcceptIcon from "@/assets/icons/worklogs/AcceptIcon";

interface Accept {
  selectedRowIds: number[] | [];
  acceptWorkitem: (note: string, id: number[]) => void;
}

const Accept = ({ selectedRowIds, acceptWorkitem }: Accept) => {
  return (
    <div>
      <ColorToolTip title="Accept" arrow>
        <span onClick={() => acceptWorkitem("", selectedRowIds)}>
          <AcceptIcon />
        </span>
      </ColorToolTip>
    </div>
  );
};

export default Accept;
