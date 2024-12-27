import React, { useRef, useState } from "react";
import "next-ts-lib/dist/index.css";
import axios from "axios";
import OverLay from "@/components/common/OverLay";
import { toast } from "react-toastify";
import { Close } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { SLADrawerProps } from "@/utils/Types/settingTypes";
import BusinessHoursContent, {
  BusinessHoursContenRef,
} from "./BusinessHoursContent";
import SLAContent, { SLAPolicyContenRef } from "./SLAContent";

const SLADrawer = ({
  onOpen,
  onClose,
  clone,
  tab,
  onEdit,
  onDataFetch,
  businessHoursDropdown,
  clientDropdown,
}: SLADrawerProps) => {
  const [drawerOverlay, setDrawerOverlay] = useState(false);
  const businessHoursRef = useRef<BusinessHoursContenRef>(null);
  const slaPolicyRef = useRef<SLAPolicyContenRef>(null);

  const handleClose = () => {
    onClose();

    if (businessHoursRef.current) {
      businessHoursRef.current.clearBusinessHoursData();
    }
    if (slaPolicyRef.current) {
      slaPolicyRef.current.clearSLAPolicyData();
    }
  };

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-30 h-screen overflow-y-auto w-[40%] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out overflow-x-hidden`}
      >
        <div className="flex p-[20px] justify-between items-center bg-whiteSmoke border-b border-lightSilver">
          <span className="text-pureBlack text-lg font-medium">
            {onEdit ? "Edit" : "Create"}&nbsp;
            {tab}
          </span>
          <Tooltip title="Close" placement="left" arrow>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Tooltip>
        </div>
        {tab === "Business Hours" && (
          <BusinessHoursContent
            onEdit={onEdit}
            onOpen={onOpen}
            clone={clone}
            onClose={onClose}
            onDataFetch={onDataFetch}
            ref={businessHoursRef}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
          />
        )}
        {tab === "SLA Policy" && (
          <SLAContent
            onEdit={onEdit}
            onOpen={onOpen}
            onClose={onClose}
            onDataFetch={onDataFetch}
            businessHoursDropdown={businessHoursDropdown}
            clientDropdown={clientDropdown}
            ref={slaPolicyRef}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
          />
        )}
      </div>
      {drawerOverlay ? <OverLay /> : ""}
    </>
  );
};

export default SLADrawer;
