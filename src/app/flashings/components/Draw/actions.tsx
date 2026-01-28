import { Panel, useStoreApi } from "reactflow";
import Link from "next/link";
import { MdArrowLeft } from "react-icons/md";
import React from "react";

type Props = {
  onClear: () => void;
  onRemove: () => void;
  onDownload: () => void;
  flashingNum: number;
  nodesCount: number;
  setTapered: (newTapered: boolean) => void;
  tapered: boolean;
  foldedNodes: string[];
  undoLength: number;
};

export default function Actions({
  onClear,
  onRemove,
  onDownload,
  flashingNum,
  nodesCount,
  setTapered,
  tapered,
  foldedNodes,
  undoLength,
}: Props) {
  return (
    <Panel position="top-center" className="!m-0 !mt-5">
      <Link
        href="/flashings/cart"
        className="py-1.5 px-4 font-semibold text-primary bg-surface mb-4 rounded-3xl flex items-center cursor-pointer"
      >
        <span className="text-xl">
          <MdArrowLeft />
        </span>
        <span>Flashing #{flashingNum}</span>
      </Link>
      <div
        className={`bg-surface flex items-center justify-between cursor-pointer rounded-3xl text-2xl py-2 px-4 relative ${
          nodesCount === 0 ? "text-disabled" : "text-primary"
        }`}
      >
        <CrushFold foldedNodes={foldedNodes} nodesCount={nodesCount} />
        <div
          title="Undo"
          onClick={onRemove}
          role="button"
          className={`${undoLength === 0 ? "text-disabled" : "text-primary"}`}
        >
          <Undo />
        </div>
        <div title="Download" onClick={onDownload} role="button">
          <Download />
        </div>
        <div title="Clear" onClick={onClear} role="button">
          <Delete />
        </div>
      </div>
      <div className="bg-surface mt-4 rounded-3xl font-semibold text-primary text-xs flex items-center p-1">
        <div
          className={`cursor-pointer p-2 grow ${
            tapered ? "" : "bg-white border border-primary rounded-3xl"
          }`}
          onClick={() => setTapered(false)}
        >
          Regular
        </div>
        <div
          className={`cursor-pointer p-2 grow ${
            !tapered ? "" : "bg-white border border-primary rounded-3xl"
          }`}
          onClick={() => setTapered(true)}
        >
          Tapered
        </div>
      </div>
    </Panel>
  );
}

function Delete() {
  return (
    <svg
      width="17"
      height="20"
      viewBox="0 0 17 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.12 5H1.62V19.5H15.12V5Z" fill="currentColor" />
      <path d="M16.75 1H0V4H16.75V1Z" fill="currentColor" />
      <path d="M9.88 0H6.88V3H9.88V0Z" fill="currentColor" />
    </svg>
  );
}

function Download() {
  return (
    <svg
      width="21"
      height="23"
      viewBox="0 0 21 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.95215 15.95L15.9521 7.94995L18.0523 10.0501L10.0523 18.0501L7.95215 15.95Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.95215 18.05L1.95215 10.05L4.05226 7.94994L12.0523 15.9499L9.95215 18.05Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.00428581 19.0699L21.0043 19.0999L21 22.0999L0 22.0699L0.00428581 19.0699Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5022 15L8.5022 0L11.5022 -1.31134e-07L11.5022 15L8.5022 15Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Undo() {
  return (
    <svg
      width="20"
      height="22"
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.84797 4.74765C4.65493 2.87522 7.18833 1.70215 9.98256 1.70215C15.5249 1.70215 19.9852 6.2546 19.9852 11.8392C19.9852 17.4218 15.537 21.9762 9.99262 21.9762C4.44725 21.9762 0 17.4105 0 11.8392H2.67C2.67 15.9798 5.96533 19.3062 9.99262 19.3062C14.0209 19.3062 17.3152 15.989 17.3152 11.8392C17.3152 7.69145 14.0129 4.37215 9.98256 4.37215C7.95025 4.37215 6.09954 5.22324 4.76924 6.60174L2.84797 4.74765Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.4632 8.62993L1.2832 0.0630193L4.28254 0L4.46254 8.56691L1.4632 8.62993Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.56323 5.77459L9.78847 5.59058L9.8549 8.55983L1.62966 8.74385L1.56323 5.77459Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CrushFold({
  foldedNodes,
  nodesCount,
}: {
  foldedNodes: string[];
  nodesCount: number;
}) {
  const [foldState, setFoldState] = React.useState<
    "focusFirst" | "focusLast" | "noFold"
  >("focusFirst");
  const state = useStoreApi().getState();

  let text = "";
  switch (foldState) {
    case "focusFirst":
      text = "Add Crush Fold";
      break;
    case "focusLast":
      text = "Fold Other End";
      break;
    default:
      text = "No Fold";
  }

  function mainClick() {
    if (foldedNodes.length > 1) {
      state.resetSelectedElements();
      state.addSelectedNodes([foldedNodes[1]]);
    } else if (foldedNodes.length > 0) {
      switch (foldState) {
        case "focusFirst":
          state.resetSelectedElements();
          state.addSelectedNodes([
            foldedNodes[0] === "1" ? `${nodesCount}` : "1",
          ]);
          setFoldState("noFold");
          break;
        default:
          state.resetSelectedElements();
          setFoldState("focusFirst");
      }
    } else {
      switch (foldState) {
        case "focusFirst":
          state.resetSelectedElements();
          state.addSelectedNodes(["1"]);
          setFoldState("focusLast");
          break;
        case "focusLast":
          state.resetSelectedElements();
          state.addSelectedNodes([`${nodesCount}`]);
          setFoldState("noFold");
          break;
        default:
          state.resetSelectedElements();
          setFoldState("focusFirst");
      }
    }
  }

  React.useEffect(() => {
    if (foldedNodes.length <= 1) {
      setFoldState("focusFirst");
    }
  }, [foldedNodes]);

  return (
    <>
      {foldedNodes.length > 0 && (
        <button
          className="absolute w-[111px] -left-[115px] top-0 bg-primary rounded-3xl py-3 px-2 cursor-pointer focus:outline-none text-on-primary text-xs font-semibold"
          onClick={() => {
            state.resetSelectedElements();
            state.addSelectedNodes([foldedNodes[0]]);
          }}
        >
          Crush Fold #1
        </button>
      )}
      <button
        className={`absolute w-[111px] -left-[115px] ${
          foldedNodes.length > 1
            ? "bg-primary text-on-primary top-14"
            : foldedNodes.length > 0
            ? "top-14 bg-surface"
            : "top-0 bg-surface"
        } rounded-3xl px-2 py-3 cursor-pointer focus:outline-none text-xs font-semibold disabled:text-disabled`}
        disabled={nodesCount <= 1}
        onClick={mainClick}
      >
        {foldedNodes.length > 1 ? "Crush Fold #2" : text}
      </button>
    </>
  );
}
