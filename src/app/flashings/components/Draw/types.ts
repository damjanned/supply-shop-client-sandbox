import { FoldDir } from "./utils";

export type NodeData = {
  edges: Array<{ n1: string; n2: string }>;
  onAngleUpdate: (id: string, prevAngle: number, newAngle: number) => void;
  tapered: boolean;
  folded?: boolean;
  folDir?: FoldDir;
};

export type EdgeData = {
  onEdgeUpdate: (id: string, newLabel: string, taperedLabel: boolean) => void;
  recordEdgeUpdate: (
    id: string,
    tapered: boolean,
    oldLabel: string,
    newLabel: string,
  ) => void;
  tapered: boolean;
  taperedLabel: string;
};
