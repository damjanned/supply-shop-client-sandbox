import { HTMLInputTypeAttribute } from "react";

type Props = {
  value?: string;
  onChange?: (newValue: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  pattern?: string;
  disabled?: boolean;
  rootClasses?: string;
  fullWidth?: boolean;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  initialValue?: string;
  errorMessage?: string;
  max?: number;
  focussed?: boolean;
  min?: number | string;
  autoComplete?: string;
  inputMode?:
    | "search"
    | "text"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  step?: string;
};

export default function TextInput({
  value,
  onChange,
  placeholder,
  name,
  id,
  pattern,
  disabled,
  rootClasses,
  fullWidth,
  required,
  type,
  initialValue,
  errorMessage,
  max,
  min,
  autoComplete,
  inputMode,
  step,
}: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  }

  return (
    <>
      <input
        value={value}
        onChange={onChange ? handleChange : undefined}
        placeholder={placeholder}
        name={name}
        id={id}
        pattern={pattern}
        disabled={disabled}
        className={`inline-block bg-surface p-4 rounded-pova-lg text-black placeholder:on-surface 
      focus:outline focus:outline-2 focus:outline-primary font-medium ${
        fullWidth ? "w-full" : ""
      } ${disabled ? "text-on-surface" : ""} ${rootClasses || ""}`}
        required={required}
        type={type}
        defaultValue={initialValue}
        max={max}
        min={min}
        autoComplete={autoComplete}
        inputMode={inputMode}
        step={step}
      />
      {errorMessage && (
        <span className="inline-block text-xs font-medium mt-2 text-on-error ml-2">
          {errorMessage}
        </span>
      )}
    </>
  );
}
