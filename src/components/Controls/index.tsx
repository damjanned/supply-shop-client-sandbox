import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";

type Props = {
  left?: boolean;
  inactive?: boolean;
  onClick?: () => void;
  containerClasses?: string;
  /**
   * Specify either this or onClick. With link,
   * controll cannot be disabled and onClick would be ignored
   */
  link?: string;
};

export default function Controll({
  left,
  inactive,
  onClick,
  containerClasses,
  link,
}: Props) {
  return (
    <div
      className={`bg-transparent fixed bottom-5 w-1/2 max-w-hlg flex ${
        left
          ? "left-1/2 -translate-x-full pl-5"
          : "right-1/2 translate-x-full justify-end pr-5"
      } ${containerClasses}`}
    >
      {link ? (
        <Link href={link}>
          <div
            className={`w-12 h-12 ${
              inactive ? "bg-surface-disabled" : "bg-primary"
            } ${
              left ? "text-primary bg-surface rotate-180" : "text-on-primary"
            } rounded-full flex items-center justify-center text-2xl cursor-pointer`}
          >
            <FaChevronRight />
          </div>
        </Link>
      ) : (
        <div
          className={`w-12 h-12 ${
            inactive ? "bg-surface-disabled" : "bg-primary"
          } ${
            left ? "text-primary bg-surface rotate-180" : "text-on-primary"
          } rounded-full flex items-center justify-center text-2xl cursor-pointer`}
          onClick={() => {
            if (inactive) {
              return;
            }
            if (onClick) {
              onClick();
            }
          }}
        >
          <FaChevronRight />
        </div>
      )}
    </div>
  );
}
