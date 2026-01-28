import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
} from "reactflow";
import React from "react";
import { EdgeData } from "./types";
import { ColourContext, ColourDirection } from "./utils";

export default function DoubleEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  data,
}: EdgeProps<EdgeData>) {
  const direction = React.useContext(ColourContext);
  const valueRef = React.useRef<string>();
  const taperedValueRef = React.useRef<string>();
  const [e1, e2] = getEdgeEnds({
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
  });
  const [e1t, e2t] = getEdgeEnds({
    x1: sourceX + 150,
    y1: sourceY - 150,
    x2: targetX + 150,
    y2: targetY - 150,
  });

  const [p1] = getStraightPath(e1.outer ? e1 : e2);
  const [p2] = getStraightPath(e1.outer ? e2 : e1);
  const [_, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [p1t] = getStraightPath(e1t.outer ? e1t : e2t);
  const [p2t] = getStraightPath(e1t.outer ? e2t : e1t);
  const [__, labelXT, labelYT] = getStraightPath({
    sourceX: sourceX + 150,
    sourceY: sourceY - 150,
    targetX: targetX + 150,
    targetY: targetY - 150,
  });

  function onInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    tapered: boolean,
  ) {
    const value = parseInt(e.target.value);
    if (isNaN(value) && e.target.value !== "") {
      return;
    } else if (!isNaN(value)) {
      data!.onEdgeUpdate(id, value.toString(), tapered);
    } else {
      data!.onEdgeUpdate(id, "", tapered);
    }
  }

  function onInputFocus(tapered: boolean) {
    if (tapered) {
      taperedValueRef.current = data?.taperedLabel as string;
    } else {
      valueRef.current = label as string;
    }
    data?.onEdgeUpdate(id, "", tapered);
  }

  function onInputBlur(
    e: React.FocusEvent<HTMLInputElement>,
    tapered: boolean,
  ) {
    const value = e.target.value;
    if (value === "") {
      data?.onEdgeUpdate(
        id,
        tapered
          ? (taperedValueRef.current as string)
          : (valueRef.current as string),
        tapered,
      );
    } else {
      data?.recordEdgeUpdate(
        id,
        tapered,
        tapered
          ? (taperedValueRef.current as string)
          : (valueRef.current as string),
        value,
      );
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={p1}
        style={{
          stroke: direction === ColourDirection.OUTSIDE ? "#276cF1" : "black",
          strokeDasharray:
            direction === ColourDirection.OUTSIDE ? undefined : "5,5",
          strokeWidth: direction === ColourDirection.OUTSIDE ? 3 : 2,
        }}
      />
      <BaseEdge
        id={id}
        path={p2}
        style={{
          stroke: direction === ColourDirection.INSIDE ? "#276cF1" : "black",
          strokeDasharray:
            direction === ColourDirection.INSIDE ? undefined : "5,5",
          strokeWidth: direction === ColourDirection.INSIDE ? 3 : 2,
        }}
      />
      {data?.tapered && (
        <>
          <BaseEdge
            id={id}
            path={p1t}
            style={{
              stroke:
                direction === ColourDirection.OUTSIDE ? "#276cF1" : "black",
              strokeDasharray:
                direction === ColourDirection.OUTSIDE ? undefined : "5,5",
              strokeWidth: direction === ColourDirection.OUTSIDE ? 3 : 2,
            }}
          />
          <BaseEdge
            id={id}
            path={p2t}
            style={{
              stroke:
                direction === ColourDirection.INSIDE ? "#276cF1" : "black",
              strokeDasharray:
                direction === ColourDirection.INSIDE ? undefined : "5,5",
              strokeWidth: direction === ColourDirection.INSIDE ? 3 : 2,
            }}
          />
        </>
      )}
      <EdgeLabelRenderer>
        <div
          className="absolute bg-white z-10 nopan pointer-all shadow-pova-sm rounded-[5px]"
          style={{
            transform: `translate(-50%,-50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <input
            inputMode="numeric"
            value={label as string}
            onChange={(e) => onInputChange(e, false)}
            placeholder={valueRef.current || "100"}
            className="w-6 outline-none focus:outline-none text-xs text-center text-on-surface-variant font-semibold"
            onFocus={() => onInputFocus(false)}
            onBlur={(e) => onInputBlur(e, false)}
          />
        </div>
      </EdgeLabelRenderer>
      {data?.tapered && (
        <EdgeLabelRenderer>
          <div
            className="absolute bg-white z-10 nopan pointer-all shadow-pova-sm rounded-[5px]"
            style={{
              transform: `translate(-50%,-50%) translate(${labelXT}px, ${labelYT}px)`,
            }}
          >
            <input
              inputMode="numeric"
              value={data!.taperedLabel as string}
              onChange={(e) => onInputChange(e, true)}
              placeholder={taperedValueRef.current || "100"}
              className="w-6 outline-none focus:outline-none text-xs text-center text-on-surface-variant font-semibold"
              onFocus={() => onInputFocus(true)}
              onBlur={(e) => onInputBlur(e, true)}
            />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

function getEdgeEnds({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const slope = -(y2 - y1) / (x2 - x1);
  const pSlope = -1 / slope;
  const [p1, p2] = pointAtDist(pSlope, 3, { x: x1, y: -y1 });
  const [p3, p4] = pointAtDist(pSlope, 3, { x: x2, y: -y2 });
  const plus = { sourceX: p1.x, sourceY: -p1.y, targetX: p3.x, targetY: -p3.y };
  const minus = {
    sourceX: p2.x,
    sourceY: -p2.y,
    targetX: p4.x,
    targetY: -p4.y,
  };
  let outer = "plus";
  if (slope === 0 && x2 > x1) {
    outer = "minus";
  } else if (!isFinite(slope) && y2 > y1) {
    outer = "minus";
  } else if ((x2 < x1 && y2 > y1) || (x2 > x1 && y2 > y1)) {
    outer = "minus";
  }
  return [
    { ...plus, outer: outer === "plus" },
    { ...minus, outer: outer === "minus" },
  ];
}

function pointAtDist(
  slope: number,
  dist: number,
  { x, y }: { x: number; y: number },
) {
  if (slope === 0) {
    return [
      { x: x + dist, y },
      { x: x - dist, y },
    ];
  } else if (!isFinite(slope)) {
    return [
      { x, y: y + dist },
      { x, y: y - dist },
    ];
  } else {
    const dx = dist / Math.sqrt(1 + slope * slope);
    const dy = slope * dx;
    return [
      { x: x + dx, y: y + dy },
      { x: x - dx, y: y - dy },
    ];
  }
}
