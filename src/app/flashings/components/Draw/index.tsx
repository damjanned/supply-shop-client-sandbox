import React from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  NodeChange,
  applyNodeChanges,
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "reactflow";
import type { EdgeData, NodeData } from "./types";
import {
  addPointWithPatches,
  clearWithPatches,
  ColourContext,
  ColourDirection as ColourDirEnum,
  DiagramState,
  FoldDir,
  Position,
  updateAngleWithPatches,
  updateColourDirWithPatches,
  updateDragWithPatches,
  updateEdgeLabelWithPatches,
  updateFoldedWithPatches,
  updateTaperedWithPatches,
} from "./utils";
import { edgeTypes, nodeTypes } from "./custom-types";
import "reactflow/dist/style.css";
import Actions from "./actions";
import { toPng } from "html-to-image";
import Girth from "./girth";
import Help from "./help";
import Controll from "@/components/Controls";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectColourDir,
  selectDiagram,
  selectFlashingCart,
  selectTapered,
  selectTutorial,
  setCurrentFlashing,
} from "@/redux/flashings";
import ColourDirection from "./colour-direction";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import NodeActions from "./node-actions";
import { applyPatches, enablePatches, Patch, setAutoFreeze } from "immer";

enablePatches();
setAutoFreeze(false);

type Props = {
  setStep: (step: number) => void;
};

