import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="flex flex-col md:!flex-row smFooter:gap-3 lgFooter:flex-row items-center justify-between pl-[41px] pr-[27px] py-[21px] border-t border-[#E6E6E6] text-[#333333] text-[14px]">
      <span>PMS&#174;.All Rights Reserved.</span>
      <span>
        By Login, you agree to our
        <Link href={""} className="text-[#02B89D] underline">
          Privacy Policy
        </Link>
        and
        <Link href={""} className="text-[#02B89D] underline">
          Client Agreement Service
        </Link>
      </span>
    </div>
  );
};

export default Footer;
