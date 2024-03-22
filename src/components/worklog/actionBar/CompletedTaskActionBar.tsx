import React, { useEffect, useState } from "react";
import { Card } from "@mui/material";
import Minus from "@/assets/icons/worklogs/Minus";
import Rating_Star from "@/assets/icons/worklog_Client/Rating_Star";
import Comments from "@/assets/icons/worklogs/Comments";
import ErrorLogs from "@/assets/icons/worklogs/ErrorLogs";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import RatingDialog from "../RatingDialog";
import { DatatableWorklog } from "@/utils/Types/clientWorklog";

interface Props {
  selectedRowsCount: number;
  selectedRows: number[];
  selectedRowId: null | number;
  handleClearSelection: () => void;
  onComment: (rowData: boolean, selectedId: number) => void;
  onErrorLog?: (rowData: boolean, selectedId: number) => void;
  getWorkItemList: () => void;
  selectedRowIds: number[];
  workItemData: DatatableWorklog[];
  onDataFetch: (getData: () => void) => void;
}

const CompletedTaskActionBar = ({
  selectedRowsCount,
  selectedRows,
  selectedRowId,
  handleClearSelection,
  onComment,
  onErrorLog,
  getWorkItemList,
  selectedRowIds,
  workItemData,
  onDataFetch,
}: Props) => {
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape") {
        handleClearSelection();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeRatingDialog = () => {
    setIsRatingOpen(false);
    getWorkItemList();
  };

  return (
    <div>
      {selectedRowsCount > 0 && (
        <div className="flex items-center justify-center">
          <Card className="rounded-full flex border p-2 border-[#1976d2] absolute shadow-lg w-[45%] bottom-0 -translate-y-1/2">
            <div className="flex flex-row w-full">
              <div className="pt-1 pl-2 flex w-[40%]">
                <span className="cursor-pointer" onClick={handleClearSelection}>
                  <Minus />
                </span>
                <span className="pl-2 pt-[1px] pr-6 text-[14px]">
                  {selectedRowsCount || selectedRows} task selected
                </span>
              </div>

              <div className="flex flex-row z-10 h-8 justify-center">
                <ColorToolTip title="Rating" arrow>
                  <span
                    className="px-2 pt-1 text-slatyGrey cursor-pointer border-l border-r border-lightSilver"
                    onClick={() => setIsRatingOpen(true)}
                  >
                    <Rating_Star />
                  </span>
                </ColorToolTip>
                {selectedRowsCount === 1 && (
                  <ColorToolTip title="Comments" arrow>
                    <span
                      className="pl-2 pr-2 pt-1 cursor-pointer border-l border-lightSilver"
                      onClick={() =>
                        onComment(
                          true,
                          selectedRowId !== null ? selectedRowId : 0
                        )
                      }
                    >
                      <Comments />
                    </span>
                  </ColorToolTip>
                )}

                {selectedRowsCount === 1 && (
                  <ColorToolTip title="Error logs" arrow>
                    <span
                      className="pl-2 pr-2 pt-1 cursor-pointer border-l border-r border-lightSilver"
                      onClick={() =>
                        onErrorLog?.(
                          true,
                          selectedRowId !== null ? selectedRowId : 0
                        )
                      }
                    >
                      <ErrorLogs />
                    </span>
                  </ColorToolTip>
                )}
              </div>

              <div className="flex right-0 justify-end pr-3 pt-1 w-[55%]">
                <span className="text-gray-400 italic text-[14px] pl-2">
                  shift+click to select, esc to deselect all
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <RatingDialog
        onOpen={isRatingOpen}
        onClose={closeRatingDialog}
        ratingId={workItemData
          .map((item: DatatableWorklog) =>
            selectedRowIds.includes(item.WorkitemId) && item.StatusId !== 13
              ? item.WorkitemId
              : 0
          )
          .filter((i: number) => i !== 0)}
        noRatingId={workItemData
          .map((item: DatatableWorklog) =>
            selectedRowIds.includes(item.WorkitemId) && item.StatusId === 13
              ? item.WorkitemId
              : 0
          )
          .filter((i: number) => i !== 0)}
        getWorkItemList={getWorkItemList}
        onDataFetch={onDataFetch}
        handleClearSelection={handleClearSelection}
      />
    </div>
  );
};

export default CompletedTaskActionBar;
