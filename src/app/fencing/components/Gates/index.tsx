import type {
  FencingDetailResponse,
  GateDetailResponse,
} from "@/types/fencing";
import { Fence } from "../Container";
import {
  gateAccKitOptions,
  gateSizeOptions,
  getColourOptions,
  getGateHeightOptions,
  getItems,
  renderColour,
} from "../utils";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import Dropdown, { DropdownOption } from "@/components/Dropdown";
import Radio from "@/components/Radio";
import { MdClose, MdEdit } from "react-icons/md";
import { FormattedGateType } from "../Container/builder";
import Snackbar from "@/components/Snackbar";
import React from "react";
import { nanoid } from "nanoid";
import { createGetRequest } from "@/lib/network";
import { useAppSelector } from "@/redux/hooks";
import { selectCheckout } from "@/redux/app";
import { getAllItemsPrice } from "@/lib/utils";
import Modal from "@/components/Modal";

type Props = {
  details: FencingDetailResponse;
  setShowItems: React.Dispatch<React.SetStateAction<boolean>>;
  fenceData: Fence;
  setFence: React.Dispatch<React.SetStateAction<Fence>>;
  data: Array<FormattedGateType>;
  gateDetails: {
    [key: string]: GateDetailResponse;
  };
  setGateDetails: React.Dispatch<
    React.SetStateAction<{
      [key: string]: GateDetailResponse;
    }>
  >;
};

type GateProps = Pick<
  Props,
  "data" | "gateDetails" | "setGateDetails" | "setFence" | "fenceData"
