type Props = {
  label?: string;
  name?: string;
  id?: string;
  required?: boolean;
  value?: string;
  onChange?: (newValue: boolean) => void;
  checked?: boolean;
  defaultChecked?: boolean;
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
}: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;
    if (onChange) {
      onChange(isChecked);
    }
  }

  return (
    <label
      className="p-4 bg-surface rounded-pova-lg flex items-center gap-x-3 font-medium text-on-surface
    focus-within:outline-primary focus-within:outline-2 focus-within:outline cursor-pointer"
    >
      <input
        type="radio"
        name={name}
        id={id}
        required={required}
        value={value}
        onChange={handleChange}
        defaultChecked={defaultChecked}
        checked={checked}
        className="appearance-none m-0 w-6 h-6 rounded-full bg-transparent grid place-content-center
        border-2 border-primary border-solid before:w-3 before:h-3 before:rounded-full before:bg-primary before:scale-0
        before:checked:scale-100 before:transition-transform"
      />
      {label}
    </label>
  );
}
