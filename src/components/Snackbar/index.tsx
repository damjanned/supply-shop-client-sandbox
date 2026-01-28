type Props = {
  message: string;
  actionText: string;
  onClick: () => void;
  fullWidth?: boolean;
};

export default function Snackbar({
  message,
  actionText,
  onClick,
  fullWidth,
}: Props) {
  return (
    <div
      className={`flex justify-between bg-primary text-on-primary rounded-pova-lg font-bold px-3 py-4 ${
        fullWidth ? "w-full" : ""
      } `}
    >
      <div>{message}</div>
      <div onClick={onClick} className="cursor-pointer">
        {actionText}
      </div>
    </div>
  );
}
