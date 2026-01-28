"use client";
import { PrimaryButton } from "@/components/Button";
import Loader from "@/components/Loader";
import PageContainer from "@/components/PageContainer";
import useQuery from "@/hooks/useQuery";
import { BLUR_URL } from "@/lib/utils";
import { setCurrentFlashing } from "@/redux/flashings";
import { useAppDispatch } from "@/redux/hooks";
import { FlashingShape } from "@/types/flashing";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { MdArrowLeft } from "react-icons/md";

const cache = {
  key: "shapeLibrary",
  duration: 14_400, // 4 hrs
};

const shapeIdToName = {
  CustomOrb: "Custom Orb",
  Kliplok: "Klip Lok",
  TrimdekSpandek: "Trimdek / Spandek",
};

export default function ShapeLibrary() {
  const [selected, setSelected] = React.useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedShape = searchParams.get("shape");
  const dispatch = useAppDispatch();
  const { data, error, loading } = useQuery<{ data: Array<FlashingShape> }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/flashingShape/getMany?shape=${selectedShape}`,
    {
      // cache,
    },
  );
  return (
    <PageContainer>
      <div className="h-[calc(100vh-61px)] !h-[calc(100svh-61px)]">
        <span
          className="inline-flex items-center py-2.5 px-3.5 bg-surface rounded-3xl mt-4"
          onClick={router.back}
        >
          <MdArrowLeft className="text-2xl" />
          <span className="font-semibold text-base">Choose Shape</span>
        </span>
        <div className="py-4 font-bold">
          {shapeIdToName[selectedShape as keyof typeof shapeIdToName] as string}{" "}
          Shape Library
        </div>
        {error ? (
          <div className="h-full w-full flex justify-center items-center">
            <div>Something went wrong</div>
          </div>
        ) : loading ? (
          <div className="h-full w-full flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            <div
              className="max-h-[calc(100vh-265px)] !max-h-[calc(100svh-265px)] overflow-y-auto max-md:no-scrollbar
      flex flex-wrap gap-2.5 py-4"
            >
              {data!.data.map((shape) => (
                <div
                  key={shape._id}
                  className={`border-2 border-surface rounded-pova-lg h-[170px] w-[109px] cursor-pointer ${
                    selected === shape._id ? "!border-primary" : ""
                  }`}
                  onClick={() => setSelected(shape._id)}
                >
                  <div className="h-[105px] relative">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${shape.Flashing_Shape_Image}`}
                      fill
                      sizes="105px"
                      placeholder="blur"
                      alt="Shape preview"
                      blurDataURL={BLUR_URL}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-xs font-semibold px-2.5 flex items-center h-16">
                    {shape.Flashing_Shape_Name}
                  </div>
                </div>
              ))}
            </div>
            {!!selected && (
              <div
                className="fixed left-0 right-0 bottom-0 md:absolute bg-white shadow-pova-lg
      py-4 px-5"
              >
                <PrimaryButton
                  text="Lets Start Building"
                  fullWidth
                  onClick={() => {
                    const shapeData = data!.data.find(
                      (item) => item._id === selected,
                    )!.Flashing_Shape_Data;
                    const {
                      direction,
                      data: diagram,
                      tapered = false,
                    } = JSON.parse(shapeData);
                    dispatch(
                      setCurrentFlashing({
                        diagram: JSON.stringify(diagram),
                        colourDir: direction,
                        tapered,
                      }),
                    );
                    router.push("/flashings");
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
