"use client";
import Controll from "@/components/Controls";
import PageContainer from "@/components/PageContainer";
import { selectDetails } from "@/redux/auth";
import { useAppSelector } from "@/redux/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";

export default function RegisterSuccess() {
  const details = useAppSelector(selectDetails);
  const router = useRouter();
  const query = useSearchParams();

  return (
    <PageContainer>
      <div className="flex h-[calc(100vh-61px)] !h-[calc(100svh-61px)] items-center justify-center">
        <div className="text-[2rem] font-bold">
          <div className="mb-16  text-center">
            Registration <br /> successful!
          </div>
          <div className="mb-16 flex justify-center text-[150px]">
            <FaCheckCircle />
          </div>
          <div className="text-center">
            Welcome <br />
            {details?.name}!
          </div>
        </div>
        <Controll onClick={() => router.replace(query.get("next") as string)} />
      </div>
    </PageContainer>
  );
}
