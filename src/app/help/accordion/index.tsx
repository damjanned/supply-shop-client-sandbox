import { AiFillCaretDown } from "react-icons/ai";

type Props = {
  expanded: boolean;
  title: string;
  description: React.ReactNode;
  onClick: () => void;
};

export default function Accordion({
  expanded,
  title,
  description,
  onClick,
}: Props) {
  return (
    <div>
      <div
        className="px-5 py-4 flex justify-between items-center cursor-pointer border-t border-t-surface"
        onClick={onClick}
      >
        <div className="text-xl font-bold">{title}</div>
        <AiFillCaretDown className={`${expanded ? "rotate-180" : ""}`} />
      </div>
      {expanded && <div className="px-5 py-4 bg-surface/60">{description}</div>}
    </div>
  );
}
