import Link from "next/link";

type Props = {
  icon: React.ReactNode;
  text: string;
  href: string;
  color: "primary" | "flashing" | "fencing";
};

export default function HomeButton({ href, text, icon, color }: Props) {
  let colorClass;
  switch (color) {
    case "flashing":
      colorClass = "bg-flashing";
      break;
    case "fencing":
      colorClass = "bg-fencing";
      break;
    default:
      colorClass = "bg-primary";
  }

  return (
    <Link
      href={href}
      className={`w-full flex gap-x-3.5 items-center ${colorClass} p-3.5 text-on-primary rounded-pova-lg  shadow-pova-sm font-bold`}
    >
      {icon}
      {text}
    </Link>
  );
}
