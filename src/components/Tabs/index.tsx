type Props = {
  headers: Array<string>;
  value: string;
  onChange: (newValue: string) => void;
  rounded?: boolean;
  inactive?: Array<string>;
};

export default function Tabs({
  headers,
  value,
  onChange,
  rounded = true,
  inactive = [],
}: Props) {
  function switchTab(e: React.MouseEvent<HTMLDivElement>) {
    const category = e.currentTarget.getAttribute("data-category");
    if (inactive.includes(category as string)) {
      return;
    }
    onChange(category as string);
  }

  return (
    <div
      className={`flex bg-surface ${
        rounded ? "rounded-[50px]" : "rounded-pova-lg"
      } py-[4px] items-center`}
    >
      {headers.map((header) => (
        <div
          className={`grow text-center font-semibold py-[14px] ${
            value === header
              ? `bg-on-primary border border-primary ${
                  rounded ? "rounded-[50px]" : "rounded-pova-lg"
                }`
              : ""
          } ${
            inactive.includes(header)
              ? "cursor-not-allowed text-on-surface"
              : "cursor-pointer"
          }`}
          data-category={header}
          onClick={switchTab}
          key={header}
        >
          {header}
        </div>
      ))}
    </div>
  );
}
