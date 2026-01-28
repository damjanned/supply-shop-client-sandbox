import { FaMinus, FaPlus } from "react-icons/fa6";

type Props = {
  value: number;
  onChange: (newValue: number) => void;
  noValidate?: boolean;
  fullWidth?: boolean;
};

export default function Range({
  value,
  onChange,
  noValidate,
  fullWidth,
}: Props) {
  function increment() {
    onChange(value + 1);
  }

  function decrement() {
    if (value > 1 || noValidate) {
      onChange(value - 1);
    }
  }

  return (
    <div
      className={`${
        fullWidth ? "flex" : "inline-flex"
      } px-4 py-1 bg-surface rounded-2xl text-xl items-center`}
    >
      <div onClick={decrement} className="cursor-pointer">
        <FaMinus />
      </div>
      <div className="px-2 font-medium grow text-center">{value}</div>
      <div onClick={increment} className="cursor-pointer">
        <FaPlus />
      </div>
    </div>
  );
}
