"use client";
import { useRouter } from "next/navigation";
import { IoCaretBack } from "react-icons/io5";

type Props = {
  text: string;
};

export default function BackFAB({ text }: Props) {
  const router = useRouter();

  return (
    <div
      className="absolute left-5 top-3 bg-surface rounded-3xl z-10 p-3 flex items-center cursor-pointer max-w-full"
      onClick={router.back}
    >
      <span>
        <IoCaretBack />
      </span>
      <span className="text-sm font-semibold text-primary min-w-0">{text}</span>
    </div>
  );
}
