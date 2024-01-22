import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import AcceptIcon from "@/assets/icons/worklogs/AcceptIcon";

const Accept = ({ selectedRowIds, acceptWorkitem }: any) => {
  return (
    <div>
      <ColorToolTip title="Accept" arrow>
        <span
          onClick={() => acceptWorkitem("", selectedRowIds)}
        >
          <AcceptIcon />
        </span>
      </ColorToolTip>
    </div>
  );
};

export default Accept;
