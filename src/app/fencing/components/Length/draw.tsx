"use client";
import { PrimaryButton, SecondaryButton } from "@/components/Button";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import Searchbar from "@/components/Searchbar";
import { googleMapLibs } from "@/lib/utils";
import { selectCheckout } from "@/redux/app";
import { useAppSelector } from "@/redux/hooks";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { debounce, flatten } from "lodash";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { FaPlus, FaMinus } from "react-icons/fa6";

type Props = {
  setLength: (newLength: number) => void;
  onClose: () => void;
};

export default function DrawFencing({ setLength, onClose }: Props) {
  const checkoutDetails = useAppSelector(selectCheckout);
  const [processing, setProcessing] = React.useState(false);
  const [search, setSearch] = React.useState(checkoutDetails.address);
  const [center, setCenter] = React.useState(() => {
    const [lng, lat] = checkoutDetails.location!.split(",");
    return {
      lng: parseFloat(lng),
      lat: parseFloat(lat),
    };
  });
  const [zoom, setZoom] = React.useState(20);
  const [places, setPlaces] = React.useState<
    Array<{ name: string; address: string; id: string }>
  >([]);
  const [points, setPoints] = React.useState<
    Array<Array<{ lat: number; lng: number }>>
  >([[]]);
  const autocompleteService =
    React.useRef<google.maps.places.AutocompleteService>();
  const mapRef = React.useRef<google.maps.Map>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = React.useCallback(
    debounce((newValue: string) => {
      autocompleteService.current?.getPlacePredictions(
        {
          input: newValue,
          locationBias: "IP_BIAS",
          componentRestrictions: {
            country: "au",
          },
          types: ["address"],
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
  const { isLoaded } = useJsApiLoader({
    libraries: googleMapLibs as any,
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
  });

  function suggestLocations(newSearch: string) {
    setSearch(newSearch);
    if (newSearch.length > 0) {
      debouncedSearch(newSearch);
    }
  }

  React.useEffect(() => {
    if (isLoaded) {
      autocompleteService.current =
        new google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  function onLoad(map: google.maps.Map) {
    mapRef.current = map;
  }

  function onZoomChanged() {
    const zoom = mapRef.current?.getZoom() || 20;
    setZoom(zoom);
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
          setPlaces([]);
          setSearch(address);
          setCenter({
            lng: loc!.lng(),
            lat: loc!.lat(),
          });
          setPoints([[]]);
        }
      },
    );
    setProcessing(false);
  }

  function addPoint(e: google.maps.MapMouseEvent) {
    const latLng = e.latLng;
    if (latLng) {
      const position = { lng: latLng.lng(), lat: latLng.lat() };
      setPoints((curr) => [
        ...curr.slice(0, curr.length - 1),
        [...curr[curr.length - 1], position],
      ]);
    }
  }

  function undo() {
    setPoints((curr) => {
      const last = curr[curr.length - 1];
      if (last.length === 0) {
        if (curr.length === 1) {
          return [[]];
        } else {
          return [
            ...curr.slice(0, curr.length - 2),
            [
              ...curr[curr.length - 2].slice(
                0,
                curr[curr.length - 2].length - 1,
              ),
            ],
          ];
        }
      } else {
        return [
          ...curr.slice(0, curr.length - 1),
          [...curr[curr.length - 1].slice(0, curr[curr.length - 1].length - 1)],
        ];
      }
    });
  }

  function getLength() {
    const totalLength = points.reduce((acc, curr) => {
      let currentLength = 0;
      if (curr.length >= 1) {
        for (let i = 1; i < curr.length; i++) {
          currentLength +=
            window.google.maps.geometry.spherical.computeDistanceBetween(
              curr[i - 1],
              curr[i],
            );
        }
      }
      acc += currentLength;
      return acc;
    }, 0);
    return totalLength.toFixed(1);
  }

  function closeSection(e: google.maps.MapMouseEvent) {
    const latlng = e.latLng;
    if (latlng) {
      const position = { lat: latlng.lat(), lng: latlng.lng() };
      if (points.length > 0) {
        const lastSection = points[points.length - 1];
        // if first point of last section is clicked, we close the section
        if (
          lastSection.length >= 3 &&
          position.lat == lastSection[0].lat &&
          position.lng == lastSection[0].lng
        ) {
          addPoint(e);
        }
      }
    }
  }

  const flattenedPoints = flatten(points);

  return (
    <>
      <div className="fixed top-0 h-screen h-svh left-0 w-screen z-50">
        {isLoaded ? (
          <GoogleMap
            zoom={zoom}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              // zoomControl: true,
              fullscreenControl: false,
              rotateControl: false,
              // zoomControlOptions: {
              //   position: window.google.maps.ControlPosition.LEFT_CENTER,
              // },
              mapTypeId: "satellite",
              keyboardShortcuts: false,
            }}
            mapContainerStyle={{
              height: "100%",
              width: "100%",
            }}
            center={center}
            tilt={0}
            onClick={addPoint}
            onLoad={onLoad}
            onZoomChanged={onZoomChanged}
          >
            {flattenedPoints.map((point) => (
              <Marker
                key={`${point.lng},${point.lat}`}
                position={point}
                options={{
                  icon: {
                    url: `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/Marker.svg`,
                    scaledSize: new window.google.maps.Size(16, 16),
                    anchor: new window.google.maps.Point(8, 8),
                  },
                  cursor: "default",
                }}
                onClick={closeSection}
              />
            ))}
            {points.map((section, index) => (
              <Polyline
                path={section}
                options={{
                  strokeWeight: 7,
                  strokeColor: "#F45830",
                }}
                key={index.toString()}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <Loader size={50} />
          </div>
        )}
        <Link className="absolute left-5 top-5" href="/">
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/Pova Logo.svg`}
            alt="Pova Logo"
            width={76}
            height={25}
            unoptimized
            loading="eager"
          />
        </Link>
        <div className="absolute top-16 left-4 w-[calc(100%-32px)]">
          <Searchbar
            placeholder="Select Address"
            fullWidth
            value={search}
            onChange={suggestLocations}
            autoFocus
          />
          <ul className="absolute left-0 w-full top-[57px] max-h-[250px] overflow-y-auto [&>li:first-child]:pt-2.5 rounded-br-pova-lg rounded-bl-pova-lg">
            {places.map((place) => (
              <li
                key={place.id}
                className="pb-2.5 pt-1.5 cursor-pointer bg-surface pl-8 pr-5 flex gap-4"
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
                  <div className="text-on-surface truncate">
                    {place.address}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-white px-4 py-4.5 flex items-center justify-between">
          <div className="absolute -top-14 [&>input]:px-5">
            <SecondaryButton
              text="Undo"
              onClick={undo}
              disabled={flattenedPoints.length === 0}
            />
          </div>
          <div className="[&>input]:px-8 [&>input]:py-4">
            <SecondaryButton text="Close" smallestRadius onClick={onClose} />
          </div>

          <div>
            <div className="font-semibold text-xs mb-1.5">Total Length</div>
            <div className="text-2xl font-bold text-center">{getLength()}m</div>
          </div>
          <div className="absolute -top-14 right-4 [&>input]:px-5">
            <SecondaryButton
              text="Add Section"
              onClick={() => setPoints((curr) => [...curr, []])}
              disabled={flattenedPoints.length < 2}
            />
          </div>
          <div className="[&>input]:px-8">
            <PrimaryButton
              text="Done"
              shadow={false}
              disabled={flattenedPoints.length < 2}
              onClick={() => setLength(parseFloat(getLength()))}
            />
          </div>
        </div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer">
          <button
            className="block h-[52px] w-[38px] border-b border-b-black bg-surface disabled:opacity-50 rounded-t-3xl"
            onClick={() => setZoom((curr) => curr + 1)}
            disabled={zoom === 21}
          >
            <FaPlus size={22} className="ml-2" />
          </button>
          <button
            className="block h-[52px] w-[38px] bg-surface disabled:opacity-50 rounded-b-3xl"
            onClick={() => setZoom((curr) => curr - 1)}
            disabled={zoom === 0}
          >
            <FaMinus size={22} className="ml-2" />
          </button>
        </div>
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
