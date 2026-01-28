import PageContainer from "@/components/PageContainer";
import { Industry } from "@/types/industry";
import type { Metadata } from "next";
import Navigation from "./components/navigation";
import IndustryList from "./components/industry-list";

export const metadata: Metadata = {
  title: "Shop",
};

async function getData() {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/industry/getMany`,
      {
        next: { revalidate: 7200, tags: ["industries"] },
      },
    );
    const { data }: { data: Array<Industry> } = await response.json();
    return { industries: data };
  } catch (err) {
    return { industries: undefined };
  }
}

export default async function Shop() {
  const { industries } = await getData();

  return (
    <PageContainer>
      <Navigation />
      <IndustryList industries={industries} />
    </PageContainer>
  );
}
