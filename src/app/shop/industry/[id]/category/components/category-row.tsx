import { Category } from "@/types/category";
import Link from "next/link";
import Image from "next/image";
import { BLUR_URL } from "@/lib/utils";

type Props = {
  data: Category & { industryId: string; industryName: string };
};

export default function CategoryRow({ data }: Props) {
  return (
    <Link
      href={`/shop/industry/${data.industryId}/category/${
        data._id
      }?s=${encodeURIComponent(
        data.industryName as string,
      )}&ss=${encodeURIComponent(data.Category_Name)}`}
      className="block w-full h-full relative"
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${data.Category_Image}`}
        fill
        alt="preview"
        className="rounded-pova-lg object-cover"
        sizes="(min-width: 1024px) 25vw,(min-width: 768px) 33vw, 50vw"
        placeholder="blur"
        blurDataURL={BLUR_URL}
      />
      <span className="absolute text-white font-bold top-1 left-1.5">
        {data.Category_Name}
      </span>
    </Link>
  );
}
