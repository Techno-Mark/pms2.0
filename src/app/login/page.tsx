/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import Link from "next/link";
import { Button, Password, Email, Spinner } from "next-ts-lib";
import "next-ts-lib/dist/index.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasToken } from "@/utils/commonFunction";
import Pabs from "@/assets/icons/Pabs";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [emailHasError, setEmailHasError] = useState(false);
  const [passwordHasError, setPasswordHasError] = useState(false);

  useEffect(() => {
    hasToken(router);
  }, [router]);

  useEffect(() => {
    email.trim().length > 0 && setEmailHasError(true);
    password.trim().length > 0 && setPasswordHasError(true);
  }, [email, password]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const showErrorToast = (message: string) => {
    const errorMessage = message || "Login failed. Please try again.";
    toast.error(errorMessage);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setEmailError(email.trim().length <= 0);
    setPasswordError(password.trim().length <= 0);

    if (
      validateEmail(email) &&
      password.trim() !== "" &&
      emailHasError &&
      passwordHasError
    ) {
      setClicked(true);
      const params = {
        Username: email,
        Password: password,
      };
      const url = `${process.env.api_url}/auth/token`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("You are successfully logged in.");
          setEmail("");
          setPassword("");
          setEmailHasError(false);
          setPasswordHasError(false);
          localStorage.setItem("token", ResponseData.Token.Token);
          router.push("/");
          setClicked(false);
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
    <div className="flex flex-col justify-center min-h-screen relative">
      <div className="flex items-center justify-between max-h-screen min-w-full relative">
        <img
          src="https://staging-tms.azurewebsites.net/assets/images/pages/login-v2.svg"
          alt="Login"
          className="w-[50%]"
        />
        <span className="absolute -top-10 left-4">
          <Pabs width="200" height="50" />
        </span>
        <div className="loginWrapper flex items-center flex-col pt-[10%] !w-[40%] font-normal border-l border-lightSilver">
          <p className="font-bold mb-[20px] text-darkCharcoal text-2xl">
            Welcome to PABS-PMS
          </p>
          <form
            className="text-start w-full max-w-3xl py-5 px-3 flex flex-col items-center justify-center"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 w-[300px] lg:w-[356px]">
              <Email
                label="Email"
                type="email"
                validate
                getValue={(e) => setEmail(e)}
                getError={(e) => setEmailHasError(e)}
                hasError={emailError}
                autoComplete="off"
              />
            </div>
            <div className="mb-5 w-[300px] lg:w-[356px]">
              <Password
                label="Password"
                validate
                novalidate
                getValue={(e) => setPassword(e)}
                getError={(e) => setPasswordHasError(e)}
                hasError={passwordError}
                autoComplete="off"
              />
            </div>
            <div className="pb-0 w-[300px] lg:w-[356px] flex justify-between items-center">
              <div className="flex items-center justify-center text-slatyGrey">
                {/* <CheckBox id="agree" label="Keep me logged in" /> */}
              </div>
              <Link
                href="/forgot-password"
                className="text-[#0592C6] font-semibold text-sm lg:text-base underline"
              >
                Forgot Password?
              </Link>
            </div>
            {clicked ? (
              <span className="mt-[35px]">
                <Spinner size="20px" />
              </span>
            ) : (
              <Button
                type="submit"
                variant="btn-secondary"
                className="rounded-full !w-[300px] !font-semibold mt-[35px]"
              >
                SIGN IN
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
