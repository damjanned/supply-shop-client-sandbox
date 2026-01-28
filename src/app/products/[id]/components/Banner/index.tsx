export default function Banner({
  loading,
  count,
  onClick,
}: {
  loading: boolean;
  count?: number;
  onClick: () => void;
}) {
  return loading ? (
    <div className="h-16 w-screen max-w-screen-lg animate-pulse bg-on-surface/60 mt-2.5 -mx-5" />
  ) : (count as number) > 0 ? (
    <>
      <div
        className="mt-4 flex justify-between items-center py-3 pl-5 pr-2.5 -mx-5 bg-accessory cursor-pointer"
        onClick={onClick}
      >
        <div className="font-bold text-2xl">
          ({count}) Add-On{(count as number) > 1 ? "s" : ""} available
        </div>
        <RightIcon />
      </div>
      <div className="mt-2.5 text-xs font-light">
        {count} supplimentary component{(count as number) > 1 ? "s" : ""}{" "}
        associated with this item. Click above to know more
      </div>
    </>
  ) : null;
}

function RightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
    >
      <rect
        x="40"
        y="40"
        width="40"
        height="40"
        rx="20"
        transform="rotate(-180 40 40)"
        fill="#EEEEEE"
      />
      <path
        d="M24 19.7721L18.5 25.0002L18.5 14.5029L24 19.7721Z"
        fill="black"
      />
    </svg>
  );
}
