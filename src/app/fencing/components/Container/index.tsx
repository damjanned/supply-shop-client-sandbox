import React from "react";
import useQuery from "@/hooks/useQuery";
import {
  FenceType,
  FencingDetailResponse,
  GateDetailResponse,
  GateType,
} from "@/types/fencing";
import { terrainOptions } from "../utils";
import useLazyQuery from "@/hooks/useLazyQuery";
import { useAppSelector } from "@/redux/hooks";
import { selectCheckout } from "@/redux/app";
import Builder from "./builder";
import Items from "./items";

export type Fence = {
  totalFenceLength?: number | string;
  fenceType?: string;
  extension?: string;
  colour?: string;
  terrain?: string;
  gates: Array<{
    type?: string;
    accKitType?: "standard" | "economic" | "premium";
    size?: "standard" | "xwide";
    extension?: string;
    edgeCoverStrip?: boolean;
    height?: number;
    sheetHeight?: number;
    colour?: string;
    id: string;
  }>;
  panelWidth?: number;
  panelHeight?: number | "";
  postStiffners?: boolean;
  runEnds?: number | "";
  corners?: number | "";
  runEndsConfig: "square" | "standard";
  cornersConfig: "square" | "standard";
  footingDepth?: number | "";
  groundClearance?: number | "";
};

export default function Container() {
  const [showItems, setShowItems] = React.useState(false);
  const [fence, setFence] = React.useState<Fence>({
    terrain: terrainOptions[1].id,
    gates: [],
    runEndsConfig: "square",
    cornersConfig: "square",
    groundClearance: 50,
    totalFenceLength: "",
  });
  const [gateDetails, setGateDetails] = React.useState<{
    [key: string]: GateDetailResponse;
  }>({});
  const fenceColourRef = React.useRef<string>("");
  const checkoutDetails = useAppSelector(selectCheckout);
  const {
    data: fenceData,
    loading,
    error,
  } = useQuery<{
    data: {
      fenceTypes: {
        fence_types: Array<FenceType>;
        gate_types: Array<GateType>;
      };
      colours: Array<{ _id: string; Colour_Name: string; Colour_Code: string }>;
    };
  }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fencing/types`);
  const [
    fetcher,
    { loading: detailsLoading, error: detailsError, data: detailsData },
  ] = useLazyQuery<{ data: FencingDetailResponse }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/fencing/get?location=${checkoutDetails.location}&colour=${fence.colour}`,
  );

  const colourIdToColour = fenceData?.data.colours.reduce(
    (acc, curr) => {
      acc[curr._id] = curr;
      return acc;
    },
    {} as {
      [key: string]: { _id: string; Colour_Name: string; Colour_Code: string };
    },
  );
  const formattedData = colourIdToColour
    ? {
        data: {
          fence_types: fenceData!.data.fenceTypes.fence_types.map(
            ({ colours, extensions, ...rest }) => ({
              ...rest,
              colours: colours.map((id) => colourIdToColour[id]),
              extensions: extensions.map((ext) => ({
                ...ext,
                colours: ext.colours?.map((id) => colourIdToColour[id]),
              })),
            }),
          ),
          gate_types: fenceData!.data.fenceTypes.gate_types.map(
            ({ colours, extensions, ...rest }) => ({
              ...rest,
              colours: colours.map((id) => colourIdToColour[id]),
              extensions: extensions.map((ext) => ({
                ...ext,
                colours: ext.colours?.map((id) => colourIdToColour[id]),
              })),
            }),
          ),
        },
      }
    : undefined;

  return (
    <div className="-mx-5 h-[calc(100vh-61px)] !h-[calc(100svh-61px)]">
      {showItems ? (
        <Items
          fence={fence}
          data={detailsData!.data}
          setShowItems={setShowItems}
          gateDetails={gateDetails}
        />
      ) : (
        <Builder
          loading={loading}
          detailsLoading={detailsLoading}
          detailsError={detailsError}
          detailsData={detailsData}
          fenceData={formattedData}
          error={error}
          setFence={setFence}
          fetcher={fetcher}
          fence={fence}
          setShowItems={setShowItems}
          fenceColourRef={fenceColourRef}
          gateDetails={gateDetails}
          setGateDetails={setGateDetails}
        />
      )}
    </div>
  );
}
