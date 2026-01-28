import Link from "next/link";

type Props = {
  link?: string;
  type?: "submit" | "button" | "reset";
  text: string;
  /**
   * Only works for buttons, not for links
   */
  onClick?: () => void;
  fullWidth?: boolean;
  /**
   * Only works for buttons, not for links
   */
  disabled?: boolean;
  shadow?: boolean;
  form?: string;
};

export default function PrimaryButton({
  link,
  type,
  text,
  onClick,
  fullWidth,
  disabled,
  shadow = true,
  form,
}: Props) {
  return link ? (
    <Link
      href={link}
      className={`text-on-primary font-bold text-base inline-block p-4 bg-primary rounded-pova-lg ${
        fullWidth ? "w-full" : ""
      } text-center ${shadow ? "shadow-pova-sm" : ""} ${
        disabled ? "bg-surface-disabled" : ""
      }`}
    >
      {text}
    </Link>
  ) : (
    <input
      type={type || "button"}
      onClick={onClick}
      value={text}
      className={`text-on-primary font-bold text-base inline-block p-4 bg-primary rounded-pova-lg ${
        fullWidth ? "w-full" : ""
      } text-center ${
        shadow ? "shadow-pova-sm" : ""
      } disabled:bg-surface-disabled cursor-pointer`}
      disabled={disabled}
      form={form}
    />
  );
}
