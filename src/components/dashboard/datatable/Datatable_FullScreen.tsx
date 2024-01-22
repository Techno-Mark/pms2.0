/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState } from "react";
import { IconButton } from "@mui/material";
import Datatable_OnHold from "./Datatable_OnHold";
import Datatable_Overdue from "./Datatable_Overdue";
import Btn_ExitFullScreen from "@/assets/icons/dashboard_Client/Btn_ExitFullScreen";

interface DatatableFullScreenProps {
  onClose: () => void;
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
}

const Datatable_FullScreen: React.FC<DatatableFullScreenProps> = ({
  onClose,
  onSelectedProjectIds,
  onSelectedWorkType,
}) => {
  const [isOverdueClicked, setIsOverdueClicked] = useState(true);
  const [isOnHoldClicked, setIsOnHoldClicked] = useState(false);

  const handleClose = () => {
    onClose();
  };

  return (
    <div>
      <div className="bg-whiteSmoke flex justify-between items-center px-[10px]">
        <div className="flex gap-[20px] items-center py-[6.5px] px-[10px]">
          <label
            onClick={() => {
              setIsOverdueClicked(true);
              setIsOnHoldClicked(false);
            }}
            className={`py-[10px] cursor-pointer select-none ${
              isOverdueClicked
                ? "text-secondary text-[16px] font-semibold"
                : "text-slatyGrey text-[14px]"
            }`}
          >
            Overdue
          </label>
          <span className="text-lightSilver">|</span>
          <label
            onClick={() => {
              setIsOnHoldClicked(true);
              setIsOverdueClicked(false);
            }}
            className={`py-[10px] cursor-pointer select-none ${
              isOnHoldClicked
                ? "text-secondary text-[16px] font-semibold"
                : "text-slatyGrey text-[14px]"
            }`}
          >
            On Hold
          </label>
          <span className="text-lightSilver">|</span>
        </div>

        <IconButton onClick={handleClose}>
          <Btn_ExitFullScreen />
        </IconButton>
      </div>

      {isOverdueClicked && (
        <Datatable_Overdue
          onSelectedProjectIds={onSelectedProjectIds}
          onSelectedWorkType={onSelectedWorkType}
        />
      )}

      {isOnHoldClicked && (
        <Datatable_OnHold
          onSelectedProjectIds={onSelectedProjectIds}
          onSelectedWorkType={onSelectedWorkType}
        />
      )}
    </div>
  );
};

export default Datatable_FullScreen;
