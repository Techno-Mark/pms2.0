import React, { useEffect } from "react";
import { Card } from "@mui/material";
import Minus from "@/assets/icons/worklogs/Minus";

const CustomActionBar = ({
  selectedRowsCount,
  selectedRows,
  handleClearSelection,
  children,
}: any) => {
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

  return (
    <div>
      {selectedRowsCount > 0 && (
        <div className="flex items-center justify-start ml-12">
          <Card
            className={`rounded-full flex border p-2 border-[#1976d2] absolute shadow-lg ${
              selectedRowsCount === 1 ? "w-[80%]" : "w-[71%]"
            } bottom-12 -translate-y-1/2`}
          >
            <div className="flex flex-row w-full">
              <div className="pt-1 pl-2 flex w-[25%]">
                <span className="cursor-pointer" onClick={handleClearSelection}>
                  <Minus />
                </span>
                <span className="pl-2 pt-[1px] pr-6 text-[14px]">
                  {selectedRowsCount || selectedRows} task selected
                </span>
              </div>

              <div
                className={`flex flex-row z-10 h-8 justify-center items-center ${
                  selectedRowsCount === 1 ? "w-[100%]" : "w-[80%]"
                }`}
              >
                {children}
              </div>

              <div className="flex right-0 justify-end pr-3 pt-1 w-[40%]">
                <span className="text-gray-400 italic text-[14px] pl-2">
                  shift+click to select, esc to deselect all
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomActionBar;