> & {
  index: number;
  setEditingGates: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  editingGates: { [key: string]: boolean };
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

function renderItem(item: DropdownOption<null>, selected?: string) {
  return (
    <div
      className={`px-9 py-4 cursor-pointer ${
        item.id !== selected ? "bg-on-primary" : "bg-surface"
      } hover:bg-surface text-sm font-semibold`}
    >
      {item.label}
    </div>
  );
}

export default function Gates({
  details,
  setShowItems,
  fenceData,
  setFence,
  data,
  gateDetails,
  setGateDetails,
}: Props) {
  const [wantGates, setWantGates] = React.useState<boolean | null>(
    fenceData.gates.length > 0 ? true : null,
  );
  const [loading, setLoading] = React.useState(false);
  const [editingGates, setEditingGates] = React.useState<{
    [key: string]: boolean;
  }>({});

  function addGate() {
    setFence((curr) => {
      const id = nanoid();
      setEditingGates((currGates) => ({
        ...currGates,
        [id]: true,
      }));
      return { ...curr, gates: [...curr.gates, { id }] };
    });
  }

  return (
    <div className="mx-auto px-5">
      {fenceData.gates.map(({ id }, index) => (
        <Gate
          key={id}
          data={data}
          gateDetails={gateDetails}
          setGateDetails={setGateDetails}
          fenceData={fenceData}
          setFence={setFence}
          index={index}
          setEditingGates={setEditingGates}
          editingGates={editingGates}
          loading={loading}
          setLoading={setLoading}
        />
      ))}
      <div className="mt-4 text-center">
        <SecondaryButton text="Add Gate" onClick={addGate} disabled={loading} />
      </div>
      {Object.keys(editingGates).length === 0 && (
        <div className="fixed left-0 w-full bottom-0 bg-on-primary shadow-[0_-4px_16px_rgba(0,0,0,0.12)] px-4 py-4 md:left-1/2 md:-translate-x-1/2 max-w-screen-lg z-20">
          <Snackbar
            fullWidth
            message={getAllItemsPrice(
              getItems(details, fenceData, gateDetails),
            )}
            actionText="Check Items"
            onClick={() => setShowItems(true)}
          />
        </div>
      )}
      <Modal
        visible={wantGates === null}
        overlay
        overlayContentFullWidth
        overlayContentPositon="end"
      >
        <div>
          <div className="font-semibold mb-4">
            Would you like to add gates to your fence order?
          </div>
          <PrimaryButton
            text="Yes"
            onClick={() => {
              setWantGates(true);
              addGate();
            }}
            fullWidth
          />
          <div className="mt-4">
            <SecondaryButton
              text="No"
              onClick={() => setShowItems(true)}
              fullWidth
              smallestRadius
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Gate({
  data,
  fenceData,
  index,
  setFence,
  setEditingGates,
  editingGates,
  setGateDetails,
  loading,
  setLoading,
  gateDetails,
}: GateProps) {
  const checkoutDetails = useAppSelector(selectCheckout);
  const gate = fenceData.gates[index];
  const selectedFence = data.find((item) => item.type === gate.type);
  const heightOptions = getGateHeightOptions(
    selectedFence as any,
    !!gate.extension,
    fenceData,
  );
  const colourOptions = getColourOptions(selectedFence, gate.extension);
  const doneDisabled =
    loading ||
    !(gate.colour && gate.sheetHeight && gate.size && gate.accKitType);
  const isEditing = editingGates[gate.id];

  async function handleDone() {
    const colour = gate.colour as string;
    if (gateDetails[colour]) {
      setEditingGates((curr) => {
        const newDetails = { ...curr };
        delete newDetails[gate.id];
        return newDetails;
      });
      return;
    }
    setLoading(true);
    const { data } = await createGetRequest<{ data: GateDetailResponse }>({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/fencing/gates?location=${checkoutDetails.location}&colour=${gate.colour}`,
    });
    if (data) {
      setGateDetails((curr) => ({
        ...curr,
        [gate.colour as string]: data.data,
      }));
      setEditingGates((curr) => {
        const newDetails = { ...curr };
        delete newDetails[gate.id];
        return newDetails;
      });
    } else {
      alert("Error in loading data");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="my-4 flex justify-between items-center">
        <div className="font-bold text-xl">Gate #{index + 1}</div>
        <div className="flex items-center gap-x-2">
          {!isEditing && (
            <MdEdit
              className="size-6 cursor-pointer"
              onClick={() =>
                setEditingGates((curr) => ({
                  ...curr,
                  [gate.id]: true,
                }))
              }
            />
          )}
          <MdClose
            className="text-primary size-6 cursor-pointer"
            onClick={() => {
              setEditingGates((curr) => {
                const newValue = { ...curr };
                delete newValue[gate.id];
                return newValue;
              });
              setFence((curr) => ({
                ...curr,
                gates: [
                  ...curr.gates.slice(0, index),
                  ...curr.gates.slice(index + 1),
                ],
              }));
            }}
          />
        </div>
      </div>
      <div className={`flex flex-col gap-y-4`}>
        <Dropdown<null>
          options={data.map((record) => ({
            id: record.type,
            label: record.type,
          }))}
          value={gate.type || ""}
          onChange={(newType) =>
            setFence((curr) => {
              return {
                ...curr,
                gates: [
                  ...curr.gates.slice(0, index),
                  {
                    ...curr.gates[index],
                    type: newType,
                    height: undefined,
                    sheetHeight: undefined,
                    edgeCoverStrip: undefined,
                    colour: undefined,
                  },
                  ...curr.gates.slice(index + 1),
                ],
              };
            })
          }
          renderItem={(item) => renderItem(item, gate.type)}
          placeholder="Select Sheet Type"
          disabled={!isEditing}
        />
        <Dropdown<null>
          options={gateSizeOptions}
          value={gate.size || ""}
          onChange={(newType) =>
            setFence((curr) => ({
              ...curr,
              gates: [
                ...curr.gates.slice(0, index),
                {
                  ...curr.gates[index],
                  size: newType as "standard" | "xwide",
                },
                ...curr.gates.slice(index + 1),
              ],
            }))
          }
          renderItem={(item) => renderItem(item, gate.size)}
          placeholder="Select Width"
          disabled={!isEditing}
        />
        <Dropdown<null>
          options={
            selectedFence?.extensions.map((ext) => ({
              id: ext.type,
              label: ext.name,
            })) || []
          }
          value={gate.extension || ""}
          onChange={(newType) =>
            setFence((curr) => ({
              ...curr,
              gates: [
                ...curr.gates.slice(0, index),
                {
                  ...curr.gates[index],
                  extension: newType,
                  height: undefined,
                  sheetHeight: undefined,
                  colour: undefined,
                },
                ...curr.gates.slice(index + 1),
              ],
            }))
          }
          renderItem={(item) => renderItem(item, gate.extension)}
          placeholder="Select Extension"
          disabled={!isEditing}
        />
        <Dropdown<null>
          options={heightOptions}
          value={gate.height?.toString() || ""}
          onChange={(newHeight) => {
            const height = parseInt(newHeight);
            const record = heightOptions.find((item) => item.id === newHeight);
            setFence((curr) => ({
              ...curr,
              gates: [
                ...curr.gates.slice(0, index),
                {
                  ...curr.gates[index],
                  height,
                  sheetHeight: record!.sheet,
                },
                ...curr.gates.slice(index + 1),
              ],
            }));
          }}
          renderItem={(item) => renderItem(item, gate.height?.toString())}
          placeholder="Select Height"
          disabled={!isEditing}
        />
        <Dropdown<null>
          options={gateAccKitOptions}
          value={gate.accKitType || ""}
          onChange={(newType) =>
            setFence((curr) => ({
              ...curr,
              gates: [
                ...curr.gates.slice(0, index),
                {
                  ...curr.gates[index],
                  accKitType: newType as "standard" | "economic" | "premium",
                },
                ...curr.gates.slice(index + 1),
              ],
            }))
          }
          renderItem={(item) => renderItem(item, gate.accKitType)}
          placeholder="Select Acc Kit Type"
          disabled={!isEditing}
        />
        {selectedFence && (
          <Dropdown<{ code: string }>
            options={colourOptions}
            value={gate.colour || ""}
            onChange={(newType) =>
              setFence((curr) => ({
                ...curr,
                gates: [
                  ...curr.gates.slice(0, index),
                  {
                    ...curr.gates[index],
                    colour: newType,
                  },
                  ...curr.gates.slice(index + 1),
                ],
              }))
            }
            renderItem={(item) => renderColour(item, gate.colour)}
            placeholder="Select Colour"
            disabled={!isEditing}
          />
        )}
        {selectedFence?.edge_cover && (
          <Radio
            id={`gate-${index}-edge-cover`}
            label={
              <span className="font-medium text-on-surface cursor-pointer">
                Add Edge Cover Strip
              </span>
            }
            checked={gate.edgeCoverStrip || false}
            onChange={(e) => {
              const checked = e.target.checked;
              setFence((curr) => ({
                ...curr,
                gates: [
                  ...curr.gates.slice(0, index),
                  {
                    ...curr.gates[index],
                    edgeCoverStrip: checked,
                  },
                  ...curr.gates.slice(index + 1),
                ],
              }));
            }}
            disabled={!isEditing}
          />
        )}
      </div>
      {isEditing && (
        <div className="py-4 flex justify-end">
          <button
            disabled={doneDisabled}
            onClick={handleDone}
            className="cursor-pointer text-primary font-semibold disabled:opacity-50 p-3"
          >
            Done
          </button>
        </div>
      )}
      {index !== fenceData.gates.length - 1 && (
        <hr className="mt-4 -mx-5 bg-surface h-[3px]" />
      )}
    </div>
  );
}
