import React, { useState } from "react";
import { toast } from "react-toastify";
import { InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import SearchIcon from "@/assets/icons/SearchIcon";
import ClientIcon from "@/assets/icons/worklogs/ClientIcon";
import { getClientDropdownData } from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";

const Client = ({
  selectedRowIds,
  handleClearSelection,
  getWorkItemList,
  getOverLay,
}: any) => {
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientDropdownData, setClientDropdownData] = useState([]);

  const [anchorElClient, setAnchorElClient] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickClient = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElClient(event.currentTarget);
    getClientData();
  };

  const handleCloseClient = () => {
    setAnchorElClient(null);
  };

  const openClient = Boolean(anchorElClient);
  const idClient = openClient ? "simple-popover" : undefined;

  const handleClientSearchChange = (event: any) => {
    setClientSearchQuery(event.target.value);
  };

  const filteredClient = clientDropdownData?.filter((client: any) =>
    client.label.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const handleOptionClient = (id: any) => {
    updateClient(selectedRowIds, id);
    handleCloseClient();
  };

  const getClientData = async () => {
    setClientDropdownData(await getClientDropdownData());
  };

  const updateClient = async (id: number[], clientId: number) => {
    getOverLay(true);
    const params = {
      workitemIds: id,
      ClientId: clientId,
    };
    const url = `${process.env.worklog_api_url}/workitem/bulkupdateworkitemclient`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Client has been updated successfully.");
        handleClearSelection();
        getWorkItemList();
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
                  value={clientSearchQuery}
                  onChange={handleClientSearchChange}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {clientDropdownData.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredClient.map((client: any) => {
                return (
                  <span
                    key={client.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => handleOptionClient(client.value)}
                    >
                      <span className="pt-[0.8px]">{client.label}</span>
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
