"use client";
import { AppState } from "@/redux/app";
import React from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import Searchbar from "../Searchbar";
import { debounce } from "lodash";
import { useAppDispatch } from "@/redux/hooks";
import { setCheckoutDetails as updateCheckoutDetails } from "@/redux/app";
import {
  FlashingOrderCart,
  FlashingOrderCartResponse,
  OrderCart,
  OrderCartResponse,
} from "@/types/order-cart";
import useMutation from "@/hooks/useMutation";
import { useRouter } from "next/navigation";
import {
  compareCarts,
  comparedFlashingCarts,
  googleMapLibs,
} from "@/lib/utils";
import Loader from "../Loader";
import Modal from "../Modal";
import { createGetRequest } from "@/lib/network";
import { FlashingState } from "@/redux/flashings";

type Props = {
  checkoutDetails: Omit<AppState["checkout"], "date">;
  cart: AppState["cart"];
  setCheckoutDetails: React.Dispatch<
    React.SetStateAction<Omit<AppState["checkout"], "date">>
  >;
  setStage: React.Dispatch<React.SetStateAction<number>>;
  backOnSuccess?: boolean;
  setNewCart: React.Dispatch<
    React.SetStateAction<Array<AppState["cart"][0] | undefined>>
  >;
  bottomPadding?: boolean;
  flashingCart: FlashingState["cart"];
  setNewFlashingCart: React.Dispatch<
    React.SetStateAction<Array<FlashingState["cart"][0] | undefined>>
  >;
  onlySearchbar?: boolean;
};

