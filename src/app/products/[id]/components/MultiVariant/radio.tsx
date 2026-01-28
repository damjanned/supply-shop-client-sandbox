type Props = {
  label?: string;
  name?: string;
  id?: string;
  required?: boolean;
  value?: string;
  onChange?: (newValue: boolean) => void;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
};

export default function Radio({
  name,
  id,
  required,
  value,
  label,
  onChange,
  defaultChecked,
  checked,
  disabled,
}: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;
    if (onChange) {
      onChange(isChecked);
    }
  }

  return (
    <label className="py-4 flex items-center justify-between font-semibold text-sm cursor-pointer border-b border-b-surface">
      {label}
      <input
        type="radio"
        name={name}
        id={id}
        required={required}
        value={value}
        onChange={handleChange}
        defaultChecked={defaultChecked}
        checked={checked}
        disabled={disabled}
        className="appearance-none m-0 w-6 h-6 grid place-content-center rounded-none
          border-2 border-[#707070] border-solid before:w-3 before:h-3 before:bg-primary before:scale-0
          before:checked:scale-100 before:transition-transform checked:border-primary disabled:cursor-not-allowed"
      />
    </label>
  );
}
