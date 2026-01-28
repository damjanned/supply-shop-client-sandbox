import {
  Handle,
  NodeProps,
  Position,
  useReactFlow,
  Node,
  ReactFlowInstance,
  BaseEdge,
  EdgeLabelRenderer,
} from "reactflow";
import React from "react";
import { getAngle, Edge, FoldDir } from "./utils";
import type { NodeData } from "./types";
import _ from "lodash";
import ReactDOM from "react-dom";
import FoldLength from "./fold-length";

const updateVertex = _.debounce(function (
  data: NodeData,
  angle: number | "",
  id: string,
  getNode: ReactFlowInstance["getNode"],
) {
  if (angle === "") {
    return;
  }
  const edges = data.edges.map((edge) => {
    const n1 = getNode(edge.n1) as Node<NodeData>;
    const n2 = getNode(edge.n2) as Node<NodeData>;
    return {
      x1: n1.position.x,
      y1: n1.position.y,
      x2: n2.position.x,
      y2: n2.position.y,
    };
  });
  data.onAngleUpdate(id, getAngle(edges as [Edge, Edge]), angle);
}, 1000);

export default function Point({
  selected,
  data,
  id,
  xPos,
  yPos,
}: NodeProps<NodeData>) {
  const { getNode } = useReactFlow();
  const [angle, setAngle] = React.useState<{
    value: number | "";
    path: string;
    coords: { x: number; y: number };
  }>(() => {
    const edges = data.edges
      .map((edge) => {
        const n1 = getNode(edge.n1) as Node<NodeData>;
        const n2 = getNode(edge.n2) as Node<NodeData>;
        if (!n1 || !n2) {
          return null;
        }
        return {
          x1: n1.position.x,
          y1: n1.position.y,
          x2: n2.position.x,
          y2: n2.position.y,
        };
      })
      .filter(Boolean);
    const { coords, ...rest } = getPathAndAngle(edges as [Edge, Edge]);
    return { ...rest, coords: { x: coords.x - xPos, y: coords.y - yPos } };
  });
  const [foldedPath, setFoldedPath] = React.useState<{
    path: string;
    pos: { x: number; y: number };
    angle: number;
  }>(
    data.folded
      ? () => {
          const edges = data.edges
            .map((edge) => {
              const n1 = getNode(edge.n1) as Node<NodeData>;
              const n2 = getNode(edge.n2) as Node<NodeData>;
              if (!n1 || !n2) {
                return null;
              }
              return {
                x1: n1.position.x,
                y1: n1.position.y,
                x2: n2.position.x,
                y2: n2.position.y,
              };
            })
            .filter(Boolean);
          const edge = edges[0] as Edge;
          return getFoldedPath(xPos, yPos, edge, data.tapered, data.folDir);
        }
      : { path: "", pos: { x: 0, y: 0 }, angle: 0 },
  );

  React.useEffect(() => {
    const edges = data.edges
      .map((edge) => {
        const n1 = getNode(edge.n1) as Node<NodeData>;
        const n2 = getNode(edge.n2) as Node<NodeData>;
        if (!n1 || !n2) {
          return null;
        }
        return {
          x1: n1.position.x,
          y1: n1.position.y,
          x2: n2.position.x,
          y2: n2.position.y,
        };
      })
      .filter(Boolean);
    const { coords, ...rest } = getPathAndAngle(edges as [Edge, Edge]);
    setAngle({ ...rest, coords: { x: coords.x - xPos, y: coords.y - yPos } });
    setFoldedPath(
      data.folded
        ? () => {
            const edge = edges[0] as Edge;
            return getFoldedPath(xPos, yPos, edge, data.tapered, data.folDir);
          }
        : { path: "", pos: { x: 0, y: 0 }, angle: 0 },
    );
  }, [data, getNode, xPos, yPos]);

  function onBlur() {
    if (!angle.value) {
      const edges = data.edges
        .map((edge) => {
          const n1 = getNode(edge.n1) as Node<NodeData>;
          const n2 = getNode(edge.n2) as Node<NodeData>;
          if (!n1 || !n2) {
            return null;
          }
          return {
            x1: n1.position.x,
            y1: n1.position.y,
            x2: n2.position.x,
            y2: n2.position.y,
          };
        })
        .filter(Boolean);
      const { coords, ...rest } = getPathAndAngle(edges as [Edge, Edge]);
      setAngle({ ...rest, coords: { x: coords.x - xPos, y: coords.y - yPos } });
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value);
    if (isNaN(value) && e.target.value !== "") {
      return;
    } else if (!isNaN(value) && (value < 0 || value > 180)) {
      alert("angle needs to be between 0 and 180 deg");
      return;
    } else if (!isNaN(value)) {
      setAngle((curr) => ({ ...curr, value }));
      updateVertex(data, value, id, getNode);
    } else {
      setAngle((curr) => ({ ...curr, value: "" }));
      updateVertex(data, "", id, getNode);
    }
  }

  return (
    <div className="nopan pointer-all">
      <label
        className={`block w-4 h-4 rounded-lg cursor-pointer -translate-x-2/4 -translate-y-2/4 ${
          selected ? "bg-error" : "bg-success"
        }`}
        htmlFor={`${id}-input`}
      />
      {data.tapered && (
        <>
          <div className="w-4 h-4 rounded-lg -translate-y-[174px] translate-x-[142px]  bg-success" />
          <div className="w-[3px] h-[196px] bg-surface-disabled/30 -translate-y-[233px] translate-x-[5px] origin-bottom rotate-45 absolute" />
        </>
      )}
      {(angle.value === "" || angle.value >= 0) && (
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2"
          style={{ left: angle.coords.x, top: angle.coords.y }}
        >
          <input
            inputMode="numeric"
            value={angle.value}
            onChange={onChange}
            placeholder="45"
            className="w-6 bg-transparent outline-none focus:outline-none text-xs text-center  font-bold"
            id={`${id}-input`}
            onBlur={onBlur}
            onFocus={(e) => {
              e.currentTarget.setSelectionRange(0, 3);
            }}
          />
          {angle.value !== "" && <span className="text-xl font-bold">°</span>}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Top}
        className="!left-0 top-0.5 invisible"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!left-0 -top-0.5 invisible"
      />
      {ReactDOM.createPortal(
        <>
          <BaseEdge
            path={angle.path}
            style={{
              stroke: "#3f8827",
            }}
          />
          {data.folded && foldedPath.path && (
            <>
              <BaseEdge
                path={foldedPath.path}
                style={{
                  stroke: "black",
                  strokeWidth: 2,
                }}
              />
              <EdgeLabelRenderer>
                <div
                  className="absolute bg-white z-10 text-xs shadow-pova-sm rounded-[5px] no-pan pointer-all"
                  style={{
                    transform: `translate(${foldedPath.pos.x}px,${foldedPath.pos.y}px) rotate(${foldedPath.angle}rad) translateX(-100%)`,
                    transformOrigin: "top left",
                  }}
                >
                  <FoldLength />
                </div>
              </EdgeLabelRenderer>
            </>
          )}
        </>,
        document.querySelector(".react-flow__edges") as Element,
      )}
    </div>
  );
}

function getPathAndAngle(edges: [Edge, Edge]) {
  if (edges.length < 2) {
    return { path: "", value: -1, coords: { x: 0, y: 0 } };
  }
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
  let theta = Math.acos((dx21 * dx31 + dy21 * dy31) / (m12 * m13));
  const angle = Math.round((180 * theta) / Math.PI);

  const p1x = (5 * x1 + 2 * x2) / 7;
  const p1y = (5 * y1 + 2 * y2) / 7;
  const p2x = (5 * x1 + 2 * x3) / 7;
  const p2y = (5 * y1 + 2 * y3) / 7;

  const mpx = (p1x + p2x) / 2;
  const mpy = (p1y + p2y) / 2;

  const dist = angle > 150 ? 80 : angle > 120 ? 55 : 35;
  theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2;

  const c1x = mpx + dist * Math.cos(theta);
  const c1y = mpy + dist * Math.sin(theta);

  const c2x = mpx - dist * Math.cos(theta);
  const c2y = mpy - dist * Math.sin(theta);

  const d1 = y1 - p1y - ((p2y - p1y) / (p2x - p1x)) * (x1 - p1x);
  const d2 = c1y - p1y - ((p2y - p1y) / (p2x - p1x)) * (c1x - p1x);

  let f1x, f1y;

  if (d1 * d2 < 0) {
    f1x = c1x;
    f1y = c1y;
  } else {
    f1x = c2x;
    f1y = c2y;
  }

  const o1x = (m13 * x1 - 20 * x3) / (m13 - 20);
  const o1y = (m13 * y1 - 20 * y3) / (m13 - 20);

  return {
    path: `M${p1x} ${p1y}Q ${f1x} ${f1y} ${p2x} ${p2y}`,
    value: angle,
    coords:
      angle > 50
        ? { x: (4 * mpx + f1x) / 5, y: (4 * mpy + f1y) / 5 }
        : {
            x: o1x,
            y: o1y,
          },
  };
}

function getFoldedPath(
  xPos: number,
  yPos: number,
  edge: Edge,
  tapered: boolean,
  direction = FoldDir.UP,
) {
  let ox = edge.x1 === xPos ? edge.x2 : edge.x1;
  let oy = edge.y1 === yPos ? edge.y2 : edge.y1;
  const dist = 15;
  const theta = Math.atan2(edge.y2 - edge.y1, edge.x2 - edge.x1) - Math.PI / 2;

  const p1 = getFoldPath({ xPos, yPos, dist, ox, oy, theta, direction });
  const p1angle = Math.atan2(p1[1].y - p1[1].cy, p1[1].x - p1[1].cx);
  const p1anglePo1 = p1angle - Math.PI / 2;
  const p1anglePo2 = p1angle + Math.PI / 2;
  const option1 = {
    x: p1[1].x + dist * 1.25 * Math.cos(p1anglePo1),
    y: p1[1].y + dist * 1.25 * Math.sin(p1anglePo1),
  };
  const option2 = {
    x: p1[1].x + dist * 1.25 * Math.cos(p1anglePo2),
    y: p1[1].y + dist * 1.25 * Math.sin(p1anglePo2),
  };
  const doption1 = Math.sqrt(
    (option1.x - xPos) * (option1.x - xPos) +
      (option1.y - yPos) * (option1.y - yPos),
  );
  const doption2 = Math.sqrt(
    (option2.x - xPos) * (option2.x - xPos) +
      (option2.y - yPos) * (option2.y - yPos),
  );
  if (!tapered) {
    return {
      path: p1[0],
      pos: doption1 > doption2 ? option1 : option2,
      angle: p1angle,
    };
  }

  const p2 = getFoldPath({
    xPos: xPos + 150,
    yPos: yPos - 150,
    dist,
    ox: ox + 150,
    oy: oy - 150,
    theta,
    direction,
  });

  return {
    path: `${p1[0]} L${p2[1].x},${p2[1].y} ${p2[0]}`,
    pos: doption1 > doption2 ? option1 : option2,
    angle: p1angle,
  };
}

function getFoldPath(details: {
  xPos: number;
  yPos: number;
  dist: number;
  ox: number;
  oy: number;
  theta: number;
  direction: FoldDir;
}): [string, { x: number; y: number; cx: number; cy: number }] {
  const { xPos, yPos, dist, ox, oy, theta, direction } = details;

  const p1x = xPos + dist * Math.cos(theta);
  const p1y = yPos + dist * Math.sin(theta);
  const mpx = (xPos + p1x) / 2;
  const mpy = (yPos + p1y) / 2;
  let thetaP = Math.atan2(p1y - yPos, p1x - xPos) - Math.PI / 2;

  let q1ppx = mpx + 2.5 * dist * Math.cos(thetaP);
  let q1ppy = mpy + 2.5 * dist * Math.sin(thetaP);
  let q1pnx = mpx - 2.5 * dist * Math.cos(thetaP);
  let q1pny = mpy - 2.5 * dist * Math.sin(thetaP);

  const q1pd = Math.sqrt(
    (q1ppx - ox) * (q1ppx - ox) + (q1ppy - oy) * (q1ppy - oy),
  );
  const q1nd = Math.sqrt(
    (q1pnx - ox) * (q1pnx - ox) + (q1pny - oy) * (q1pny - oy),
  );

  let q1px, q1py;

  if (q1pd > q1nd) {
    q1px = q1ppx;
    q1py = q1ppy;
  } else {
    q1px = q1pnx;
    q1py = q1pny;
  }

  let theta2 = Math.atan2(p1y - yPos, p1x - xPos) - Math.PI / 2;

  let p2xp = p1x + 2 * dist * Math.cos(theta2);
  let p2yp = p1y + 2 * dist * Math.sin(theta2);
  let p2xn = p1x - 2 * dist * Math.cos(theta2);
  let p2yn = p1y - 2 * dist * Math.sin(theta2);

  const dpp = Math.sqrt((p2xp - ox) * (p2xp - ox) + (p2yp - oy) * (p2yp - oy));
  const dpn = Math.sqrt((p2xn - ox) * (p2xn - ox) + (p2yn - oy) * (p2yn - oy));

  let p2x, p2y;
  if (dpp > dpn) {
    p2x = p2xn;
    p2y = p2yn;
  } else {
    p2x = p2xp;
    p2y = p2yp;
  }

  const n1x = xPos - dist * Math.cos(theta);
  const n1y = yPos - dist * Math.sin(theta);

  const mnx = (xPos + n1x) / 2;
  const mny = (yPos + n1y) / 2;
  thetaP = Math.atan2(n1y - yPos, n1x - xPos) - Math.PI / 2;

  let q1npx = mnx + 2.5 * dist * Math.cos(thetaP);
  let q1npy = mny + 2.5 * dist * Math.sin(thetaP);
  let q1nnx = mnx - 2.5 * dist * Math.cos(thetaP);
  let q1nny = mny - 2.5 * dist * Math.sin(thetaP);

  const q2pd = Math.sqrt(
    (q1npx - ox) * (q1npx - ox) + (q1npy - oy) * (q1npy - oy),
  );
  const q2nd = Math.sqrt(
    (q1nnx - ox) * (q1nnx - ox) + (q1nny - oy) * (q1nny - oy),
  );

  let q1nx, q1ny;

  if (q2pd > q2nd) {
    q1nx = q1npx;
    q1ny = q1npy;
  } else {
    q1nx = q1nnx;
    q1ny = q1nny;
  }

  theta2 = Math.atan2(n1y - yPos, n1x - xPos) - Math.PI / 2;

  let n2xp = n1x + 2 * dist * Math.cos(theta2);
  let n2yp = n1y + 2 * dist * Math.sin(theta2);
  let n2xn = n1x - 2 * dist * Math.cos(theta2);
  let n2yn = n1y - 2 * dist * Math.sin(theta2);

  const dnp = Math.sqrt((n2xp - ox) * (n2xp - ox) + (n2yp - oy) * (n2yp - oy));
  const dnn = Math.sqrt((n2xn - ox) * (n2xn - ox) + (n2yn - oy) * (n2yn - oy));

  let n2x, n2y;
  if (dnp > dnn) {
    n2x = n2xn;
    n2y = n2yn;
  } else {
    n2x = n2xp;
    n2y = n2yp;
  }

  return direction === FoldDir.UP
    ? [
        `M${xPos},${yPos} Q${q1px},${q1py} ${p1x},${p1y} L${p2x},${p2y}`,
        { x: p2x, y: p2y, cx: p1x, cy: p1y },
      ]
    : [
        `M${xPos},${yPos} Q${q1nx},${q1ny} ${n1x},${n1y} L${n2x},${n2y}`,
        { x: n2x, y: n2y, cx: n1x, cy: n1y },
      ];
}