export default function UpdateLocation({
  checkoutDetails,
  cart,
  setCheckoutDetails,
  setStage,
  backOnSuccess = true,
  setNewCart,
  bottomPadding,
  flashingCart,
  setNewFlashingCart,
  onlySearchbar,
}: Props) {
  const [processing, setProcessing] = React.useState(false);
  // const [warehousePickup, setWarehousePickup] = React.useState(
  //   checkoutDetails.location === "150.894630,-34.401230",
  // );
  const [search, setSearch] = React.useState(checkoutDetails.address);
  const [places, setPlaces] = React.useState<
    Array<{ name: string; address: string; id: string }>
  >([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
    libraries: googleMapLibs as any,
  });
  const autocompleteService =
    React.useRef<google.maps.places.AutocompleteService>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = React.useCallback(
    debounce((newValue: string, types?: string[]) => {
      autocompleteService.current?.getPlacePredictions(
        {
          input: newValue,
          locationBias: "IP_BIAS",
          componentRestrictions: {
            country: "au",
          },
          types,
        },
        (predictions, status) => {
          if (
            status != google.maps.places.PlacesServiceStatus.OK ||
            !predictions
          ) {
            return;
          }
          setPlaces(
            predictions.map((prediction) => ({
              id: prediction.place_id,
              name: prediction.structured_formatting.main_text.toUpperCase(),
              address: prediction.structured_formatting.secondary_text,
            })),
          );
        },
      );
    }, 200),
    [],
  );
  const dispatch = useAppDispatch();
  const [executor] = useMutation<
    {
      items: OrderCart;
      location: string;
      // delivery: boolean;
      flashings: FlashingOrderCart;
    },
    { data: { items: OrderCartResponse; flashings: FlashingOrderCartResponse } }
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/verifyCartItems`,
  });
  const router = useRouter();

  function suggestLocations(newValue: string) {
    setSearch(newValue);
    if (newValue.length > 0) {
      debouncedSearch(newValue, ["address"]);
    }
  }

  React.useEffect(() => {
    if (isLoaded) {
      autocompleteService.current =
        new google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  // React.useEffect(() => {
  //   setWarehousePickup(checkoutDetails.location === "150.894630,-34.401230");
  // }, [checkoutDetails.location]);

  async function fetchNewCart(
    location: string,
    newCheckoutDetails: {
      address: string;
      location: string;
      // type: "Pick-Up" | "Delivery";
    },
  ) {
    if (cart.length === 0 && flashingCart.length === 0) {
      setProcessing(false);
      dispatch(
        updateCheckoutDetails({
          location: newCheckoutDetails.location as string,
          address: newCheckoutDetails.address as string,
        }),
      );
      // dispatch(setCheckoutType(newCheckoutDetails.type));
      if (backOnSuccess) {
        router.back();
      }
    } else {
      const { data, error } = await executor({
        location,
        items: cart.map((item) => {
          if (item.type === "standard") {
            return {
              variant: item.variant,
              item: item.product,
              qty: item.qty,
            };
          } else {
            return {
              variant: item.variant,
              item: item.product,
              cuttingList: item.cuttingList,
            };
          }
        }),
        // delivery: false,
        flashings: flashingCart.map((flashing) => ({
          bends: flashing.bends,
          girth: flashing.girth,
          id: flashing.id,
          flashingVariant: flashing.colour.id,
          tapered: flashing.tapered,
          cuttingList: flashing.cuttingList.map((record) => ({
            size: record.size,
            qty: record.qty,
          })),
        })),
      });
      if (error) {
        setProcessing(false);
        alert("Could not update location, please try again");
        setCheckoutDetails(checkoutDetails);
        // if (newCheckoutDetails.location === "150.894630,-34.401230") {
        //   setWarehousePickup(false);
        // }
      } else {
        const items = data!.data.items;
        const flashings = data!.data.flashings;
        const [isSameCart, newCart] = compareCarts(cart, items);
        const [isFlashingsSame, newFlashingCart] = comparedFlashingCarts(
          flashingCart,
          flashings,
        );
        if (isSameCart && isFlashingsSame) {
          setProcessing(false);
          dispatch(
            updateCheckoutDetails({
              location: newCheckoutDetails.location as string,
              address: newCheckoutDetails.address as string,
            }),
          );
          // dispatch(setCheckoutType(newCheckoutDetails.type));
          setSearch(newCheckoutDetails.address as string);
          setPlaces([]);
          if (backOnSuccess) {
            router.back();
          }
        } else {
          setNewCart(newCart);
          setNewFlashingCart(newFlashingCart);
          setStage(2);
        }
      }
    }
  }

  function fetchCoords(id: string, address: string) {
    setProcessing(true);

    const service = new google.maps.places.PlacesService(
      document.createElement("div"),
    );
    service.getDetails(
      {
        placeId: id,
      },
      async (result, status) => {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          alert("Something went wrong, please select suburb again");
        } else {
          const loc = result?.geometry?.location;
          if (!loc) {
            alert("Cannot process address. Please try a nearby location");
          }
          const location = `${loc!.lng()},${loc!.lat()}`;
          const { error } = await createGetRequest<any>({
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getManyItems?limit=1&location=${location}`,
            noHeaders: true,
          });
          if (error && error.status === 450) {
            router.replace("/no-service");
            return;
          }
          setCheckoutDetails((curr) => ({
            ...curr,
            location,
            address,
          }));
          setPlaces([]);
          setSearch(address);
          fetchNewCart(location, {
            location,
            address,
            // type: checkoutDetails.type,
          });
        }
      },
    );
  }

  return (
    <>
      {onlySearchbar ? (
        <div className="text-pova-heading font-bold">Delivery Option</div>
      ) : (
        <>
          <div className="text-pova-heading font-bold mt-5">Site Location</div>
          <div className="font-bold my-4 text-2xl">
            Your current shopping location
          </div>
          {/* <Tabs
            headers={["Pick-Up", "Delivery"]}
            value={checkoutDetails.type}
            onChange={(newType) => {
              setCheckoutDetails((curr) => ({ ...curr, type: newType as any }));
              dispatch(setCheckoutType(newType as any));
            }}
            rounded={false}
            inactive={warehousePickup ? ["Delivery"] : undefined}
          />
          <div
            className={`mt-7  py-4 border-y-surface border-y-[3px] flex gap-4 items-center font-medium ${
              warehousePickup ? "text-primary" : "text-on-surface"
            }`}
          >
            <input
              type="checkbox"
              id="location-warehouse"
              name="user_location"
              checked={warehousePickup}
              onChange={(e) => {
                const value = e.target.checked;
                setWarehousePickup(value);
                const location = "150.894630,-34.401230";
                const address = "6/56 Montague St, North Wollongong, NSW";
                if (value) {
                  setProcessing(true);
                  setCheckoutDetails(() => ({
                    type: "Pick-Up",
                    location,
                    address,
                  }));
                  fetchNewCart(location, {
                    type: "Pick-Up",
                    location,
                    address,
                  });
                }
              }}
              className="appearance-none m-0 w-6 h-6 bg-transparent grid place-content-center
                border-[3px] border-on-surface-variant border-solid before:w-3 before:h-3 before:bg-primary before:scale-0
                before:checked:scale-100 before:transition-transform checked:border-primary"
            />
            <label htmlFor="location-warehouse">
              Pick up from Pova Warehouse <br />
              (Free of charge)
            </label>
          </div> */}
        </>
      )}
      <div className={`mt-4 ${bottomPadding ? "pb-8" : ""}`}>
        <Searchbar
          placeholder="Select Address Manually"
          fullWidth
          value={search}
          onChange={suggestLocations}
          onFocus={(e) => {
            const element = e.currentTarget;
            element.scrollIntoView();
          }}
        />
        <ul className="mt-4 -mx-5 max-h-[280px] overflow-y-auto">
          {places.map((place) => (
            <li
              key={place.id}
              className="pb-2.5 pt-1.5 cursor-pointer even:bg-surface pl-8 pr-5 flex gap-4"
              onClick={() =>
                fetchCoords(place.id, `${place.name}, ${place.address}`)
              }
            >
              <div
                className="w-6 h-6 rounded-full bg-transparent grid place-content-center
        border-2 border-primary border-solid before:w-3 before:h-3 before:rounded-full before:bg-primary"
              />
              <div className="w-3/4">
                <div className="font-semibold">{place.name}</div>
                <div className="text-on-surface truncate">{place.address}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal visible={processing} fullWidth overlay>
        <div className="flex items-center justify-between">
          <div>Processing</div>
          <Loader size={30} />
        </div>
      </Modal>
    </>
  );
}
