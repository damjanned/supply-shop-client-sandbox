import Dropdown, { DropdownOption } from "@/components/Dropdown";

type Props = {
  children: React.ReactNode;
  variants: Array<DropdownOption<{ Price: number; SizeType?: string }>>;
  value?: string;
  onChange: (newValue: string) => void;
};

export default function VariantSelector({
  children,
  variants,
  value,
  onChange,
}: Props) {
  function renderVariant(
    item: DropdownOption<{ Price: number; SizeType?: string }>,
  ) {
    return (
      <div
        className={`px-9 py-2  cursor-pointer ${
          item.id !== value ? "bg-on-primary" : "bg-surface"
        } hover:bg-surface`}
      >
        <div className="text-primary font-semibold mb-1">{item.label}</div>
        <div className="text-on-surface">
          ${item.extraData?.Price?.toFixed(2)}
          {item.extraData?.SizeType &&
            item.extraData.SizeType === "Length" &&
            " per l/m"}
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <div className="mt-6 lg:w-[22.75rem] mx-5">
        <Dropdown
          options={variants}
          renderItem={renderVariant}
          value={value || ""}
          onChange={onChange}
          placeholder="Select Variant"
        />
      </div>
    </>
  );
}
