"use client";

import { PrimaryButton, SecondaryButton } from "@/components/Button";
import Modal from "@/components/Modal";
import PageContainer from "@/components/PageContainer";
import TextInput from "@/components/TextInput";
import useMutation from "@/hooks/useMutation";
import { selectDetails, setName, setUserId } from "@/redux/auth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type UserDetailsInput = {
  User: {
    User_Phone: string;
  };
  Customer: {
    Customer_Name: string;
    Customer_Email: string;
    Customer_Phone: string;
  };
};

export default function Register() {
  const details = useAppSelector(selectDetails);
  const router = useRouter();
  const query = useSearchParams();
  const [tncModal, setTncModal] = React.useState(false);
  const [userDetails, setUserDetails] = React.useState<UserDetailsInput>({
    User: {
      User_Phone: details.phone as string,
    },
    Customer: {
      Customer_Name: "",
      Customer_Phone: details.phone as string,
      Customer_Email: "",
    },
  });
  const [executor, { loading }] = useMutation<
    UserDetailsInput,
    { data: { userId: string } }
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/register`,
  });
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (!details?.phone) {
      router.replace("/auth");
    }
  }, [details?.phone, router]);

  async function tncCheck(e: React.FormEvent) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.Customer.Customer_Email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (userDetails.Customer.Customer_Name.length < 3) {
      alert("Name must be at least 3 characters long");
      return;
    }
    setTncModal(true);
  }

  async function register() {
    const { data, error } = await executor(userDetails);
    if (error) {
      alert(error.message);
    } else {
      dispatch(setUserId(data!.data.userId));
      dispatch(setName(userDetails.Customer.Customer_Name));
      setTncModal(false);
      router.replace(
        encodeURI(`/auth/verify?register=1&next=${query.get("next")}`),
      );
    }
  }

  return (
    <PageContainer>
      <div className="mt-4 text-primary text-pova-heading font-bold">
        Pova Account
      </div>
      <div className="mt-4 font-bold text-lg mb-4">
        Finalise your Pova Account
      </div>
      <form className="pt-5 pb-16" onSubmit={tncCheck}>
        <TextInput
          name="customer-name"
          placeholder="Full Name"
          fullWidth
          required
          value={userDetails.Customer.Customer_Name}
          onChange={(value) =>
            setUserDetails((curr) => ({
              ...curr,
              Customer: { ...curr.Customer, Customer_Name: value },
            }))
          }
        />
        <TextInput
          name="customer-email"
          placeholder="Email Address"
          fullWidth
          required
          type="email"
          value={userDetails.Customer.Customer_Email}
          onChange={(value) =>
            setUserDetails((curr) => ({
              ...curr,
              Customer: { ...curr.Customer, Customer_Email: value },
            }))
          }
          rootClasses="mt-4"
        />

        <div className="mt-4">
          <PrimaryButton
            text="Register"
            fullWidth
            shadow={false}
            type="submit"
            disabled={
              loading ||
              !(
                userDetails.Customer.Customer_Name &&
                userDetails.Customer.Customer_Email
              )
            }
          />
        </div>
      </form>
      <Modal
        visible={tncModal}
        overlay
        overlayContentFullWidth
        overlayContentPositon="end"
      >
        <div>
          <div className="font-semibold text-xs mb-4">
            By proceeding, you confirm that you&apos;ve read and accept our{" "}
            <Link href="/terms/trade" className="underline" target="_blank">
              {" "}
              Terms of Use
            </Link>{" "}
            and{" "}
            <a
              href={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/Privacy+Policy.pdf`}
              target="_blank"
              className="underline"
            >
              Privacy Policy
            </a>
            .
          </div>
          <PrimaryButton text="Agree & Continue" fullWidth onClick={register} />
          <div className="mt-4">
            <SecondaryButton
              text="Back"
              onClick={router.back}
              fullWidth
              smallestRadius
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
