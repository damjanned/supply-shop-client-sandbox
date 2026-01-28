import { SecondaryButton } from "@/components/Button";
import type { BranchDetails } from "@/types/supplier-form";
import Explanation from "./Explanation";

type Props = {
  branches: BranchDetails[];
  addBranch: () => void;
  onEdit: (index: number) => void;
  onClone: (index: number) => void;
};

export default function Branches({
  branches,
  addBranch,
  onEdit,
  onClone,
}: Props) {
  return (
    <>
      <Explanation />
      <div className="my-4 space-y-4 max-h-[calc(100%-280px)] overflow-y-auto">
        {branches.map((branch, index) => (
          <div
            key={branch.name}
            className="flex p-2.5 items-center w-full border-2 border-surface rounded-pova-lg space-x-2.5"
          >
            <div className="font-semibold grow">{branch.name}</div>
            <SecondaryButton text="Clone" onClick={() => onClone(index)} />
            <SecondaryButton text="Edit" onClick={() => onEdit(index)} />
          </div>
        ))}
      </div>
      <div className="text-center">
        <SecondaryButton text="Add New Branch" onClick={() => addBranch()} />
      </div>
    </>
  );
}
