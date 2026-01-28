import { produceWithPatches } from "immer";
import React from "react";
import type { NodeData, EdgeData } from "./types";
import type { Node, Edge as ReactFlowEdge } from "reactflow";

export type Edge = { x1: number; y1: number; x2: number; y2: number };
export type Position = { x: number; y: number };

export function getAngle(edges: [Edge, Edge]) {
  let x1, y1, x2, y2, x3, y3;

  if (edges[0].x1 === edges[1].x1 && edges[0].y1 === edges[1].y1) {
    x1 = edges[0].x1;
    y1 = edges[0].y1;
    x2 = edges[0].x2;
    y2 = edges[0].y2;
    x3 = edges[1].x2;
    y3 = edges[1].y2;
  } else if (edges[0].x1 === edges[1].x2 && edges[0].y1 === edges[1].y2) {
    x1 = edges[0].x1;
    y1 = edges[0].y1;
    x2 = edges[0].x2;
    y2 = edges[0].y2;
    x3 = edges[1].x1;
    y3 = edges[1].y1;
  } else if (edges[0].x2 === edges[1].x1 && edges[0].y2 === edges[1].y1) {
    x1 = edges[0].x2;
    y1 = edges[0].y2;
    x2 = edges[0].x1;
    y2 = edges[0].y1;
    x3 = edges[1].x2;
    y3 = edges[1].y2;
  } else {
    x1 = edges[0].x2;
    y1 = edges[0].y2;
    x2 = edges[0].x1;
    y2 = edges[0].y1;
    x3 = edges[1].x1;
    y3 = edges[1].y1;
  }

  const dx21 = x2 - x1;
  const dx31 = x3 - x1;
  const dy21 = y2 - y1;
  const dy31 = y3 - y1;
  const m12 = Math.sqrt(dx21 * dx21 + dy21 * dy21);
  const m13 = Math.sqrt(dx31 * dx31 + dy31 * dy31);
  const theta = Math.acos((dx21 * dx31 + dy21 * dy31) / (m12 * m13));
  return Math.round((180 * theta) / Math.PI);
}

export function getNewCoords(
  a: Position,
  b: Position,
  c: Position,
  prevAngle: number,
  newAngle: number,
) {
  const posDelta = (Math.PI * Math.abs(prevAngle - newAngle)) / 180;
  const negDelta = (Math.PI * -Math.abs(prevAngle - newAngle)) / 180;
  const dx = c.x - a.x;
  const dy = c.y - a.y;
  const d_acx_p = dx * Math.cos(posDelta) - dy * Math.sin(posDelta);
  const d_acy_p = dx * Math.sin(posDelta) + dy * Math.cos(posDelta);

  const d_acx_n = dx * Math.cos(negDelta) - dy * Math.sin(negDelta);
  const d_acy_n = dx * Math.sin(negDelta) + dy * Math.cos(negDelta);

  const c1x = a.x + d_acx_p;
  const c1y = a.y + d_acy_p;

  const c2x = a.x + d_acx_n;
  const c2y = a.y + d_acy_n;

  const a1 = getAngle([
    { x1: a.x, y1: a.y, x2: b.x, y2: b.y },
    { x1: a.x, y1: a.y, x2: c1x, y2: c1y },
  ]);
  if (a1 === newAngle) {
    return { x: c1x, y: c1y };
  } else {
    return { x: c2x, y: c2y };
  }
}

export enum ColourDirection {
  INSIDE = 0,
  OUTSIDE = 1,
}

export enum FoldDir {
  UP = 1,
  DOWN = 2,
}

export const ColourContext = React.createContext<ColourDirection>(
  ColourDirection.OUTSIDE,
);

export type DiagramState = {
  nodes: Array<Node<NodeData, "point">>;
  edges: Array<ReactFlowEdge<EdgeData>>;
  tapered: boolean;
  colourDir: ColourDirection;
  foldedNodes: string[];
};

export const updateAngleWithPatches = produceWithPatches(
  (draft: DiagramState, id: string, prevAngle: number, angle: number) => {
    const index = parseInt(id) - 1;
    const updateNext = draft.nodes.length - index - 1 <= index - 1;

    if (updateNext) {
      draft.nodes[index].data = { ...draft.nodes[index].data };

      draft.nodes[index + 1].position = getNewCoords(
        draft.nodes[index].position,
        draft.nodes[index - 1].position,
        draft.nodes[index + 1].position,
        prevAngle,
        angle,
      );
      draft.nodes[index + 1].data = { ...draft.nodes[index + 1].data };

      if (index + 2 < draft.nodes.length) {
        draft.nodes[index + 2].data = { ...draft.nodes[index + 2].data };
      }
    } else {
      if (index - 2 >= 0) {
        draft.nodes[index - 2].data = { ...draft.nodes[index - 2].data };
      }

      draft.nodes[index - 1].position = getNewCoords(
        draft.nodes[index].position,
        draft.nodes[index + 1].position,
        draft.nodes[index - 1].position,
        prevAngle,
        angle,
      );
      draft.nodes[index - 1].data = { ...draft.nodes[index - 1].data };

      draft.nodes[index].data = { ...draft.nodes[index].data };
    }
  },
);

