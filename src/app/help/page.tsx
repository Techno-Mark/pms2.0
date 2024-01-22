"use client";
import React from "react";
import Wrapper from "@/components/common/Wrapper";
import Navbar from "@/components/common/Navbar";
import { Button } from "@mui/material";

const Page = () => {
  return (
    <Wrapper>
      <Navbar />
      <div className="bg-white flex justify-between items-center px-[20px]">
        <div className="flex gap-[10px] items-center py-[6.5px]">
          <label className="py-[10px] cursor-pointer select-none text-[16px] text-slatyGrey">
            Latest EXE
          </label>
        </div>
      </div>
      <div className="mx-4 px-5 flex justify-between items-center w-[97%] h-28 bg-whiteSmoke rounded-lg shadow-xl">
        <span>
          PMS Executable (.exe) File [Version 1.0] - December 11, 2023
        </span>
        <Button variant="contained" className="!bg-secondary">
          <a href="https://pmsaea8.blob.core.windows.net/prod-help-video-setup/PGCTimeTracker.msi">
            Download
          </a>
        </Button>
      </div>
      <div className="mt-10 mx-4 px-5 flex flex-col justify-between items-start w-[97%]">
        <strong className="py-1">
          Important Notes for PMS Executable (.exe) File:
        </strong>
        <br />
        <ol className="pl-5 !list-decimal flex flex-col gap-2">
          <li className="pb-1">
            Each user must install the PMS Executable File (.exe) with
            assistance from the IT team.
          </li>
          <li className="pb-1">
            Ensure that the user system has the most recent version of the PMS
            Executable (.exe) File [Version 1.0] - December 11, 2023 and remove
            any outdated version if any.
          </li>
          <li className="pb-1">
            In the event of a password change on the PMS web portal, it is
            essential to update the password within the PMS Executable File
            (.exe) as well.
          </li>
          <li className="pb-1">
            Each user is required to ensure that auto-login functions smoothly
            on a daily basis at PMS Executable File (.exe). In the event of any
            issues, users should promptly contact the IT team for support.
          </li>
          <li className="pb-1">
            If the user has configured &quot;Turn on Display&quot; and &quot;Put
            the Computer to Sleep&quot; in the Balance power plan to
            &quot;Never&quot;, restore these settings to the plan&apos;s
            defaults.
          </li>
        </ol>
      </div>
    </Wrapper>
  );
};

export default Page;
