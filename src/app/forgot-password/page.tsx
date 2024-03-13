"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Typography, Spinner } from "next-ts-lib";
import "next-ts-lib/dist/index.css";
import Pabs from "@/assets/icons/Pabs";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import { Button, TextField } from "@mui/material";
import Image from "next/image";

const ForgetPassword = () => {
  const router = useRouter();
  const [clicked, setClicked] = useState(false);
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    email.trim().length <= 0 && setEmailError(true);
    email.trim().length > 100 && setEmailError(true);
    setEmailError(!regex.test(email));

    if (
      !emailError &&
      email.trim().length > 0 &&
      email.trim().length < 100 &&
      regex.test(email)
    ) {
      setClicked(true);
      const params = { Username: email };
      const url = `${process.env.api_url}/auth/forgotpassword`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          router.push(`/forgot-confirm/?email=${email}`);
          toast.success("Please check your email.");
          setClicked(false);
        } else {
          setClicked(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen">
      <div className="flex items-center justify-between max-h-screen min-w-full relative">
        <Image
          src="https://staging-tms.azurewebsites.net/assets/images/pages/forgot-password-v2.svg"
          alt="FP"
          className="w-[50%]"
          width={500}
          height={500}
        />
        <span className="absolute top-10 left-4">
          <Pabs width="200" height="50" />
        </span>
        <div className="forgetWrapper flex items-start flex-col pt-5 min-w-[30%]">
          <Typography type="h3" className="pt-14 pb-2 font-bold">
            Forgot Password?
          </Typography>
          <p className="text-gray-500 text-[14px]">
            Enter your email and we&rsquo;ll send you
            <br />
            instructions to reset your password
          </p>
          <form
            className="text-start w-full max-w-md py-5 flex flex-col items-start justify-center"
            onSubmit={handleSubmit}
          >
            <div className="pb-2 w-[300px] lg:w-[356px]">
              <TextField
                type="email"
                sx={{ mt: "-10px" }}
                label={
                  <span>
                    Email
                    <span className="!text-defaultRed">&nbsp;*</span>
                  </span>
                }
                fullWidth
                value={email?.trim().length <= 0 ? "" : email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                onBlur={() => {
                  if (
                    email.trim().length < 1 ||
                    email.trim().length > 100 ||
                    !regex.test(email)
                  ) {
                    setEmailError(true);
                  }
                }}
                error={emailError}
                helperText={
                  emailError && email?.trim().length > 100
                    ? "Maximum 100 characters allowed."
                    : emailError && !regex.test(email)
                    ? "Please enter valid email."
                    : emailError
                    ? "This is a required field."
                    : ""
                }
                margin="normal"
                variant="standard"
              />
            </div>
            {clicked ? (
              <span className="mt-[35px] w-[300px] lg:w-[356px] text-center flex items-center justify-center">
                <Spinner size="20px" />
              </span>
            ) : (
              <Button
                variant="contained"
                className="rounded-full !font-semibold mt-[20px] !w-[300px] !bg-secondary"
                type="submit"
              >
                SEND EMAIL
              </Button>
            )}
            <div className="backLoignWrapper pt-5 flex items-center justify-center min-w-[70%]">
              <Link href="login">
                <div className="backArrow flex items-center justify-center">
                  <div className="ml-2.5 flex items-center justify-center">
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
