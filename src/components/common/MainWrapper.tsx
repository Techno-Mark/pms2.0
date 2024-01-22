"use client";

import CustomToastContainer from "@/utils/style/CustomToastContainer";
import "next-ts-lib/dist/index.css";
import React from "react";

const MainWrapper = ({ children }: any) => {
  return (
    <>
      <CustomToastContainer />
      {children}
    </>
  );
};

export default MainWrapper;
