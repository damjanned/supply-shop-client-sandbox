import { BLUR_URL } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { CSSProperties } from "react";

type Props = {
  sectionHeading: string;
  link: string;
  items: Array<{ link: string; image: string; text: string }>;
  width: CSSProperties["width"];
  height?: CSSProperties["height"];
};

export default function List({
  sectionHeading,
  link,
  items,
  width,
  height,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between pr-5">
        <div className="font-bold text-base">{sectionHeading}</div>
        <Link href={link} className="font-medium text-xs text-black">
          See All
        </Link>
      </div>
      <ul className="flex gap-2.5 flex-nowrap mt-3 overflow-x-auto no-scrollbar pr-4 py-2">
        {items.map(({ link, image, text }) => (
          <li key={link}>
            <Link
              className="relative block rounded-pova-lg shadow-pova-sm"
              style={{ width: width, height: height || width }}
              href={encodeURI(link)}
            >
              <Image
                src={image}
                fill
                alt="preview"
                className="rounded-pova-lg object-cover"
                sizes={width as string}
                placeholder="blur"
                blurDataURL={BLUR_URL}
              />
              <span className="text-white top-2 left-1 absolute font-bold">
                {text}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
