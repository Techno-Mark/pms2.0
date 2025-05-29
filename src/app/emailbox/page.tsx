/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import FilterIcon from "@/assets/icons/FilterIcon";
import LineIcon from "@/assets/icons/reports/LineIcon";
import MoreIcon from "@/assets/icons/reports/MoreIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import WrapperNavbar from "@/components/common/WrapperNavbar";
import EmailBoxDrawer from "@/components/emailbox/drawer/EmailBoxDrawer";
import EmailBoxNewMailDrawer from "@/components/emailbox/drawer/EmailBoxNewMailDrawer";
import EmailBoxNewMailEditDrawer from "@/components/emailbox/drawer/EmailBoxNewMailEditDrawer";
import EmailBoxFilter from "@/components/emailbox/EmailBoxFilter";
import ApprovalsEmailTable from "@/components/emailbox/tables/ApprovalsEmailTable";
import CreateMailEmailTable from "@/components/emailbox/tables/CreateMailEmailTable";
import DraftEmailTable from "@/components/emailbox/tables/DraftEmailTable";
import FailedEmailTable from "@/components/emailbox/tables/FailedEmailTable";
import InboxTable from "@/components/emailbox/tables/InboxTable";
import JunkEmailTable from "@/components/emailbox/tables/JunkEmailTable";
import SentEmailTable from "@/components/emailbox/tables/SentEmailTable";
import UnprocessedTable from "@/components/emailbox/tables/UnProcessedTable";
import DrawerOverlay from "@/components/settings/drawer/DrawerOverlay";
import { callAPI } from "@/utils/API/callAPI";
import { getTagData } from "@/utils/commonDropdownApiCall";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { Button, InputBase } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { Fragment, useEffect, useRef, useState } from "react";

interface Tabs {
  label: string;
  value: number;
  name: string;
}

interface MoreTabs {
  moreTabs: Tabs[];
  handleMoreTabsClick: (tab: Tabs, index: number) => void;
}

const tabs = [
  { label: "Create Mail", value: 8, name: "Create Mail" },
  { label: "Inbox", value: 1, name: "Inbox" },
  { label: "Unprocessed", value: 2, name: "Unprocessed" },
  { label: "Approvals", value: 3, name: "Approvals" },
  { label: "Draft Mails", value: 4, name: "Draft Mails" },
  { label: "Sent Mails", value: 5, name: "Sent Mails" },
  { label: "Junk Mails", value: 6, name: "Junk Mails" },
  { label: "Failed Mails", value: 7, name: "Failed Mails" },
];

const initialFilter = {
  GlobalSearch: null,
  ClientId: null,
  AssigneeId: null,
  TicketStatus: null,
  EmailTypeId: null,
  ReceivedFrom: null,
  ReceivedTo: null,
  Tags: null,
};

const MoreTabs = ({ moreTabs, handleMoreTabsClick }: MoreTabs) => {
  return (
    <div
      style={{
        boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
      }}
      className="absolute w-36 z-50 bg-slate-50 rounded flex flex-col whitespace-nowrap"
    >
      {moreTabs
        .filter((tab: Tabs | boolean) => tab !== false)
        .map((tab: Tabs, index: number) => (
          <div
            key={tab.value}
            className={`py-2 w-full hover:bg-[#0000000e] ${
              index === 0 ? "rounded-t" : ""
            } ${index === moreTabs.length - 1 ? "rounded-b" : ""}`}
            onClick={() => handleMoreTabsClick(tab, index)}
          >
            <label className={`mx-4 my-[2px] flex cursor-pointer text-base`}>
              {tab.name}
            </label>
          </div>
        ))}
    </div>
  );
};

