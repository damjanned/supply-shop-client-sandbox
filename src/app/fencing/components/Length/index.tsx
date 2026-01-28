import { PrimaryButton } from "@/components/Button";
import TextInput from "@/components/TextInput";
import React from "react";
import DrawFencing from "./draw";

type Props = {
  setLength: (newLength: string | number) => void;
  length?: string | number;
};

export default function Length({ setLength, length }: Props) {
  const [mode, setMode] = React.useState<"input" | "draw">("input");

  return mode === "input" ? (
    <div className="mt-4">
      <label htmlFor="#fence-length" className="block mb-4 font-bold text-xl">
        Enter Fence Length
      </label>
      <TextInput
        placeholder="Length in metres"
        inputMode="decimal"
        fullWidth
        value={length?.toString()}
        onChange={(newLength) => {
          if (newLength === "") {
            setLength(newLength);
          } else {
            const numLength = parseFloat(newLength);
            if (!isNaN(numLength)) {
              setLength(newLength);
            }
          }
        }}
        id="fence-length"
      />
      <div className="mt-4 pt-4 border-t-[3px] border-t-surface -mx-5 px-5">
        <div className="mb-2 font-bold text-xl">Measure My Fence</div>
        <div className="mb-4 font-medium">(via Satellite View)</div>
        <PrimaryButton
          text="Measuring Tool"
          fullWidth
          onClick={() => setMode("draw")}
          shadow={false}
        />
      </div>
    </div>
  ) : (
    <DrawFencing
      setLength={(length) => {
        setLength(length);
        setMode("input");
      }}
      onClose={() => setMode("input")}
    />
  );
}
