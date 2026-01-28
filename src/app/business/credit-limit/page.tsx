"use client";

import { PrimaryButton, SecondaryButton } from "@/components/Button";
import FileUpload from "@/components/FileUpload";
import Loader from "@/components/Loader";
import PageContainer from "@/components/PageContainer";
import RequireAuth from "@/components/RequireAuth";
import useQuery from "@/hooks/useQuery";
import { selectToken } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import type { CustomerProfile } from "@/types/customer";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function CreditLimit() {
  const token = useAppSelector(selectToken);
  const [formState, setFormState] = useState<
    "pending" | "filled" | "submitted"
  >("pending");
  const { data, loading } = useQuery<{ data: CustomerProfile }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/customer/profile`,
    {
      token: token as string,
    },
  );

  async function downloadForm() {
    const url = `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/Pova+Business+Credit+Form.pdf`;
    const a = document.createElement("a");
    a.setAttribute("download", "Pova Business Credit Form.pdf");
    a.setAttribute("target", "_blank");
    a.setAttribute("href", url);
    a.click();
  }

  async function submit(e: React.FormEvent) {
    try {
      e.preventDefault();
      const input = document.querySelector<HTMLInputElement>(
        'input[name="uploaded-doc"]',
      );
      if (!input || !input.files || input.files.length === 0) {
        alert("Please attach a PDF before submitting.");
        return;
      }
      const file = input.files[0];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/business/submit/creditForm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/pdf",
            Authorization: `Bearer ${token}`,
          },
          body: file,
        },
      );
      if (!res.ok) {
        throw new Error("Failed to submit applicaton, please try again");
      }
      setFormState("submitted");
    } catch (err) {
      alert(
        (err as Error)?.message ??
          "An error occurred during upload. Please try again",
      );
    }
  }

  return (
    <RequireAuth>
      <PageContainer>
        <div className="h-[calc(100vh-61px)] !h-[calc(100svh-61px)] relative pt-5">
          {loading ? (
            <div className="h-full flex justify-center items-center">
              <Loader size={50} />
            </div>
          ) : data && data.data.Business?.Credit_Limit_Amount ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-xl text-center">
                Your organisation already has access to{" "}
                <span className="font-medium">Pova Business Credit</span>
              </div>
              <div className="fixed bottom-0 left-0 w-full p-5 shadow-pova-lg lg:absolute">
                <PrimaryButton text="Back to Pova" fullWidth link="/" />
              </div>
            </div>
          ) : formState === "submitted" ? (
            <>
              <div className="h-full flex justify-center items-center">
                <div className="flex flex-col gap-y-14 items-center px-5">
                  <div className="font-bold text-3xl text-center">
                    Your Application has been received.
                  </div>
                  <div className="text-[120px] md:text-[150px]">
                    <FaCheckCircle />
                  </div>
                  <div className="text-lg font-bold text-center">
                    We are reviewing your application and will be in touch in
                    2-3 business days.
                  </div>
                </div>
              </div>
              <div>
                <div className="fixed bottom-0 left-0 w-full p-5 shadow-pova-lg lg:absolute">
                  <PrimaryButton text="Back to Pova" fullWidth link="/" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-pova-heading font-bold ">
                Business Credit
              </div>
              <div className="font-bold text-2xl mt-5">
                Pova Credit Limit for Businesses & Sole Traders
              </div>
              <div className="mt-4 font-light text-sm">
                We offer a Business Credit Limit for eligible{" "}
                <span className="font-medium">
                  business accounts & sole traders
                </span>
                , allowing you to order supplies now and pay later. This helps
                projects move forward without waiting on upfront payments.
                Eligibility is based on a simple application and approval
                process.
              </div>
              <ol className="mt-4 space-y-4">
                <li>
                  <div className="text-xl font-bold mb-4">
                    1. Download the Pova Business Credit Form.
                  </div>
                  <SecondaryButton
                    text="Download Form"
                    onClick={downloadForm}
                  />
                </li>
                <li>
                  <div className="text-xl font-bold mb-4">
                    2. Fill-Out the form.
                  </div>
                </li>
                <li>
                  <div className="text-xl font-bold mb-4">
                    3. Finalise & Submit the application.
                  </div>
                  <div className="mb-4 text-sm font-light">
                    Please attach the{" "}
                    <span className="font-medium">
                      Filled-Out Pova Business Credit
                    </span>{" "}
                    form below.
                  </div>
                  <form id="business-credit-form" onSubmit={submit}>
                    <FileUpload
                      accept="application/pdf"
                      name="uploaded-doc"
                      onChange={(newFile) => {
                        if (newFile) {
                          setFormState("filled");
                        }
                      }}
                    />
                  </form>
                </li>
              </ol>
              {formState === "filled" && (
                <div className="fixed bottom-0 left-0 w-full p-5 shadow-pova-lg lg:absolute">
                  <PrimaryButton
                    text="Submit Application"
                    type="submit"
                    form="business-credit-form"
                    fullWidth
                  />
                </div>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </RequireAuth>
  );
}
