"use client";
import RequireLocation from "@/components/RequireLocation";
import Container from "./components/Container";

export default function Fencing() {
  return (
    <RequireLocation>
      <Container />
    </RequireLocation>
  );
}
