"use client";

type Props = {
  src: string;
  width: number;
};

export default function imageLoader({ src, width }: Props) {
  return `${src}-${width}.webp`;
}
