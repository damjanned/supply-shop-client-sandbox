type Props = {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  label: string | JSX.Element;
  type?: "radio" | "checkbox";
  disabled?: boolean;
  value?: string;
  containerClasses?: string;
  labelContainerClases?: string;
};

export default function Radio({
  checked,
  onChange,
  id,
  name,
  label,
  type = "checkbox",
  disabled,
  value,
  containerClasses,
  labelContainerClases,
}: Props) {
  return (
    <div className={`flex items-center gap-x-4 ${containerClasses || ""}`}>
      <input
        type={type}
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className={`appearance-none m-0 w-6 h-6 min-w-6 min-h-6 bg-transparent grid place-content-center
                border-[3px] border-on-surface-variant border-solid before:w-3 before:h-3 before:bg-primary before:scale-0
                before:checked:scale-100 before:transition-transform checked:border-primary ${
                  type === "radio" ? "rounded-full before:rounded-full" : ""
                } disabled:opacity-30`}
        disabled={disabled}
        value={value}
      />
      <label htmlFor={id} className={labelContainerClases}>
        {label}
      </label>
    </div>
  );
}
