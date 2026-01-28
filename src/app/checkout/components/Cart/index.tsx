import { PrimaryButton, SecondaryButton } from "@/components/Button";
import Modal from "@/components/Modal";
import Snackbar from "@/components/Snackbar";
import {
  formatPrice,
  getAllFlashingsPriceAndShapes,
  getAllItemsPrice,
} from "@/lib/utils";
import {
  removeFromCart,
  selectCart,
  selectJobRef,
  setJobRef,
  updateCartItemQty,
} from "@/redux/app";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import React from "react";
import { MdArrowLeft } from "react-icons/md";
import Link from "next/link";
import {
  removeFlashingItemFromCart,
  selectFlashingCart,
  setCurrentFlashing,
} from "@/redux/flashings";
import { FlashingsDetailsAccordion as FlashingAccordion } from "@/components/Flashing Accordion";
import { ItemsDetailsAccordion as ItemsAccordion } from "@/components/ItemsAccordion";
import TextInput from "@/components/TextInput";

type Props = {
  onNext: () => void;
};

export default function Cart({ onNext }: Props) {
  const router = useRouter();
  const cart = useAppSelector(selectCart);
  const flashingCart = useAppSelector(selectFlashingCart);
  const jobRef = useAppSelector(selectJobRef);
  const dispatch = useAppDispatch();
  const [selectedDetails, setSelectedDetails] = React.useState<{
    type: "item" | "flashing";
    index: number;
  } | null>(null);

  function updateItemQty(index: number, qty: number) {
    if (qty === 0) {
      dispatch(removeFromCart(index));
    } else {
      dispatch(updateCartItemQty({ index, qty }));
    }
  }

  const itemsPrice = getAllItemsPrice(cart, false) as number;
  const [shapes, fCost] = getAllFlashingsPriceAndShapes(flashingCart, false);

  const expanded = !!(
    (cart.length > 0 ? 1 : 0) ^ (flashingCart.length > 0 ? 1 : 0)
  );

  let selectedItemName = "";
  let selectedItemColour = "";

  if (selectedDetails) {
    switch (selectedDetails.type) {
      case "flashing":
        selectedItemName = `Shape ${selectedDetails.index + 1}`;
        selectedItemColour = flashingCart[selectedDetails.index].colour.name;
        break;
      default:
        selectedItemColour = cart[selectedDetails!.index].colour || "";
        selectedItemName = `${cart[selectedDetails!.index].itemName} ${
          cart[selectedDetails!.index].name
        }`;
    }
  }

  function onEdit() {
    if (selectedDetails!.type === "item") {
      router.push(
        `/products/${cart[selectedDetails!.index]?.product}?edit=${
          selectedDetails!.index
        }`,
      );
    } else {
      dispatch(
        setCurrentFlashing({
          diagram: flashingCart[selectedDetails!.index].diagram,
          image: flashingCart[selectedDetails!.index].image,
          cuttingList: flashingCart[selectedDetails!.index].cuttingList,
          colour: flashingCart[selectedDetails!.index].colour.id,
          category: flashingCart[selectedDetails!.index].category,
          colourDir: flashingCart[selectedDetails!.index].colourDir,
          tapered: flashingCart[selectedDetails!.index].tapered,
        }),
      );
      router.push(
        encodeURI(
          `/flashings?edit=${flashingCart[selectedDetails!.index].id}&editNo=${
            selectedDetails!.index
          }&next=/checkout`,
        ),
      );
    }
    setSelectedDetails(null);
  }

  function onRemove() {
    if (selectedDetails!.type === "item") {
      dispatch(removeFromCart(selectedDetails!.index));
    } else {
      dispatch(
        removeFlashingItemFromCart(flashingCart[selectedDetails!.index].id),
      );
    }
    setSelectedDetails(null);
  }

  return (
    <>
      <div className="pt-3 pb-4 gap-x-4 flex items-start border-b-[5px] -mx-5 px-5 border-b-surface">
        <div className="grow">
          <TextInput
            value={jobRef || ""}
            fullWidth
            placeholder="Label your order"
            onChange={(newValue) => {
              if (newValue.length <= 50) {
                dispatch(setJobRef(newValue));
              }
            }}
            rootClasses="py-2.5"
          />
          <div className="text-xs text-right text-on-surface mt-1 font-medium">
            {(jobRef || "").length}/50 characters
          </div>
        </div>
        <Link
          href="/shop/industry"
          className="flex items-center py-2.5 px-3.5 bg-surface rounded-3xl"
        >
          <MdArrowLeft className="text-2xl" />
          <span className="font-semibold text-base">Shop</span>
        </Link>
      </div>
      <div className="-mx-5 h-[calc(100vh-291px)] !h-[calc(100svh-291px)] overflow-y-auto max-md:no-scrollbar pb-16 pt-4">
        {flashingCart.length > 0 && (
          <div className={!expanded ? "border-b-[3px] border-b-surface" : ""}>
            <FlashingAccordion
              flashings={flashingCart}
              shapesCount={shapes}
              totalPrice={fCost}
              onEdit={(index) =>
                setSelectedDetails({ type: "flashing", index })
              }
              defaultExpanded={expanded}
              header={!expanded}
            />
          </div>
        )}
        {cart.length > 0 && (
          <div className={!expanded ? "border-b-[3px] border-b-surface" : ""}>
            <ItemsAccordion
              cart={cart}
              onQtyUpdate={updateItemQty}
              onEdit={(index) => setSelectedDetails({ type: "item", index })}
              totalPrice={itemsPrice}
              defaultExpanded={expanded}
              header={!expanded}
            />
          </div>
        )}
      </div>
      {(cart.length > 0 || flashingCart.length > 0) && (
        <div className="fixed md:absolute bottom-0 left-0 right-0 md:-left-5 md:-right-5 px-5 h-[87px] bg-white shadow-pova-lg flex items-center">
          <Snackbar
            actionText="To Delivery"
            message={formatPrice(itemsPrice + fCost).slice(1)}
            onClick={onNext}
            fullWidth
          />
        </div>
      )}
      <Modal
        fullWidth
        overlay
        visible={!!selectedDetails}
        overlayContentPositon="end"
        overlayContentFullWidth
        onClose={() => setSelectedDetails(null)}
      >
        <div>
          <div className="font-semibold">{selectedItemName}</div>
          <div className="font-medium text-on-surface mb-4 h-6">
            {selectedItemColour}
          </div>
          <PrimaryButton text="Edit Item" fullWidth onClick={onEdit} />
          <div className="mt-4">
            <SecondaryButton
              text="Remove Item"
              fullWidth
              smallestRadius
              onClick={onRemove}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
