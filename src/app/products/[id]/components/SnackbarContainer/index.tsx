"use client";

import Snackbar from "@/components/Snackbar";
import { useSearchParams } from "next/navigation";

type Props = {
  text: string;
  onClick: () => void;
};

export default function SnackbarContainer({ text, onClick }: Props) {
  const query = useSearchParams();
  const edit = query.get("edit") as string;

  return (
    <div className="fixed left-0 w-full max-w-screen-lg lg:left-1/2 lg:-translate-x-1/2 bottom-0 bg-on-primary shadow-pova-lg px-4 py-4">
      <Snackbar
        message={text}
        actionText={edit ? "Update Cart" : "Add to Cart"}
        onClick={onClick}
      />
    </div>
  );
}
