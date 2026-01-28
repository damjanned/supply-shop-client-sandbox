import { MdClose } from "react-icons/md";
import Search from "../Icons/Search";

type Props = {
  placeholder?: string;
  value?: string;
  onChange?: (newValue: string) => void;
  name?: string;
  id?: string;
  fullWidth?: boolean;
  variant?: "transparent" | "filled";
  autoFocus?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  noRounded?: boolean;
};

export default function Searchbar({
  placeholder,
  value,
  onChange,
  name,
  id,
  fullWidth,
  variant = "filled",
  autoFocus,
  onFocus,
  noRounded,
}: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  }
  function clear() {
    if (onChange) {
      onChange("");
    }
  }

  return (
    <label
      className={`${fullWidth ? "w-full" : ""} ${
        noRounded
          ? ""
          : "rounded-pova-lg focus-within:rounded-bl-none focus-within:rounded-br-none"
      } p-4 text-base ${
        variant === "transparent"
          ? "shadow-pova-sm bg-[rgba(232,232,237,0.3)] focus-within:bg-transparent focus-within:outline-white focus-within:outline-1"
          : "bg-surface focus-within:outline-primary focus-within:outline-2"
      } 
      flex items-center gap-4 focus-within:outline group`}
    >
      <Search
        className={`${variant === "transparent" ? "invert" : ""} text-2xl`}
      />
      <input
        placeholder={placeholder || "Search"}
        name={name}
        id={id}
        onChange={onChange && handleChange}
        value={value}
        className={`${
          variant === "transparent"
            ? "placeholder:text-white text-white"
            : "placeholder:text-on-surface text-primary"
        }  font-medium grow bg-transparent
        focus:outline-none`}
        autoFocus={autoFocus}
        onFocus={onFocus}
      />
      {value && (
        <button
          className="cursor-pointer hidden group-focus-within:inline-block"
          onClick={clear}
        >
          <MdClose size={20} />
        </button>
      )}
    </label>
  );
}
