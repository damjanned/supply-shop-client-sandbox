import React from "react";
import { HTMLInputTypeAttribute } from "react";
import { FaCaretDown } from "react-icons/fa6";

type Props = {
  type?: HTMLInputTypeAttribute;
  inputMode?:
    | "search"
    | "text"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  value?: string;
  onChange?: (newValue: string) => void;
  name?: string;
  id: string;
  fullWidth?: boolean;
  buttonClassName?: string;
};

const options = Array.from(Array(300).keys()).map((_, index) => ({
  label: (index + 1).toString(),
  value: (index + 1).toString(),
}));

export default function AutoComplete({
  type,
  inputMode,
  value,
  onChange,
  name,
  id,
  fullWidth,
  buttonClassName,
}: Props) {
  const [val, setVal] = React.useState(value);
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLButtonElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    const newValue = e.target.value;
    if (newValue === "") {
      setVal(newValue);
      return;
    }
    const intVal = parseInt(newValue);
    if (!isNaN(intVal) && intVal > 0) {
      setVal(newValue);
    }
    if (onChange && intVal > 0) {
      onChange(newValue);
    }
  }

  React.useEffect(() => {
    function closeDropdown(e: any) {
      const target = e.target;
      if (
        target !== dropdownRef.current &&
        target.parentNode !== dropdownRef.current
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <div
      className={`relative  ${
        open ? "[&>ul]:opacity-100 [&>ul]:visible" : ""
      } ${!fullWidth ? "inline-block" : ""}`}
    >
      <button
        className={`bg-surface rounded-[20px] p-[10px] md:px-4 flex items-center gap-x-1 max-w-full cursor-pointer ${
          open ? "rounded-bl-none rounded-br-none" : ""
        } ${fullWidth ? "w-full" : ""} ${buttonClassName}`}
        onClick={function (e) {
          e.stopPropagation();
          const target = e.currentTarget;
          setOpen((curr) => {
            if (!curr) {
              target.querySelector("input")?.focus();
            } else {
              target.querySelector("input")?.blur();
            }
            return !curr;
          });
        }}
        ref={dropdownRef}
      >
        <input
          type={type}
          inputMode={inputMode}
          name={name}
          id={id}
          onChange={handleChange}
          className="max-w-[calc(100%-16px)] bg-surface text-black focus:outline-none font-medium placeholder:on-surface"
          value={val}
          placeholder={value}
        />
        <FaCaretDown className={open ? "rotate-180" : ""} />
      </button>
      <ul className="absolute left-0 top-[44px] w-full list-none bg-surface p-0 transition-all z-10 opacity-0 invisible focus-within:opacity-100 focus-within:visible max-h-[180px] overflow-y-auto max-md:no-scrollbar rounded-bl-[20px] rounded-br-[20px]">
        {options.map((option) => (
          <li
            key={option.value}
            className="relative flex gap-x-1  items-center p-0 w-full"
          >
            <input
              type="radio"
              value={`${id}#${option.value}`}
              className="absolute left-1/2 opacity-0"
              onClick={(e) => {
                e.stopPropagation();
                setVal(option.value);
                if (onChange) {
                  onChange(option.value);
                }
                const input = e.currentTarget;
                input.blur();
              }}
              id={`${id}#${option.value}`}
            />
            <label
              className="w-full text-primary font-medium cursor-pointer inline-block px-4 py-2"
              htmlFor={`${id}#${option.value}`}
              onClick={(e) => e.stopPropagation()}
            >
              {option.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
