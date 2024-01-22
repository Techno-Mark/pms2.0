import { Spinner } from "next-ts-lib";
import React from "react";

const OverLay = ({ className }: any) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 bg-black opacity-40 ${className}`}
      style={{ zIndex: "99" }}
    >
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="40px"/>
      </div>
    </div>
  );
};

export default OverLay;
