import React from "react";
import { CheckBox } from "next-ts-lib";
import ColFilterIcon from "@/assets/icons/ColFilterIcon";

interface ColumnFilterDropdownProps {
  headers: any[];
  visibleHeaders: any[];
  isOpen?: boolean;
  setOpen: (arg1: boolean) => void;
  handleHeaderToggle: (header: string) => void;
}

const ColumnFilterDropdown: React.FC<ColumnFilterDropdownProps> = ({
  headers,
  visibleHeaders,
  isOpen,
  setOpen,
  handleHeaderToggle,
}) => {
  return (
    <div className="cursor-pointer absolute right-2 top-3">
      <span
        onClick={() => {
          isOpen ? setOpen(false) : setOpen(true);
        }}
      >
        <ColFilterIcon />
      </span>

      {isOpen && (
        <div className="absolute bg-pureWhite top-10 -right-20 p-3">
          {headers.map((header) => (
            <span
              key={header}
              className="p-2 hover:bg-whiteSmoke font-normal cursor-pointer flex span"
            >
              <CheckBox
                className="checkbox"
                id={header}
                label={header}
                checked={visibleHeaders.includes(header)}
                onChange={(e) => {
                  handleHeaderToggle(header);
                }}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColumnFilterDropdown;
