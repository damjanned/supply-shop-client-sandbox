import React from "react";
import Modal from "../Modal";
import TextInput from "../TextInput";
import { PrimaryButton } from "../Button";
import { useAppDispatch } from "@/redux/hooks";
import { setJobRef } from "@/redux/app";
import { useRouter } from "next/navigation";

type Props = {
  visible: boolean;
  onSave?: () => void;
};

export default function JobRef({ visible, onSave }: Props) {
  const [label, setLabel] = React.useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <Modal
      visible={visible}
      fullWidth
      overlay
      overlayContentPositon="end"
      overlayContentFullWidth
    >
      <div className="bg-on-primary">
        <div className="font-semibold">
          Give your order a label (e.g. name,job reference, address){" "}
        </div>
        <TextInput
          rootClasses="mt-4"
          placeholder="Label Your Cart"
          value={label}
          onChange={(newLabel) => {
            if (newLabel.length <= 50) {
              setLabel(newLabel);
            }
          }}
          fullWidth
        />
        <div className="text-right text-sm text-on-surface mt-1 font-medium">
          {label.length}/50 characters
        </div>
        <div className="mt-4">
          <PrimaryButton
            fullWidth
            text="Save"
            onClick={() => {
              dispatch(setJobRef(label));
              if (onSave) {
                onSave();
              } else {
                router.back();
              }
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