const page = () => {
  const router = useRouter();
  const moreTabsRef = useRef<HTMLDivElement>(null);
  const [allTabs, setAllTabs] = useState([
    { label: "Create Mail", value: 8, name: "Create Mail" },
    { label: "Inbox", value: 1, name: "Inbox" },
    { label: "Unprocessed", value: 2, name: "Unprocessed" },
    { label: "Approvals", value: 3, name: "Approvals" },
    { label: "Draft Mails", value: 4, name: "Draft Mails" },
    { label: "Sent Mails", value: 5, name: "Sent Mails" },
    { label: "Junk Mails", value: 6, name: "Junk Mails" },
    { label: "Failed Mails", value: 7, name: "Failed Mails" },
  ]);
  const [activeTabs, setActiveTabs] = useState<any[]>([]);
  const [moreTabs, setMoreTabs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [showMoreTabs, setShowMoreTabs] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [search, setSearch] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [dataFunction, setDataFunction] = useState<(() => void) | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [clientId, setClientId] = useState(0);
  const [ticketId, setTicketId] = useState(0);
  const [tagDropdown, setTagDropdown] = useState<
    { label: string; value: string }[]
  >([]);
  const hasFetched = useRef(false);
  const hasFetchedTag = useRef(false);
  const prevActiveTab = useRef<number | null>(null);

  const getTagDropdownData = async () => {
    setTagDropdown(await getTagData());
  };

  useEffect(() => {
    if (!hasFetchedTag.current) {
      getTagDropdownData();
      hasFetchedTag.current = true;
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const isOutsideMoreTabs =
        moreTabsRef.current &&
        !moreTabsRef.current.contains(event.target as Node);

      if (isOutsideMoreTabs) {
        setShowMoreTabs(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const getTabData = async () => {
    const url = `${process.env.emailbox_api_url}/emailbox/gettabwiseticketcount`;

    const successCallback = (
      ResponseData: {
        TabType: number;
        TotalCount: number;
        UnReadCount: number;
      }[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const updatedTabs = tabs.map((tab) => {
          const matchingData = ResponseData.find(
            (data) => data.TabType === tab.value
          );
          if (matchingData) {
            return {
              ...tab,
              name: `${tab.name}:${matchingData.TotalCount} ${
                matchingData.TabType === 1
                  ? `(${matchingData.UnReadCount})`
                  : ""
              }`,
            };
          }
          return tab;
        });
        setAllTabs(updatedTabs);
      } else {
        setAllTabs([...tabs]);
      }
    };

    callAPI(
      url,
      {
        ...initialFilter,
        GlobalSearch: searchValue.trim(),
        ...filteredData,
      },
      successCallback,
      "post"
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!hasFetched.current) {
        await getTabData();
        hasFetched.current = true;
      }
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredData, activeTab, hasFetched.current, searchValue]);

  const hasTabsPermission = () => {
    return (
      hasPermissionWorklog("", "View", "EmailBox") &&
      (hasPermissionWorklog("Inbox", "View", "EmailBox") ||
        hasPermissionWorklog("Unprocessed", "View", "EmailBox") ||
        hasPermissionWorklog("Approvals", "View", "EmailBox") ||
        hasPermissionWorklog("Draft Mails", "View", "EmailBox") ||
        hasPermissionWorklog("Sent Mails", "View", "EmailBox") ||
        hasPermissionWorklog("Junk Mails", "View", "EmailBox") ||
        hasPermissionWorklog("Failed Mails", "View", "EmailBox"))
    );
  };

  const actionAfterPermissionCheck = () => {
    if (!hasTabsPermission()) {
      router.push("/");
    } else {
      setTabs();
      setActiveTab(
        allTabs
          .filter((tab) => {
            if (tab.label === "Create Mail") {
              return hasPermissionWorklog("Create Mail", "view", "EmailBox") &&
                hasPermissionWorklog("Send Email", "Send Email", "EmailBox")
                ? tab
                : false;
            }
            return hasPermissionWorklog(tab.label, "view", "EmailBox")
              ? tab
              : false;
          })
          .map((tab) => tab.value)[0]
      );
    }
  };

  useEffect(() => {
    const isClient = localStorage.getItem("isClient") === "false";

    if (isClient) {
      actionAfterPermissionCheck();
    } else {
      router.push("/");
    }
  }, [router]);

  const setTabs = () => {
    setActiveTabs(
      activeTab > 3 && activeTab !== 8
        ? [
            ...allTabs
              .map((tab) => {
                if (tab.label === "Create Mail") {
                  return hasPermissionWorklog(
                    "Create Mail",
                    "view",
                    "EmailBox"
                  ) &&
                    hasPermissionWorklog("Send Email", "Send Email", "EmailBox")
                    ? tab
                    : false;
                }
                return hasPermissionWorklog(tab.label, "view", "EmailBox")
                  ? tab
                  : false;
              })
              .filter((tab) => tab !== false)
              .slice(0, 3),
            allTabs
              .map((tab) => {
                if (tab.label === "Create Mail") {
                  return hasPermissionWorklog(
                    "Create Mail",
                    "view",
                    "EmailBox"
                  ) &&
                    hasPermissionWorklog("Send Email", "Send Email", "EmailBox")
                    ? tab
                    : false;
                }
                return hasPermissionWorklog(tab.label, "view", "EmailBox")
                  ? tab
                  : false;
              })
              .filter((tab) => tab !== false)
              .find((tab: any) => tab.value === activeTab),
          ]
        : allTabs
            .map((tab) => {
              if (tab.label === "Create Mail") {
                return hasPermissionWorklog(
                  "Create Mail",
                  "view",
                  "EmailBox"
                ) &&
                  hasPermissionWorklog("Send Email", "Send Email", "EmailBox")
                  ? tab
                  : false;
              }
              return hasPermissionWorklog(tab.label, "view", "EmailBox")
                ? tab
                : false;
            })
            .filter((tab) => tab !== false)
            .slice(0, 4)
    );

    setMoreTabs(
      allTabs
        .map((tab) => {
          if (tab.label === "Create Mail") {
            return hasPermissionWorklog("Create Mail", "view", "EmailBox") &&
              hasPermissionWorklog("Send Email", "Send Email", "EmailBox")
              ? tab
              : false;
          }
          return hasPermissionWorklog(tab.label, "view", "EmailBox")
            ? tab
            : false;
        })
        .filter((tab) => tab !== false)
        .filter((tab: any) => tab.value !== activeTab)
        .slice(3)
    );
  };

  useEffect(() => {
    setTabs();
  }, [allTabs, searchValue, filteredData]);

  const handleTabChange = (tabId: number) => {
    prevActiveTab.current = activeTab ?? null;
    hasFetched.current = false;
    setActiveTab(tabId);
    setIsFiltering(false);
    // setFilteredData(null);
    setSearchValue("");
    setSearch("");
  };

  const handleMoreTabsClick = (tab: Tabs, index: number) => {
    const clickedIndex = index;

    const lastVisibleTab = activeTabs[activeTabs.length - 1];

    setShowMoreTabs(false);

    handleTabChange(tab.value);

    setActiveTabs((prevTabs) =>
      prevTabs.map((tab: Tabs, index: number) =>
        index === activeTabs.length - 1 ? moreTabs[clickedIndex] : tab
      )
    );

    setMoreTabs((prevTabs) =>
      prevTabs.map((tab: Tabs, index: number) =>
        index === clickedIndex ? lastVisibleTab : tab
      )
    );
  };

  const handleFilterData = (arg1: any) => {
    setFilteredData(arg1);
  };

  const handleFilter = (arg1: boolean) => {
    setIsFiltering(arg1);
  };

  const handleSearchChange = (e: string) => {
    setSearch(e);
    const timer = setTimeout(() => {
      setSearchValue(e.trim());
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleDataFetch = (getData: () => void) => {
    setDataFunction(() => getData);
  };

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const getId = (id: number, id1: number) => {
    setTicketId(id);
    setClientId(id1);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
    getTabData();
    setClientId(0);
    setTicketId(0);
    setSearch("");
  };

  return (
    <WrapperNavbar>
      <div className="w-full pr-5 flex items-center justify-between">
        <div className="flex justify-between items-center">
          <div
            className={`flex justify-center items-center ${
              moreTabs.length <= 0 ? "my-2" : ""
            }`}
          >
            {activeTabs
              .filter((tab: boolean) => tab !== false)
              .map((tab: Tabs, index: number) => (
                <Fragment key={tab.value}>
                  <label
                    className={`mx-4 cursor-pointer text-base ${
                      activeTab === tab.value
                        ? "text-secondary font-semibold"
                        : "text-slatyGrey"
                    }`}
                    onClick={() => handleTabChange(tab.value)}
                  >
                    {tab.name}
                  </label>
                  <LineIcon />
                </Fragment>
              ))}
          </div>
          <div className="cursor-pointer relative">
            {moreTabs.length > 0 && (
              <div
                ref={moreTabsRef}
                onClick={() => setShowMoreTabs(!showMoreTabs)}
              >
                <MoreIcon />
              </div>
            )}
            {showMoreTabs && (
              <MoreTabs
                moreTabs={moreTabs}
                handleMoreTabsClick={handleMoreTabsClick}
              />
            )}
          </div>
        </div>

        <div className="h-full flex items-center gap-5">
          <div className="relative">
            <InputBase
              className="pl-1 pr-7 border-b border-b-lightSilver w-52"
              placeholder="Search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <span className="absolute top-2 right-2 text-slatyGrey">
              <SearchIcon />
            </span>
          </div>

          <ColorToolTip title="Filter" placement="top" arrow>
            <span
              className="cursor-pointer relative"
              onClick={() => {
                setIsFiltering(true);
              }}
            >
              <FilterIcon />
            </span>
          </ColorToolTip>
          {activeTab === 8 &&
            hasPermissionWorklog("Create Mail", "Save", "EmailBox") && (
              <Button
                type="submit"
                variant="contained"
                className="rounded-1 !h-[36px] !bg-secondary"
                onClick={handleDrawerOpen}
              >
                <p className="flex items-center justify-center gap-2 px-1">
                  <span>
                    <AddPlusIcon />
                  </span>
                  <span className="pt-1">Create Email</span>
                </p>
              </Button>
            )}
        </div>
      </div>

      {activeTab === 1 && (
        <InboxTable
          searchValue={searchValue}
          filteredData={filteredData}
          onDataFetch={handleDataFetch}
          handleDrawerOpen={handleDrawerOpen}
          getId={getId}
          tagDropdown={tagDropdown}
          getTagDropdownData={getTagDropdownData}
          getTabData={getTabData}
          hasFetched={hasFetched}
        />
      )}

      {activeTab === 2 && (
        <UnprocessedTable
          searchValue={searchValue}
          filteredData={filteredData}
          onDataFetch={handleDataFetch}
          getTabData={getTabData}
          handleDrawerOpen={handleDrawerOpen}
          getId={getId}
          hasFetched={hasFetched}
        />
      )}

      {activeTab === 3 && (
        <ApprovalsEmailTable
          searchValue={searchValue}
          filteredData={filteredData}
          onDataFetch={handleDataFetch}
          tagDropdown={tagDropdown}
          getTagDropdownData={getTagDropdownData}
          handleDrawerOpen={handleDrawerOpen}
          getId={getId}
          getTabData={getTabData}
          hasFetched={hasFetched}
        />
      )}

      {activeTab === 4 && (
        <DraftEmailTable
          searchValue={searchValue}
          filteredData={filteredData}
          onDataFetch={handleDataFetch}
          handleDrawerOpen={handleDrawerOpen}
          getId={getId}
          getTabData={getTabData}
          hasFetched={hasFetched}
        />
      )}

      {activeTab === 5 && (
        <SentEmailTable
          searchValue={searchValue}
          filteredData={filteredData}
          onDataFetch={handleDataFetch}
          handleDrawerOpen={handleDrawerOpen}
          getId={getId}
          getTabData={getTabData}
          hasFetched={hasFetched}
        />
      )}

      {activeTab === 6 && (
        <JunkEmailTable
          searchValue={searchValue}
          filteredData={filteredData}
          onDataFetch={handleDataFetch}
          getTabData={getTabData}
          hasFetched={hasFetched}
        />
      )}

      {activeTab === 7 && (
        <FailedEmailTable
          searchValue={searchValue}
          filteredData={filteredData}
          onDataFetch={handleDataFetch}
          getTabData={getTabData}
          handleDrawerOpen={handleDrawerOpen}
          getId={getId}
          hasFetched={hasFetched}
        />
      )}

      {activeTab === 8 && (
        <CreateMailEmailTable
          searchValue={searchValue}
          filteredData={filteredData}
          onDataFetch={handleDataFetch}
          getTabData={getTabData}
          handleDrawerOpen={handleDrawerOpen}
          getId={getId}
        />
      )}

      <EmailBoxFilter
        isFiltering={isFiltering}
        sendFilterToPage={handleFilterData}
        onDialogClose={handleFilter}
        activeTab={activeTab}
        tagDropdown={tagDropdown}
        prevActiveTab={prevActiveTab}
      />

      {activeTab === 8 && ticketId > 0 ? (
        <EmailBoxNewMailEditDrawer
          onDataFetch={dataFunction}
          onOpen={openDrawer}
          onClose={handleDrawerClose}
          ticketId={ticketId}
          activeTabPermission={hasPermissionWorklog(
            allTabs.filter((tab) => tab.value === activeTab)[0]?.label,
            "Save",
            "EmailBox"
          )}
        />
      ) : activeTab === 8 ? (
        <EmailBoxNewMailDrawer
          onDataFetch={dataFunction}
          onOpen={openDrawer}
          onClose={handleDrawerClose}
          ticketId={ticketId}
          activeTabPermission={hasPermissionWorklog(
            allTabs.filter((tab) => tab.value === activeTab)[0]?.label,
            "Save",
            "EmailBox"
          )}
        />
      ) : (
        <EmailBoxDrawer
          onDataFetch={dataFunction}
          onOpen={openDrawer}
          onClose={handleDrawerClose}
          clientId={clientId}
          ticketId={ticketId}
          activeTabList={activeTab}
          activeTabPermission={hasPermissionWorklog(
            allTabs.filter((tab) => tab.value === activeTab)[0]?.label,
            "Save",
            "EmailBox"
          )}
          tagDropdown={tagDropdown}
          getTagDropdownData={getTagDropdownData}
        />
      )}

      <DrawerOverlay isOpen={openDrawer} onClose={handleDrawerClose} />
    </WrapperNavbar>
  );
};

export default page;
