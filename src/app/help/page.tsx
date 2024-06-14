"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "@/components/common/Wrapper";
import Navbar from "@/components/common/Navbar";
import { Button, Grid } from "@mui/material";
import ReactPlayer from "react-player";
import { callAPI } from "@/utils/API/callAPI";
import ReportLoader from "@/components/common/ReportLoader";

const Page = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [videos, setVideos] = useState<
    {
      FileName: string;
      ContentType: string;
      Url: string;
    }[]
  >([]);

  const getVideos = async () => {
    setLoading(true);
    const params = {};
    const url = `${process.env.helpURL}/tutorial/GetAllVideos`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setVideos(ResponseData);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  useEffect(() => {
    activeTab === 2 && getVideos();
  }, [activeTab]);
  return (
    <Wrapper>
      <div className="h-screen overflow-x-hidden overflow-y-auto">
        <Navbar />
        <div className="bg-white flex justify-between items-center px-[20px]">
          <div className="flex gap-[10px] items-center py-[6.5px]">
            <label
              onClick={() => {
                setActiveTab(1);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                activeTab === 1
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Latest EXE
            </label>
            <span className="text-lightSilver">|</span>
            <label
              onClick={() => {
                setActiveTab(2);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                activeTab === 2
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Video
            </label>
          </div>
        </div>
        {activeTab === 1 && (
          <>
            <div className="mx-4 px-5 mb-2 flex justify-between items-center w-[97%] h-16 bg-whiteSmoke rounded-lg shadow-xl">
              <span>
                <b>Step 1:</b> First, download the Microsoft Desktop Runtime and
                install it.
              </span>
              <Button variant="contained" className="!bg-secondary">
                <a href="https://pmsaea8.blob.core.windows.net/prod-help-video-setup/DotRuntimeSetup.zip">
                  Download
                </a>
              </Button>
            </div>
            <div className="mx-4 px-5 flex justify-between items-center w-[97%] h-16 bg-whiteSmoke rounded-lg shadow-xl">
              <span>
                <b>Step 2:</b> Download the PMS Executable (.msi) file and
                install it.
              </span>
              <Button variant="contained" className="!bg-secondary">
                <a href="https://pmsaea8.blob.core.windows.net/prod-help-video-setup/PGCTimeTracker.msi">
                  Download
                </a>
              </Button>
            </div>
            <div className="mt-8 mx-4 px-5 flex flex-col justify-between items-start w-[97%]">
              <strong className="py-1">
                Important Notes for PMS Executable (.msi) File:
              </strong>
              <br />
              <ol className="pl-5 !list-decimal flex flex-col gap-1">
                <li className="pb-1">
                  Each user must install the PMS Executable File (.msi) with
                  assistance from the IT team.
                </li>
                <li className="pb-1">
                  Ensure that the user system has the most recent version of the
                  PMS Executable (.msi) File [Version 2.0] - June 12, 2024 and
                  remove any outdated version if any.
                </li>
                <li className="pb-1">
                  In the event of a password change on the PMS web portal, it is
                  essential to update the password within the PMS Executable
                  File (.msi) as well.
                </li>
                <li className="pb-1">
                  Each user is required to ensure that auto-login functions
                  smoothly on a daily basis at PMS Executable File (.msi). In
                  the event of any issues, users should promptly contact the IT
                  team for support.
                </li>
                <li className="pb-1">
                  If the user has configured &quot;Turn on Display&quot; and
                  &quot;Put the Computer to Sleep&quot; in the Balance power
                  plan to &quot;Never&quot;, restore these settings to the
                  plan&apos;s defaults.
                </li>
                <li className="pb-1">
                  After returning from a break, a pop-up will appear to indicate
                  idle time. The user must click &apos;OK&apos; on the pop-up;
                  otherwise, the idle time will continue to be recorded.
                </li>
                <li className="pb-1">
                  When returning from a break, users must click &apos;OK&apos;
                  on the idle time pop-up before clicking the break button
                  again. This ensures that idle and break times are not recorded
                  simultaneously.
                </li>
              </ol>
            </div>
          </>
        )}
        {activeTab === 2 && loading && <ReportLoader />}
        {activeTab === 2 && loading === false && (
          <Grid
            container
            className="px-10 py-5 gap-5 flex items-center justify-center"
          >
            {videos.length > 0 ? (
              videos.map((video, index) => (
                <Grid item xs={6} key={index} className="max-w-[500px]">
                  <ReactPlayer
                    url={video.Url}
                    controls
                    width={350}
                    height={250}
                    onError={(e) => console.error("Error loading video", e)}
                  />
                  <span>{video.FileName}</span>
                </Grid>
              ))
            ) : (
              <span>There is no Video Found.</span>
            )}
          </Grid>
        )}
      </div>
    </Wrapper>
  );
};

export default Page;
