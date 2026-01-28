import Link from "next/link";
import { MdArrowDropDown } from "react-icons/md";

type Props = {
  text: string;
  active?: boolean;
  link: string;
};

export default function Selector({ text, active, link }: Props) {
  return (
    <Link
      className={`flex gap-x-0.5 items-center font-semibold py-2.5 px-3.5 ${
        active ? "bg-primary text-on-primary" : "bg-surface"
      } rounded-3xl min-w-0 shrink`}
      href={link}
    >
      <span className="truncate">{text}</span>
      <MdArrowDropDown size={28} className={active ? "rotate-180" : ""} />
    </Link>
  );
}
