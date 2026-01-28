"use client";
import Loader from "@/components/Loader";
import TextInput from "@/components/TextInput";
import useQuery from "@/hooks/useQuery";
import { selectToken } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import { CustomerProfile } from "@/types/customer";

export default function Profile() {
  const token = useAppSelector(selectToken);
  const { data, error, loading } = useQuery<{ data: CustomerProfile }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/customer/profile`,
    {
      token: token as string,
    },
  );

  return error ? (
    <div className="w-full h-[calc(100vh-125px)] !h-[calc(100svh-125px)] flex justify-center items-center -mx-5">
      <div>Something went wrong</div>
    </div>
  ) : loading ? (
    <div className="w-full h-[calc(100vh-125px)] !h-[calc(100svh-125px)] flex justify-center items-center -mx-5">
      <Loader size={100} />
    </div>
  ) : (
    <>
      <div className="text-pova-heading mt-4 font-bold">
        {data!.data.Customer_Name}
      </div>
      <div className="flex flex-col gap-4 mt-4 pb-8">
        <TextInput
          initialValue={data!.data.Customer_Email}
          disabled
          fullWidth
        />
        <TextInput initialValue={data!.data.Customer_Name} disabled fullWidth />
        <TextInput
          initialValue={data!.data.Customer_Phone}
          disabled
          fullWidth
        />
      </div>
    </>
  );
}
