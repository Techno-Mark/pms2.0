import { useEffect, useRef, useState } from "react";
import ArrowUp from "./icons/ArrowUp";
import ArrowDown from "./icons/ArrowDown";
import Star from "./icons/Star";
import Building from "./icons/Building";

export default function Dropdown({ options, getUserDetails }: any) {
  let Org_Name;
  if (typeof window !== "undefined") {
    Org_Name = localStorage.getItem("Org_Name");
  }
  const dropDownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    localStorage.getItem("Org_Name") || ""
  );
  const [selectedId, setSelectedId] = useState(
    localStorage.getItem("Org_Id") || ""
  );
  const [selectedValue, setSelectedValue] = useState(
    localStorage.getItem("Org_Name") || ""
  );
  const [selectedToken, setSelectedToken] = useState(
    localStorage.getItem("Org_Token") || ""
  );

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropDownRef.current &&
      !dropDownRef.current.contains(event.target as Node)
    ) {
      const org = localStorage.getItem("Org_Name");
      setOpen(false);
      if (org) {
        setSearchQuery(org);
      }
    }
  };

  const filteredOptions = options.filter((option: any) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [Org_Name]);

  const handelInput = (e: any) => {
    setSearchQuery("");
    setOpen(true);
  };

  return (
    <div ref={dropDownRef} className="px-1">
      <div
        className="relative gap-1 cursor-pointer"
        onClick={() => setOpen(!isOpen)}
      >
        <span className="absolute left-1">
          <Building />
        </span>
        <input
          className={`pl-12 h-8 outline-none mb-1 mr-10 ${
            !isOpen && "cursor-pointer"
          }`}
          type="text"
          placeholder="Select Company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={handelInput}
        />
        <span
          className="absolute top-[9px] right-2 cursor-pointer bg-white"
          onClick={() => setOpen(!isOpen)}
        >
          {!isOpen ? <ArrowDown /> : <ArrowUp />}
        </span>
      </div>
      {isOpen && <hr className="border border-[#02b89d]" />}
      <div
        style={{
          boxShadow: "0px 8px 16px 0px rgba(0, 0, 0, 0.2)",
          width: dropDownRef.current?.clientWidth,
        }}
        className={`absolute mt-[5px] bg-[#f9f9f9] z-10 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <ul
          className={`max-h-[400px] m-0 p-0 list-none border-b border-b-[#d8d8d8] overflow-auto`}
        >
          {filteredOptions.map((option: any) => (
            <li
              key={option.id}
              className="mx-5 my-5 cursor-pointer flex items-center justify-between text-[14px] font-normal"
              id={option.id}
              value={option.label}
              onClick={(e: any) => {
                const liElementWithValue = e.target.closest("li[value]");
                if (liElementWithValue && !e.target.closest(".starContainer")) {
                  const id = liElementWithValue.getAttribute("id");
                  const value = liElementWithValue.getAttribute("value");
                  setOpen(false);
                  setSelectedId(id);
                  setSearchQuery(value);
                  setSelectedValue(value);
                  setSelectedToken(option.token);

                  localStorage.setItem("Org_Token", option.token);
                  localStorage.setItem("Org_Id", option.id);
                  localStorage.setItem("Org_Name", option.label);
                  handleRefresh();
                }
              }}
            >
              <span className="flex items-center gap-[10px]">
                <Building />
                <span className="truncate w-40">{option.label}</span>
              </span>
              <div className="starContainer">
                <Star data={option} getUserDetails={getUserDetails} />
              </div>
            </li>
          ))}
        </ul>
        <div className="p-5">
          <button className="w-full py-[10px] px-11 block bg-[#02b89d] rounded-[300px] text-white text-[14px] font-bold uppercase text-center cursor-pointer">
            Manage Companies
          </button>
        </div>
      </div>
    </div>
  );
}