export const addPointWithPatches = produceWithPatches(
  (
    draft: DiagramState,
    e: React.MouseEvent<Element, MouseEvent>,
    addFirst: boolean,
    onEdgeUpdate: EdgeData["onEdgeUpdate"],
    onAngleUpdate: NodeData["onAngleUpdate"],
    screenToFlowPosition: (position: Position) => Position,
    recordEdgeUpdate: EdgeData["recordEdgeUpdate"],
  ) => {
    const nodeId = addFirst ? "1" : (draft.nodes.length + 1).toString();
    let edgeAdded = { n1: "", n2: "" };
    let node: Node<NodeData, "point"> | null = null;
    if (draft.nodes.length > 0) {
      node = addFirst ? draft.nodes[0] : draft.nodes[draft.nodes.length - 1];

      if (node.data.folded) {
        const index = draft.foldedNodes.findIndex((item) => item === node!.id);
        draft.foldedNodes = [
          ...draft.foldedNodes.slice(0, index),
          nodeId,
          ...draft.foldedNodes.slice(index + 1),
        ];
      }

      const edge = {
        id: addFirst
          ? "1-2"
          : `${draft.nodes.length}-${draft.nodes.length + 1}`,
        source: addFirst ? "1" : draft.nodes.length.toString(),
        target: addFirst ? "2" : (draft.nodes.length + 1).toString(),
        type: "double",
        label: String.fromCodePoint(
          ("A".codePointAt(0) as number) + draft.edges.length,
        ),
        data: {
          tapered: draft.tapered,
          taperedLabel: `${String.fromCodePoint(
            ("A".codePointAt(0) as number) + draft.edges.length,
          )}"`,
          onEdgeUpdate,
          recordEdgeUpdate,
        },
      };

      edgeAdded = {
        n1: addFirst ? "1" : draft.nodes.length.toString(),
        n2: addFirst ? "2" : (draft.nodes.length + 1).toString(),
      };

      if (addFirst) {
        // Update existing edges
        draft.edges = draft.edges.map(({ id, source, target, ...rest }) => {
          const [src, tgt] = id.split("-").map((rec) => parseInt(rec));
          return {
            ...rest,
            id: `${src + 1}-${tgt + 1}`,
            source: (src + 1).toString(),
            target: (tgt + 1).toString(),
          };
        });
        draft.edges.unshift(edge);

        // Update existing nodes
        draft.nodes = draft.nodes.map((node, index) => ({
          ...node,
          id: (parseInt(node.id) + 1).toString(),
          data: {
            ...node.data,
            edges:
              index === 0
                ? [
                    ...node.data.edges.map((edge) => ({
                      n1: (parseInt(edge.n1) + 1).toString(),
                      n2: (parseInt(edge.n2) + 1).toString(),
                    })),
                    edgeAdded,
                  ]
                : node.data.edges.map((edge) => ({
                    n1: (parseInt(edge.n1) + 1).toString(),
                    n2: (parseInt(edge.n2) + 1).toString(),
                  })),
          },
        }));
      } else {
        draft.edges.push(edge);
        const lastNode = draft.nodes[draft.nodes.length - 1];
        lastNode.data.edges.push(edgeAdded);
      }
    }

    const position = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });
    position.x = Math.round(position.x / 20) * 20;
    position.y = Math.round(position.y / 20) * 20;

    const newNode = {
      id: nodeId,
      type: "point" as "point",
      position,
      data: {
        edges: edgeAdded ? [edgeAdded] : [],
        tapered: draft.tapered,
        folded: node?.data.folded || false,
        folDir: node?.data.folDir,
        onAngleUpdate,
      },
    };

    if (addFirst) {
      draft.nodes.unshift(newNode);
    } else {
      draft.nodes.push(newNode);
    }
  },
);

export const updateTaperedWithPatches = produceWithPatches(
  (draft: DiagramState, tapered: boolean) => {
    draft.tapered = tapered;
    draft.edges = draft.edges.map((edge) => ({
      ...edge,
      data: {
        ...(edge.data as EdgeData),
        tapered,
      },
    }));
    draft.nodes = draft.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        tapered,
      },
    }));
  },
);

export const updateColourDirWithPatches = produceWithPatches(
  (draft: DiagramState, colourDir: ColourDirection) => {
    draft.colourDir = colourDir;
  },
);

export const updateFoldedWithPatches = produceWithPatches(
  (draft: DiagramState, id: string, folded: boolean, dir: FoldDir) => {
    const index = draft.nodes.findIndex((node) => node.id === id);
    const alreadyFolded = draft.nodes[index].data.folded;
    draft.nodes[index].data = {
      ...draft.nodes[index].data,
      folded,
      folDir: dir,
    };
    if (folded && !alreadyFolded) {
      draft.foldedNodes.push(id);
    } else if (!folded) {
      draft.foldedNodes = draft.foldedNodes.filter((node) => node !== id);
    }
  },
);

export const clearWithPatches = produceWithPatches((draft: DiagramState) => {
  draft.nodes = [];
  draft.edges = [];
  draft.foldedNodes = [];
});

export const updateEdgeLabelWithPatches = produceWithPatches(
  (draft: DiagramState, id: string, tapered: boolean, label: string) => {
    const edge = draft.edges.find((edge) => edge.id === id);
    if (tapered) {
      edge!.data!.taperedLabel = label;
    } else {
      edge!.label = label;
    }
  },
);

export const updateDragWithPatches = produceWithPatches(
  (draft: DiagramState, id: string, position: Position) => {
    const index = draft.nodes.findIndex((node) => node.id === id);
    draft.nodes[index].position = position;
  },
);
