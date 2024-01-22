/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { Button, Typography, Password, Spinner } from "next-ts-lib";
import "next-ts-lib/dist/index.css";
import Footer from "@/components/common/Footer";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pabs from "@/assets/icons/Pabs";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";

const Page = () => {
  const getToken = useSearchParams();
  const token = getToken.get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorNew, setPasswordErrorNew] = useState(false);
  const [error, setError] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [passwordHasError, setPasswordHasError] = useState(false);
  const [cPasswordHasError, setCPasswordHasError] = useState(false);

  const validatePassword = (password: string) => password.trim() !== "";

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const isPasswordValid = validatePassword(password);
    const isNewPasswordValid = validatePassword(passwordNew);
    const passwordsMatch = password === passwordNew;

    setPasswordError(!isPasswordValid);
    setPasswordErrorNew(!isNewPasswordValid);
    setError(!passwordsMatch);

    if (
      isPasswordValid &&
      isNewPasswordValid &&
      passwordsMatch &&
      passwordHasError &&
      cPasswordHasError
    ) {
      setClicked(true);
      const params = { Token: token, Password: password, TokenType: 2 };
      const url = `${process.env.api_url}/auth/setpassword`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setClicked(false);
          toast.success("Password set successfully.");
          router.push(`/login`);
        } else {
          setClicked(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      setClicked(false);
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <div className="loginWrapper flex items-center flex-col pt-[90px]">
        <span className="-ml-6">
          <Pabs width="150" height="50" />
        </span>
        <Typography type="h5" className="text-primary font-bold my-[20px]">
          Please set a password for your account.
        </Typography>
        <form
          className="w-[320px] lg:w-[384px] text-startmax-w-3xl py-5 flex flex-col items-center justify-center"
          onSubmit={handleSubmit}
        >
          <div className="mb-5 w-full px-3">
            <Password
              label="Password"
              validate
              getValue={(e) => {
                setPassword(e);
                setError(false);
              }}
              getError={(e) => {
                setPasswordHasError(e);
              }}
              hasError={passwordError}
              autoComplete="off"
            />
          </div>
          <div className="mb-5 w-full px-3">
            <Password
              label="Confirm Password"
              validate
              getValue={(e) => {
                setPasswordNew(e);
                setError(false);
              }}
              getError={(e) => {
                setCPasswordHasError(e);
              }}
              hasError={passwordErrorNew}
              autoComplete="off"
            />
          </div>
          <span className="text-[14px] text-defaultRed">
            {error ? "Password does not match." : ""}
          </span>
          <div className="pb-5 flex justify-center items-center w-[320px] lg:w-[384px]">
            {clicked ? (
              <span className="mt-[35px] w-full text-center">
                <Spinner size="20px" />
              </span>
            ) : (
              <Button
                type="submit"
                variant="btn-primary"
                className="rounded-full !font-semibold mt-[35px] w-full"
              >
                CONTINUE
              </Button>
            )}
          </div>
        </form>
        {/* <div className="pb-4 flex justify-between items-center mt-[20px] text-darkCharcoal text-sm lg:text-base">
          Don&rsquo;t have an accout?&nbsp;
          <Link href={""} className="text-primary font-semibold underline">
            Sign Up
          </Link>
        </div> */}
      </div>
      <Footer />
    </div>
  );
};
export default Page;
