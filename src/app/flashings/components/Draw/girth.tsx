import { Edge, Panel, Node } from "reactflow";
import { EdgeData, NodeData } from "./types";

type Props = {
  edges: Array<Edge<EdgeData>>;
  nodes: Array<Node<NodeData>>;
};

export default function Girth({ edges, nodes }: Props) {
  return (
    <Panel position="bottom-center" className="!m-0 !mb-5">
      <div className="bg-white drop-shadow-pova-flashing text-xs p-2.5 text-on-surface-variant font-medium rounded-xl w-[200px]">
        <div className="flex items-center justify-between">
          <div>Total Bends:</div>
          <div className="text-right">
            {Math.max(edges.length - 1, 0) +
              nodes.reduce((acc, curr) => acc + (curr.data.folded ? 2 : 0), 0)}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>Total Girth(mm):</div>
          <div className="text-right">
            {edges.reduce((acc, curr) => {
              let value = parseInt(curr.label as string);
              let tValue = curr.data?.taperedLabel
                ? parseInt(curr.data.taperedLabel)
                : 0;
              if (isNaN(value)) {
                value = 0;
              }
              if (isNaN(tValue)) {
                tValue = 0;
              }
              return acc + Math.max(value, tValue);
            }, 0)}
          </div>
        </div>
      </div>
    </Panel>
  );
}
