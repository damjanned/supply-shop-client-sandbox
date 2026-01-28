import PageContainer from "@/components/PageContainer";
import { Industry } from "@/types/industry";
import CategoryList from "./components/category-list";

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params: { id } }: Props) {
  const { industry } = await getData(id);
  if (!industry) {
    return {
      title: "Not Found",
    };
  } else {
    return {
      title: industry.Industry_Name,
    };
  }
}

async function getData(id: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/industry/getOne/${id}`,
      {
        next: { revalidate: 7200 },
      },
    );
    const { data }: { data: Industry } = await response.json();
    return { industry: data };
  } catch (err) {
    return { industry: undefined };
  }
}

export default async function Category({ params }: Props) {
  const { industry } = await getData(params.id);
  return (
    <PageContainer>
      <CategoryList industry={industry as Industry} id={params.id} />
    </PageContainer>
  );
}
