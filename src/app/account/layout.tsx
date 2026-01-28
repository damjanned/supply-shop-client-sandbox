"use client";
import RequireAuth from "@/components/RequireAuth";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function AccountLayout({ children }: Props) {
  return <RequireAuth>{children}</RequireAuth>;
}
