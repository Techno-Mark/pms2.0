"use client";
import Link from "next/link";
import { Typography } from "next-ts-lib";
import "next-ts-lib/dist/index.css";
import { useSearchParams } from "next/navigation";
import Pabs from "@/assets/icons/Pabs";

const Forgetconfirm = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <div className="forgetWrapper flex items-center flex-col pt-10">
        <Pabs width="200" height="50" />
        <Typography type="h3" className="pt-14 pb-2 font-bold">
          Check your Email
        </Typography>
        <div className="content tracking-[0.28px] mb-2.5 text-[14px]">
          We&rsquo;ve sent a reset password link to
          <span className="text-[#0592C6]"> {email} </span>
        </div>
        <div className="max-w-[450px] xs:!px-5 md:!px-0 tracking-[0.28px] flex justify-center items-center text-center text-[14px]">
          Please use the link provided in the email to reset your password. The
          link is only valid for a limited time. If you did not request this
          change, you can disregard this email and take measures to secure your
          account.
        </div>
        <div className="backLoignWrapper pt-10 flex justify-center ">
          <Link href="/login">
            <div className="backArrow  items-center justify-center flex">
              <div className="ml-2.5  ">
                <Typography
                  type="text"
                  className="!text-[14px] !font-normal text-[#0592C6]"
                >
                  Back to Login
                </Typography>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forgetconfirm;
