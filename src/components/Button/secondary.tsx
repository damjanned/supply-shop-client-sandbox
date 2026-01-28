import Link from "next/link";

type Props = {
  link?: string;
  type?: "submit" | "button" | "reset";
  text: string;
  /**
   * Only works for buttons, not for links
   */
  onClick?: (e: React.MouseEvent) => void;
  fullWidth?: boolean;
  /**
   * Only works for buttons, not for links
   */
  disabled?: boolean;
  small?: boolean;
  smallestRadius?: boolean;
  containerClasses?: string;
};

export default function SecondaryButton({
  link,
  type,
  text,
  onClick,
  fullWidth,
  disabled,
  small,
  smallestRadius,
  containerClasses,
}: Props) {
  return link ? (
    <Link
      href={link}
      className={`font-semibold text-sm leading-4 inline-block p-3 bg-surface rounded-3xl ${
        fullWidth ? "w-full" : ""
      } text-center ${small ? "rounded-[20px]" : ""} ${
        smallestRadius ? "rounded-lg" : ""
      } ${containerClasses}`}
    >
      {text}
    </Link>
  ) : (
    <input
      type={type || "button"}
      onClick={onClick}
      value={text}
      className={`font-semibold text-sm inline-block p-3 bg-surface rounded-3xl ${
        fullWidth ? "w-full" : ""
      } text-center cursor-pointer disabled:opacity-50 ${
        small ? "rounded-[20px]" : ""
      } ${smallestRadius ? "rounded-lg" : ""} ${containerClasses}`}
      disabled={disabled}
    />
  );
}
