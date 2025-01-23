import React, { useState } from "react";
import { toast } from "react-toastify";
import { Avatar, InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import SearchIcon from "@/assets/icons/SearchIcon";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";
import { getClientDropdownData } from "@/utils/commonDropdownApiCall";
import ClientIcon from "@/assets/icons/worklogs/ClientIcon";

const Client = ({
  selectedRowIds,
  getData,
  getOverLay,
  handleClearSelection,
}: {
  selectedRowIds: number[];
  getData: () => void;
  getOverLay: (e: boolean) => void;
  handleClearSelection: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [client, setClient] = useState<LabelValue[]>([]);

  const [anchorElClient, setAnchorElClient] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickClient = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElClient(event.currentTarget);
    const getClient = async () => {
      setClient(await getClientDropdownData());
    };

    getClient();
  };

  const handleCloseClient = () => {
    setAnchorElClient(null);
  };

  const openClient = Boolean(anchorElClient);
  const idClient = openClient ? "simple-popover" : undefined;

  const handleSearchChange = (e: string) => {
    setSearchQuery(e);
  };

  const filteredClients = client?.filter((c: LabelValue) =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateClient = (ClientId: number) => {
    getOverLay(true);
    const params = {
      TicketIds: selectedRowIds,
      ClientId: ClientId,
    };
    const url = `${process.env.emailbox_api_url}/emailbox/UpdateClient`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Client has been updated successfully.");
        handleClearSelection();
        getData();
        getOverLay(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        handleClearSelection();
        getData();
        getOverLay(false);
      } else {
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Client" arrow>
        <span aria-describedby={idClient} onClick={handleClickClient}>
          <ClientIcon />
        </span>
      </ColorToolTip>

      {/* Client Popover */}
      <Popover
        id={idClient}
        open={openClient}
        anchorEl={anchorElClient}
        onClose={handleCloseClient}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <nav className="!w-52">
          <div className="mr-4 ml-4 mt-4">
            <div
              className="flex items-center h-10 rounded-md pl-2 flex-row"
              style={{
                border: "1px solid lightgray",
              }}
            >
              <span className="mr-2">
                <SearchIcon />
              </span>
              <span>
                <InputBase
                  placeholder="Search"
                  inputProps={{ "aria-label": "search" }}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {Client.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredClients.map((c: LabelValue) => {
                return (
                  <span
                    key={c.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => {
                        updateClient(c.value);
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                        {c.label
                          .split(" ")
                          .map((word: string) => word.charAt(0).toUpperCase())
                          .join("")}
                      </Avatar>

                      <span className="pt-[0.8px]">{c.label}</span>
                    </span>
                  </span>
                );
              })
            )}
          </List>
        </nav>
      </Popover>
    </div>
  );
};

export default Client;
