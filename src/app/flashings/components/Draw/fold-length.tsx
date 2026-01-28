import React from "react";

export default function FoldLength() {
  const [label, setLabel] = React.useState("15");
  const valueRef = React.useRef<string>();

  function handleFocus() {
    valueRef.current = label;
    setLabel("");
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === "") {
      setLabel(valueRef.current as string);
    } else {
      const intVal = parseInt(value);
      if (isNaN(intVal) || intVal < 5 || intVal > 20) {
        setLabel("15");
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value);
    if (isNaN(value) && e.target.value !== "") {
      return;
    } else {
      setLabel(e.target.value);
    }
  }

  return (
    <input
      inputMode="numeric"
      value={label}
      className="w-5 outline-none focus:outline-none text-[10px] leading-3 text-center text-on-surface-variant font-semibold"
      onClick={(e) => e.stopPropagation()}
      onFocus={handleFocus}
      placeholder={valueRef.current || "15"}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
}
