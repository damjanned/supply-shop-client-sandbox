import PageContainer from "@/components/PageContainer";
import type { Supplier as Sup } from "@/types/supplier";
import Navigation from "./components/navigation";
import SupplierList from "./components/supplier-list";

export const metadata = {
  title: "Suppliers",
};

async function getData() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/supplier/getAll`,
      {
        next: { revalidate: 7200, tags: ["suppliers"] },
      },
    );
    const { data }: { data: Array<Sup> } = await response.json();
    return { suppliers: data };
  } catch (err) {
    return { suppliers: undefined };
  }
}

export default async function Supplier() {
  const { suppliers } = await getData();

  return (
    <PageContainer>
      <Navigation />
      <SupplierList suppliers={suppliers} />
    </PageContainer>
  );
}
