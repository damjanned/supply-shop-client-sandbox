"use client";
import PageContainer from "@/components/PageContainer";
import { MdArrowLeft } from "react-icons/md";
import Image from "next/image";
import CustomOrb from "../../../../public/Custom Orb.png";
import KlipLok from "../../../../public/Klip Lok.png";
import Trimdek from "../../../../public/TrimDek.png";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setCurrentFlashing } from "@/redux/flashings";
import { ColourDirection } from "../components/Draw/utils";
import Link from "next/link";
import { BLUR_URL } from "@/lib/utils";

export default function ShapeSelector() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <PageContainer>
      <div className="h-[calc(100vh-61px)] !h-[calc(100svh-61px)]">
        <span
          className="inline-flex items-center py-2.5 px-3.5 bg-surface rounded-3xl mt-4 cursor-pointer"
          onClick={router.back}
        >
          <MdArrowLeft className="text-2xl" />
          <span className="font-semibold text-base">Flashing Order</span>
        </span>
        <div className="py-4 font-bold">Choose Shape</div>
        <div className="flex flex-wrap gap-2.5">
          <div
            className="border-2 border-surface h-[150px] w-[109px] rounded-pova-lg cursor-pointer"
            onClick={() => {
              dispatch(
                setCurrentFlashing({
                  colourDir: ColourDirection.OUTSIDE,
                  tapered: false,
                  diagram: "",
                }),
              );
              router.push("/flashings");
            }}
          >
            <div className="h-full flex items-center justify-center text-xl font-bold">
              <span className="text-2xl">+</span>Blank
            </div>
          </div>
          <Link
            className="border-2 border-surface rounded-pova-lg h-[150px] w-[109px] cursor-pointer"
            href={`/flashings/library/shapes?shape=${encodeURIComponent(
              "CustomOrb",
            )}`}
          >
            <div className="h-[103px]">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/Custom+Orb.png`}
                sizes="210px"
                placeholder="blur"
                alt="Shape preview"
                className="object-contain"
                blurDataURL={BLUR_URL}
                width={315}
                height={309}
              />
            </div>
            <div className="text-xs font-semibold flex items-center h-[47px] px-2.5">
              Custom Orb
            </div>
          </Link>
          <Link
            className="border-2 border-surface rounded-pova-lg h-[150px] w-[109px] cursor-pointer"
            href={`/flashings/library/shapes?shape=${encodeURIComponent(
              "TrimdekSpandek",
            )}`}
          >
            <div className="h-[103px]">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/TrimDek.png`}
                sizes="210px"
                placeholder="blur"
                alt="Shape preview"
                className="object-contain"
                blurDataURL={BLUR_URL}
                width={210}
                height={206}
              />
            </div>
            <div className="text-xs font-semibold flex items-center h-[47px] px-2.5">
              Trimdek & Spandek
            </div>
          </Link>
          <Link
            className="border-2 border-surface rounded-pova-lg h-[150px] w-[109px] cursor-pointer"
            href={`/flashings/library/shapes?shape=${encodeURIComponent(
              "Kliplok",
            )}`}
          >
            <div className="h-[103px] relative">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/Klip+Lok.png`}
                sizes="210px"
                placeholder="blur"
                alt="Shape preview"
                className="object-contain"
                blurDataURL={BLUR_URL}
                width={315}
                height={309}
              />
            </div>
            <div className="text-xs font-semibold px-2.5 flex items-center h-[47px]">
              Kliplok
            </div>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
