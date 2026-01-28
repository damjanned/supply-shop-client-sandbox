"use client";
import PageContainer from "@/components/PageContainer";
import { selectCheckout, setCheckoutDetails } from "@/redux/app";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import Radio from "./components/Radio";
import Searchbar from "@/components/Searchbar";
import { PrimaryButton } from "@/components/Button";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { useJsApiLoader } from "@react-google-maps/api";
import { debounce } from "lodash";
import { createGetRequest } from "@/lib/network";
import { googleMapLibs } from "@/lib/utils";

export default function Location() {
  const checkout = useAppSelector(selectCheckout);
  const router = useRouter();
  const query = useSearchParams();
  const [state, setState] = React.useState<"loading" | "processing" | "idle">(
    "loading",
  );
  const [warehousePickup, setWarehousePickup] = React.useState(false);
  const [automatic, setAutomatic] = React.useState(false);
  const [hideAutomatic, setHideAutomatic] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState("");
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
    libraries: googleMapLibs as any,
  });
  const [search, setSearch] = React.useState("");
  const [places, setPlaces] = React.useState<
    Array<{ name: string; address: string; id: string }>
  >([]);
  const [address, setAddress] = React.useState("");
  const autocompleteService =
    React.useRef<google.maps.places.AutocompleteService>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = React.useCallback(
    debounce((newValue: string, types?: Array<string>) => {
      autocompleteService.current?.getPlacePredictions(
        {
          input: newValue,
          locationBias: "IP_BIAS",
          types,
          componentRestrictions: {
            country: "au",
          },
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

  React.useEffect(() => {
    if (isLoaded) {
      autocompleteService.current =
        new google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  React.useEffect(() => {
    if (checkout.location) {
      const redirect = query.get("redirect");
      router.replace(redirect || "/shop/industry");
    } else {
      setState("idle");
    }
  }, [checkout.location, router, query]);

  function pickUserLocation(checked: boolean) {
    setAutomatic(checked);
    if (checked) {
      setState("processing");
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const latLng = `${coords.longitude},${coords.latitude}`;
          const { error } = await createGetRequest<any>({
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getManyItems?limit=1&location=${latLng}`,
            noHeaders: true,
          });
          if (error && error.status === 450) {
            router.replace("/no-service");
            return;
          }
          const { data } = await createGetRequest<{
            results: Array<{ formatted_address: string }>;
          }>({
            url: `${
              process.env.NEXT_PUBLIC_REVERSE_GEO
            }?latlng=${`${coords.latitude},${coords.longitude}`}&key=${
              process.env.NEXT_PUBLIC_MAPS_KEY
            }`,
            noHeaders: true,
          });
          if (data && data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            setAddress(address);
            setSearch(address);
          }
          setSelectedLocation(latLng);
          setState("idle");
        },
        (error) => {
          setState("idle");
          setHideAutomatic(true);
          if (error.PERMISSION_DENIED) {
            alert(
              "Location access not allowed. Please choose the suburb manually",
            );
          } else if (error.POSITION_UNAVAILABLE) {
            alert("Cannot fetch location. Please choose the suburb manually");
          }
        },
      );
    }
  }

  function suggestLocations(newValue: string) {
    setSearch(newValue);
    setAutomatic(false);
    setSelectedLocation("");
    if (newValue.length > 0) {
      debouncedSearch(newValue, ["address"]);
    }
  }

  function fetchCoords(id: string, address: string) {
    setState("processing");

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
            alert(
              "Cannot process suburb. Please try automatic location detection",
            );
          }
          const latLng = `${loc!.lng()},${loc!.lat()}`;
          const { error } = await createGetRequest<any>({
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/item/getManyItems?limit=1&location=${latLng}`,
            noHeaders: true,
          });
          if (error && error.status === 450) {
            router.replace("/no-service");
            return;
          }
          setSelectedLocation(latLng);
          setAddress(address);
          setPlaces([]);
          setSearch(address);
        }
        setState("idle");
      },
    );
  }

  return (
    <>
      <title>Pova | Location</title>
      <PageContainer>
        {state === "loading" || !isLoaded ? (
          <div className="w-full h-[calc(100vh-61px)] !h-[calc(100svh-61px)] flex justify-center items-center">
            <Loader size={100} />
          </div>
        ) : (
          <div className="pt-4">
            <div className="text-pova-heading font-bold">Site Location</div>
            <div className="mt-4 text-2xl font-bold">
              In Pova we value your experience
            </div>
            <p className="mb-5 text-sm font-light mt-4">
              Based on your site location, our wide range of products offering
              slightly differs in different stores across our platform.
            </p>
            <p className="mb-5 text-sm font-light">
              For most accurate pricing and product availability please enter
              your site address below.
            </p>
            <p className="text-sm font-light">
              We highly recommend you choosing the address which best suits your
              <span className="font-medium"> Delivery/Pick-up</span> preference.
            </p>
            {/* <div className="my-4 font-bold text-xl">Choose your preference</div>
            <Tabs
              headers={["Pick-Up", "Delivery"]}
              value={checkout.type}
              onChange={(type) =>
                dispatch(setCheckoutType(type as "Pick-Up" | "Delivery"))
              }
              rounded={false}
              inactive={warehousePickup ? ["Delivery"] : undefined}
            />
            <div
              className={`mt-7 py-4 border-y-surface border-y-[3px] flex gap-4 items-center px-5 font-medium ${
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
                  setSelectedLocation(value ? "150.894630,-34.401230" : "");
                  setAddress(
                    value ? "6/56 Montague St, North Wollongong, NSW" : "",
                  );
                  dispatch(setCheckoutType("Pick-Up"));
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
            {!warehousePickup && (
              <>
                {!hideAutomatic && (
                  <div className="mt-6">
                    <Radio
                      label="Determine My Address"
                      checked={automatic}
                      onChange={pickUserLocation}
                    />
                  </div>
                )}
                <div className="mt-4 pb-24">
                  <Searchbar
                    placeholder="Select Address Manually"
                    fullWidth
                    value={search}
                    onChange={suggestLocations}
                  />
                  <ul className="mt-4 -mx-5 max-h-[250px] overflow-y-auto">
                    {places.map((place) => (
                      <li
                        key={place.id}
                        className="pb-2.5 cursor-pointer even:bg-surface pl-[4.75rem] pr-5"
                        onClick={() =>
                          fetchCoords(
                            place.id,
                            `${place.name}, ${place.address}`,
                          )
                        }
                      >
                        <div className="font-semibold">{place.name}</div>
                        <div className="text-on-surface truncate">
                          {place.address}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {selectedLocation && (
              <div className="fixed px-5 py-4 bottom-0 left-0 w-full max-w-screen-lg lg:left-1/2 lg:-translate-x-1/2 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] bg-white">
                <PrimaryButton
                  onClick={() => {
                    dispatch(
                      setCheckoutDetails({
                        location: selectedLocation,
                        address,
                      }),
                    );
                    router.replace(query.get("redirect") || "/shop/industry");
                  }}
                  text="Start Shopping"
                  fullWidth
                />
              </div>
            )}
          </div>
        )}
        <Modal visible={state === "processing"} fullWidth overlay>
          <div className="flex items-center justify-between">
            <div>Processing</div>
            <Loader size={30} />
          </div>
        </Modal>
      </PageContainer>
    </>
  );
}
