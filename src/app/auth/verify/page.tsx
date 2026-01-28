"use client";
import * as React from "react";
import PageContainer from "@/components/PageContainer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectDetails } from "@/redux/auth";
import OTPInput from "./components/OTPInput";
import { SecondaryButton } from "@/components/Button";
import { useRouter, useSearchParams } from "next/navigation";
import useMutation from "@/hooks/useMutation";
import { setToken } from "@/redux/app";

export default function Verify() {
  const details = useAppSelector(selectDetails);
  const maskedNumber = `*******${details.phone?.slice(
    details.phone.length - 2,
  )}`;
  const [resendDisabled, setResendDisabled] = React.useState(true);
  const [otpError, setOtpError] = React.useState("");
  const router = useRouter();
  const [resend] = useMutation<{ User_Phone: string }, any>({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login/phone`,
  });
  const [verify, { loading }] = useMutation<
    { userId: string; Client_OTP: string },
    { data: { token: string } }
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify`,
  });
  const query = useSearchParams();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (!details?.phone) {
      router.replace("/auth");
    }
  }, [details?.phone, router]);

  React.useEffect(() => {
    setTimeout(() => setResendDisabled(false), 20 * 1000);
  }, []);

  async function verifyOtp(otp: string) {
    const { data, error } = await verify({
      userId: details.userId as string,
      Client_OTP: otp,
    });
    if (error) {
      setOtpError(error.message);
    } else {
      dispatch(setToken(data!.data.token));
      if (query.get("register")) {
        router.replace(
          encodeURI(
            `/auth/register/success?next=${query.get("next") as string}`,
          ),
        );
      } else {
        router.replace(query.get("next") as string);
      }
    }
  }

  async function resendOtp() {
    setResendDisabled(true);
    await resend({ User_Phone: details!.phone as string });
    setTimeout(() => setResendDisabled(false), 20 * 1000);
  }

  return (
    <PageContainer>
      <div className="mt-7 font-bold text-2xl">
        Enter the 6-digit code sent to you at {maskedNumber}
      </div>
      <div className="mt-12">
        <OTPInput onChange={verifyOtp} autoFocus errorMessage={otpError} />
      </div>
      <div className="mt-8">
        <SecondaryButton
          text="Choose different mobile number"
          onClick={router.back}
          disabled={loading}
        />
      </div>
      <div className="mt-4">
        <SecondaryButton
          text="I haven't received a code"
          onClick={resendOtp}
          disabled={resendDisabled || loading}
        />
      </div>
    </PageContainer>
  );
}
