import type { NodeData } from "./types";
import { useReactFlow, useStoreApi, type Node } from "reactflow";
import { MdClose, MdUTurnLeft, MdUTurnRight } from "react-icons/md";
import { FoldDir } from "./utils";
import React from "react";

type Props = {
  foldedNode: Node<NodeData> | undefined;
  nodes: Array<Node<NodeData>>;
  foldNode: (id: string, dir: FoldDir) => void;
  unfold: (id: string) => void;
};

export default function NodeActions({
  foldedNode,
  nodes,
  foldNode: fold,
  unfold: unfoldNode,
}: Props) {
  const [foldDetails, setFoldDetails] = React.useState<{
    folded: boolean;
    dir: FoldDir;
  }>({
    folded: foldedNode?.data?.folded || false,
    dir: foldedNode?.data?.folDir || FoldDir.UP,
  });
  const store = useStoreApi();
  const { flowToScreenPosition } = useReactFlow();
  const position =
    foldedNode &&
    (foldedNode.id === "1" || foldedNode.id === `${nodes.length}`) &&
    nodes.length > 1
      ? foldedNode.position
      : null;

  const screenPosition = position ? flowToScreenPosition(position) : null;

  function foldNode(dir: FoldDir) {
    fold(foldedNode!.id, dir);
    setFoldDetails({ folded: true, dir });
  }

  function unfold() {
    unfoldNode(foldedNode!.id);
    setFoldDetails({ folded: false, dir: FoldDir.UP });
    store.getState().resetSelectedElements();
  }

  return (
    <div
      className={`bg-surface ${
        position ? "inline-block" : "hidden"
      } absolute rounded-[20px]  p-1 cursor-pointer`}
      style={
        screenPosition
          ? { left: screenPosition.x - 20, top: screenPosition.y - 48 }
          : undefined
      }
    >
      {foldDetails.folded ? (
        <div className="flex gap-x-1 items-center text-2xl">
          {foldDetails.dir === FoldDir.UP ? (
            <MdUTurnLeft
              className="text-2xl"
              onClick={() => foldNode(FoldDir.DOWN)}
            />
          ) : (
            <MdUTurnRight
              className="text-2xl"
              onClick={() => foldNode(FoldDir.UP)}
            />
          )}
          <MdClose className="text-2xl" onClick={unfold} />
        </div>
      ) : (
        <MdUTurnRight
          className="text-2xl"
          onClick={() => foldNode(FoldDir.UP)}
        />
      )}
    </div>
  );
}