export default function Draw({ setStep }: Props) {
  const flashingCart = useAppSelector(selectFlashingCart);
  const diagram = useAppSelector(selectDiagram);
  const colourDirection = useAppSelector(selectColourDir);
  const taperedValue = useAppSelector(selectTapered);
  const dispatch = useAppDispatch();
  const tutorial = useAppSelector(selectTutorial);
  const [diagramState, setDiagramState] = React.useState<DiagramState>({
    nodes: [],
    edges: [],
    colourDir:
      colourDirection !== undefined ? colourDirection : ColourDirEnum.OUTSIDE,
    tapered: !!taperedValue,
    foldedNodes: [],
  });
  const [inversePatches, setInversePatches] = React.useState<Array<Patch[]>>(
    [],
  );
  const [foldableNode, setFoldableNode] = React.useState<
    Node<NodeData> | undefined
  >();
  const draggedNodeDetails = React.useRef<{ id: string; position: Position }>();

  const { screenToFlowPosition, getNode, getNodes, toObject, setViewport } =
    useReactFlow();
  const query = useSearchParams();

  const count = parseInt(query.get("editNo") || `${flashingCart.length}`) + 1;

  const addPoint = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      function onEdgeUpdate(id: string, label: string, taperedLabel: boolean) {
        setDiagramState(({ edges: curr, ...rest }) => {
          const newEdges: Array<Edge<EdgeData>> = [];
          curr.forEach((edge) => {
            if (edge.id !== id) {
              newEdges.push(edge);
            } else {
              newEdges.push({
                ...edge,
                label: taperedLabel ? edge.label : label,
                data: { ...(edge.data as any), taperedLabel: label },
              });
            }
          });
          return { ...rest, edges: newEdges };
        });
      }
      function onAngleUpdate(id: string, prevAngle: number, angle: number) {
        setDiagramState((curr) => {
          const [newState, _, inversePatches] = updateAngleWithPatches(
            curr,
            id,
            prevAngle,
            angle,
          );
          setInversePatches((curr) => [...curr, inversePatches]);
          return newState;
        });
      }
      function recordEdgeUpdate(
        id: string,
        tapered: boolean,
        oldLabel: string,
        newLabel: string,
      ) {
        if (oldLabel !== newLabel) {
          setDiagramState((curr) => {
            const tempState: DiagramState = JSON.parse(JSON.stringify(curr));
            const edge = tempState.edges.find((e) => e.id === id);
            if (edge) {
              if (tapered) {
                edge.data!.taperedLabel = oldLabel;
              } else {
                edge.label = oldLabel;
              }
            }
            const [_, __, inversePatches] = updateEdgeLabelWithPatches(
              tempState,
              id,
              tapered,
              newLabel,
            );
            setInversePatches((inverseCurr) => [
              ...inverseCurr,
              inversePatches,
            ]);
            return curr;
          });
        }
      }
      const addFirst = foldableNode && foldableNode.id === "1";
      setFoldableNode(undefined);
      setDiagramState((curr) => {
        const [newState, _, inversePatches] = addPointWithPatches(
          curr,
          e,
          !!addFirst,
          onEdgeUpdate,
          onAngleUpdate,
          screenToFlowPosition,
          recordEdgeUpdate,
        );
        setInversePatches((curr) => [...curr, inversePatches]);
        return newState;
      });
    },
    [foldableNode, screenToFlowPosition],
  );

  const onNodesChange = React.useCallback(
    function (changes: NodeChange[]) {
      setDiagramState((curr) => {
        const currNodes = curr.nodes;
        let updated = applyNodeChanges(changes, currNodes) as Node<
          NodeData,
          "point"
        >[];
        const nodes: { [key: string]: boolean } = {};
        changes
          .filter((chg) => chg.type === "position" && chg.dragging)
          .forEach((chng: any) => {
            const node = getNode(chng.id) as Node<NodeData, "point">;
            nodes[chng.id] = true;
            node.data.edges.forEach((edge) => {
              if (edge.n1 !== chng.id) {
                nodes[edge.n1] = true;
              } else {
                nodes[edge.n2] = true;
              }
            });
          });
        updated = updated.map((nd) => {
          if (nodes[nd.id]) {
            nd.data = {
              ...nd.data,
            };
          }
          return nd;
        });
        return { ...curr, nodes: updated };
      });
    },
    [getNode],
  );

  const selectionChange = React.useCallback(
    ({ nodes }: { nodes: Node<NodeData>[] }) => {
      if (
        document.activeElement &&
        document.activeElement.tagName === "INPUT"
      ) {
        const input = document.activeElement as HTMLInputElement;
        if (!!input.id) {
          input.blur();
        }
      }
      if (nodes.length > 0) {
        setFoldableNode(nodes[0]);
      } else {
        setFoldableNode(undefined);
      }
    },
    [],
  );

  const onDragChange = React.useCallback((_: any, node: Node) => {
    if (!draggedNodeDetails.current) {
      draggedNodeDetails.current = {
        id: node.id,
        position: node.position,
      };
    } else {
      setDiagramState((curr) => {
        const stateClone: DiagramState = JSON.parse(JSON.stringify(curr));
        const cloneNode = stateClone.nodes.find(
          (n) => n.id === draggedNodeDetails.current!.id,
        );
        cloneNode!.position = draggedNodeDetails.current!.position;
        const [_, __, inversePatches] = updateDragWithPatches(
          stateClone,
          draggedNodeDetails.current!.id,
          node.position,
        );
        setInversePatches((currPatches) => [...currPatches, inversePatches]);
        draggedNodeDetails.current = undefined;
        return curr;
      });
    }
  }, []);

  async function exportToPng() {
    const nodesBound = getNodesBounds(getNodes());
    let padding = 40;
    if (diagramState.foldedNodes.length > 0) {
      padding += 30;
    }
    const width =
      nodesBound.width + (diagramState.tapered ? 142 : 0) + 2 * padding;
    const height =
      nodesBound.height + (diagramState.tapered ? 174 : 0) + 2 * padding;
    const transform = getViewportForBounds(
      {
        width,
        height,
        x: nodesBound.x - padding,
        y: nodesBound.y - padding - (diagramState.tapered ? 174 : 0),
      },
      width,
      height,
      0.25,
      2,
      0,
    );
    const elements = document.querySelectorAll(".shadow-pova-sm");
    elements.forEach((element) => {
      element.classList.replace("shadow-pova-sm", "drop-shadow-pova-flashing");
    });
    const dataUri = await toPng(
      document.querySelector(".react-flow__viewport") as HTMLElement,
      {
        width: width,
        height: height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
        backgroundColor: "white",
      },
    );
    elements.forEach((element) => {
      element.classList.replace("drop-shadow-pova-flashing", "shadow-pova-sm");
    });
    return dataUri;
  }

  function downloadImage() {
    exportToPng().then((dataUrl) => {
      const a = document.createElement("a");
      a.setAttribute("download", "flashing.png");
      a.setAttribute("href", dataUrl);
      a.click();
    });
  }

  async function moveToNext() {
    if (
      diagramState.edges.length === 0 ||
      diagramState.edges.some((edge) => isNaN(parseInt(edge.label as string)))
    ) {
      alert("Please specify length(mm) of all sides");
      return;
    }
    const totalGirth = diagramState.edges.reduce((acc, curr) => {
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
    }, 0);
    // flat sheet
    if (diagramState.edges.length === 1) {
      if (totalGirth > 800) {
        alert("Total girth of flat sheet cannot be more than 800mm");
        return;
      }
    } else if (totalGirth > 1200) {
      alert("Total girth cannot be more than 1200mm");
      return;
    }
    const dataUri = await exportToPng();
    const diagram = JSON.stringify(toObject());
    dispatch(
      setCurrentFlashing({
        diagram,
        image: dataUri,
        colourDir: diagramState.colourDir,
        tapered: diagramState.tapered,
      }),
    );
    setStep(2);
  }

  function taperedChange(newTapered: boolean) {
    setDiagramState((curr) => {
      const [newState, _, inversePatches] = updateTaperedWithPatches(
        curr,
        newTapered,
      );
      setInversePatches((curr) => [...curr, inversePatches]);
      return newState;
    });
  }

  function colourDirChange(newDir: ColourDirEnum) {
    setDiagramState((curr) => {
      const [newState, _, inversePatches] = updateColourDirWithPatches(
        curr,
        newDir,
      );
      setInversePatches((curr) => [...curr, inversePatches]);
      return newState;
    });
  }

  function foldNode(id: string, dir: FoldDir) {
    setDiagramState((curr) => {
      const [newState, _, inversePatches] = updateFoldedWithPatches(
        curr,
        id,
        true,
        dir,
      );
      setInversePatches((curr) => [...curr, inversePatches]);
      return newState;
    });
  }

  function unfoldNode(id: string) {
    setDiagramState((curr) => {
      const [newState, _, inversePatches] = updateFoldedWithPatches(
        curr,
        id,
        false,
        FoldDir.UP,
      );
      setInversePatches((curr) => [...curr, inversePatches]);
      return newState;
    });
  }

  React.useEffect(() => {
    function onEdgeUpdate(id: string, label: string, taperedLabel: boolean) {
      setDiagramState(({ edges: curr, ...rest }) => {
        const newEdges: Array<Edge<EdgeData>> = [];
        curr.forEach((edge) => {
          if (edge.id !== id) {
            newEdges.push(edge);
          } else {
            newEdges.push({
              ...edge,
              label: taperedLabel ? edge.label : label,
              data: { ...(edge.data as any), taperedLabel: label },
            });
          }
        });
        return { ...rest, edges: newEdges };
      });
    }

    function onAngleUpdate(id: string, prevAngle: number, angle: number) {
      setDiagramState((curr) => {
        const [newState, _, inversePatches] = updateAngleWithPatches(
          curr,
          id,
          prevAngle,
          angle,
        );
        setInversePatches((curr) => [...curr, inversePatches]);
        return newState;
      });
    }
    function recordEdgeUpdate(
      id: string,
      tapered: boolean,
      oldLabel: string,
      newLabel: string,
    ) {
      if (oldLabel !== newLabel) {
        setDiagramState((curr) => {
          const tempState: DiagramState = JSON.parse(JSON.stringify(curr));
          const edge = tempState.edges.find((e) => e.id === id);
          if (edge) {
            if (tapered) {
              edge.data!.taperedLabel = oldLabel;
            } else {
              edge.label = oldLabel;
            }
          }
          const [_, __, inversePatches] = updateEdgeLabelWithPatches(
            tempState,
            id,
            tapered,
            newLabel,
          );
          setInversePatches((inverseCurr) => [...inverseCurr, inversePatches]);
          return curr;
        });
      }
    }

    if (diagram) {
      const flow = JSON.parse(diagram);
      setDiagramState((curr) => ({
        ...curr,
        nodes: flow.nodes.map((node: Node<NodeData>) => ({
          ...node,
          data: { ...node.data, onAngleUpdate },
        })),
        edges: flow.edges.map((edge: Edge<EdgeData>) => ({
          ...edge,
          data: { ...edge.data, onEdgeUpdate, recordEdgeUpdate },
        })),
        foldedNodes: flow.nodes.reduce(
          (acc: string[], curr: Node<NodeData>) => {
            if (curr.data.folded) {
              acc.push(curr.id);
            }
            return acc;
          },
          [],
        ),
      }));
      const bounds = getNodesBounds(flow.nodes);
      const width = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
      );
      const xTranslate = (width - bounds.width - bounds.x) / 2;
      setViewport({ x: xTranslate, y: 0, zoom: 1 });
    }
  }, [diagram, setViewport]);

  return (
    <ColourContext.Provider value={diagramState.colourDir}>
      <div className="absolute top-0 z-50 w-screen h-screen !h-svh bg-white">
        <ReactFlow
          nodes={diagramState.nodes}
          edges={diagramState.edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          panOnScroll
          selectionOnDrag
          onPaneClick={addPoint}
          edgeTypes={edgeTypes}
          proOptions={{
            hideAttribution: true,
          }}
          onSelectionChange={selectionChange}
          selectNodesOnDrag={false}
          onNodeDragStart={onDragChange}
          onNodeDragStop={onDragChange}
        >
          <Background variant={BackgroundVariant.Lines} color="#EEEEEE" />
          <Actions
            onRemove={() => {
              setInversePatches((curr) => {
                const lastChange = curr[curr.length - 1];
                if (lastChange) {
                  setDiagramState((curr) => {
                    const newState = applyPatches(curr, lastChange);
                    // to re-render nodes and update any angles that change
                    newState.nodes.forEach((curr) => {
                      curr.data = { ...curr.data };
                    });
                    return newState;
                  });
                  return curr.slice(0, curr.length - 1);
                }
                return [];
              });
            }}
            onClear={() => {
              setDiagramState((curr) => {
                const [newState, _, inversePatches] = clearWithPatches(curr);
                setInversePatches((curr) => [...curr, inversePatches]);
                return newState;
              });
              setFoldableNode(undefined);
            }}
            onDownload={downloadImage}
            flashingNum={count}
            nodesCount={diagramState.nodes.length}
            setTapered={taperedChange}
            tapered={diagramState.tapered}
            foldedNodes={diagramState.foldedNodes}
            undoLength={inversePatches.length}
          />
          <Girth edges={diagramState.edges} nodes={diagramState.nodes} />

          <ColourDirection
            setDirection={colourDirChange}
            edgesCount={diagramState.edges.length}
          />
        </ReactFlow>
        <Controll
          onClick={moveToNext}
          containerClasses={`!max-w-full ${
            diagramState.edges.length === 0 ||
            diagramState.edges.some((edge) =>
              isNaN(parseInt(edge.label as string)),
            )
              ? "[&>div]:bg-surface-disabled"
              : ""
          }`}
        />
        <Controll containerClasses="!max-w-full" left link="/flashings/cart" />
        <Link className="fixed left-5 top-5" href="/">
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/Pova Logo.svg`}
            alt="Pova Logo"
            className="invert"
            width={76}
            height={25}
            unoptimized
            loading="eager"
          />
        </Link>
        <NodeActions
          foldedNode={foldableNode}
          nodes={diagramState.nodes}
          foldNode={foldNode}
          key={foldableNode?.id}
          unfold={unfoldNode}
        />
        <Help show={!tutorial} />
      </div>
    </ColourContext.Provider>
  );
}
