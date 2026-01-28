"use client";
import { PrimaryButton } from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import TextInput from "@/components/TextInput";
import useMutation from "@/hooks/useMutation";
import { useAppDispatch } from "@/redux/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { setPhone as setPhoneNumber, setUserId } from "@/redux/auth/index";

export default function Auth() {
  const [phone, setPhone] = React.useState("");
  const [executor, { loading }] = useMutation<
    { User_Phone: string },
    { data: { userId: string } }
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login/phone`,
  });
  const query = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    router.prefetch("/auth/verify");
  }, [router]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 9 || phone.length > 10) {
      alert("Phone number should have 9 digits");
      return;
    }
    const phoneNumber =
      phone.length === 9 ? `61${phone}` : `61${phone.slice(1)}`;
    const { data, error } = await executor({
      User_Phone: phoneNumber,
    });
    dispatch(setPhoneNumber(phoneNumber));
    if (error) {
      if (error.status && error.status === 404) {
        router.push(
          encodeURI(`/auth/register?next=${query.get("next") || "/account"}`),
        );
      } else {
        alert(error.message);
      }
    } else {
      dispatch(setUserId(data!.data.userId));
      router.push(
        encodeURI(`/auth/verify?next=${query.get("next") || "/account"}`),
      );
    }
  }

  return (
    <PageContainer>
      <div className="pt-4 h-[calc(100vh-61px)] !h-[calc(100svh-61px)]">
        <div className="text-pova-heading font-bold">Account</div>
        <div className="text-base font-bold mt-6">
          Lets get you Pova verified!
        </div>
        <form onSubmit={login}>
          <TextInput
            name="phone"
            placeholder="Phone Number"
            rootClasses="mt-6"
            fullWidth
            required
            type="tel"
            value={phone}
            onChange={setPhone}
          />
          <div className="mt-4">
            <PrimaryButton
              text="Get a code"
              fullWidth
              type="submit"
              disabled={!phone || loading}
              shadow={false}
            />
          </div>
        </form>
        <div className="mt-4 font-medium text-xs">
          By proceeding, you consent to get calls, WhatsApp or SMS messages,
          including by automated means, from Pova to the number provided.
        </div>
      </div>
    </PageContainer>
  );
}
