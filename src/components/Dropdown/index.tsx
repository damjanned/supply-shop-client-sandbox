"use client";
import React from "react";
import { FaCaretDown } from "react-icons/fa6";

export type DropdownOption<T> = {
  id: string;
  label: string;
  extraData?: T;
};

type Props<U> = {
  options: Array<DropdownOption<U>>;
  renderItem: (item: DropdownOption<U>, index: number) => React.ReactNode;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  listClasses?: string;
  small?: boolean;
  disabled?: boolean;
};

export default function Dropdown<U>(props: Props<U>) {
  const [open, setOpen] = React.useState(false);

  function toggleOpen() {
    if (props.options.length === 0 || props.disabled) {
      return;
    }
    setOpen((curr) => !curr);
  }

  const placeholder = props.placeholder || "Select";
  const label = !props.value
    ? placeholder
    : props.options.find((item) => item.id === props.value)?.label ||
      placeholder;

  return (
    <>
      <div
        role="select"
        className={`flex items-center justify-between bg-surface p-4 rounded-pova-lg cursor-pointer  ${
          open ? "border border-primary" : ""
        } ${props.small ? "px-2 md:px-4" : ""} ${
          props.options.length === 0 || props.disabled ? "text-disabled" : ""
        }`}
        onClick={toggleOpen}
      >
        <div
          className={`font-medium ${
            props.disabled
              ? "text-disabled"
              : props.value
              ? "text-primary"
              : "text-on-surface"
          } ${props.small ? "text-xs md:text-base" : ""}`}
        >
          {label}
        </div>
        <FaCaretDown className={open ? "rotate-180" : ""} />
      </div>
      {open && (
        <div className={`${props.listClasses}`}>
          {props.options.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                props.onChange(item.id);
                setOpen(false);
              }}
            >
              {props.renderItem(item, index)}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
