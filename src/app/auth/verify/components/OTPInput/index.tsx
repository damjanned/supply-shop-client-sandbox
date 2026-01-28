"use client";
import * as React from "react";
import TextInput from "@/components/TextInput";

type Props = {
  length?: number;
  onChange: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string;
  autoFocus?: boolean;
};

export default function OTPInput({
  length = 6,
  onChange,
  disabled,
  errorMessage,
  autoFocus,
}: Props) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [otp, setOtp] = React.useState<Array<string>>(Array(length).fill(""));

  React.useEffect(() => {
    if (autoFocus) {
      const children = parentRef.current?.children;
      if (children && children.length > 0) {
        (children.item(0) as HTMLInputElement).focus();
      }
    }
  }, [autoFocus]);

  function digitEntered(digit: string, index: number) {
    if (digit === "") {
      setOtp((curr) => [...curr.slice(0, index), digit]);
      return;
    }
    const enteredDigits = digit.split("");
    const parseableDigits: Array<string> = [];
    for (let i = 0; i < enteredDigits.length; i++) {
      const numericDigit = parseInt(enteredDigits[i]);
      if (isNaN(numericDigit) || numericDigit > 9 || numericDigit < 0) {
        break;
      } else {
        parseableDigits.push(enteredDigits[i]);
      }
    }
    setOtp((curr) => [
      ...curr.slice(0, index),
      ...parseableDigits.slice(0, length - index),
    ]);
    const filled = [
      ...otp.slice(0, index),
      ...parseableDigits.slice(0, length - index),
    ];
    if (filled.length === length) {
      onChange(filled.join(""));
    } else {
      const children = parentRef.current?.children;
      if (children && children.length > filled.length) {
        (children.item(filled.length) as HTMLInputElement).focus();
      }
    }
  }

  return (
    <>
      <div className="flex gap-x-4" ref={parentRef}>
        {Array.from(Array(length).keys()).map((value, index) => (
          <TextInput
            key={value}
            required
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            rootClasses="w-11 h-11"
            value={otp.length > index ? otp[index] : ""}
            onChange={(value) => digitEntered(value, index)}
            disabled={disabled}
          />
        ))}
      </div>
      {errorMessage && (
        <span className="inline-block text-xs font-medium mt-2 text-on-error">
          {errorMessage}
        </span>
      )}
    </>
  );
}
