import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import CommentsIcon from "@/assets/icons/worklogs/Comments";

const Comments = ({ onComment, selectedRowId }: any) => {
  return (
    <div>
      <ColorToolTip title="Comments" arrow>
        <span onClick={() => onComment(true, selectedRowId)}>
          <CommentsIcon />
        </span>
      </ColorToolTip>
    </div>
  );
};

export default Comments;
