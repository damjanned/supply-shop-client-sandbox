"use client";
import { PrimaryButton } from "@/components/Button";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import PageContainer from "@/components/PageContainer";
import TextInput from "@/components/TextInput";
import useMutation from "@/hooks/useMutation";
import { googleMapLibs } from "@/lib/utils";
import { GoogleMap, Polygon, useJsApiLoader } from "@react-google-maps/api";
import React from "react";

export default function NoService() {
  const { isLoaded } = useJsApiLoader({
    libraries: googleMapLibs as any,
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
  });
  const [email, setEmail] = React.useState("");
  const [suburb, setSuburb] = React.useState("");
  const [modal, setModal] = React.useState(false);
  const [executor] = useMutation<
    { Subscribe_Email: string; Subscribe_Suburb: string },
    any
  >({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscribe/create`,
  });

  const polygonPath = (process.env.NEXT_PUBLIC_LOCATION_RANGE as string)
    .split("/")
    .map((coord) => {
      const [lng, lat] = coord.split(",");
      return {
        lng: parseFloat(lng),
        lat: parseFloat(lat),
      };
    });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await executor({
      Subscribe_Email: email,
      Subscribe_Suburb: suburb,
    });
    if (error) {
      alert("Something went wrong, please try again");
    } else {
      setModal(true);
    }
  }

  return (
    <PageContainer>
      <div className="font-bold text-pova-heading mt-5">Oops!</div>
      <div className="text-2xl font-bold my-4">
        The address you entered is out of our service area.
      </div>
      <div className="text-sm font-light">
        Please refer to the map below for accurate coverage area.
      </div>
      <div className="my-4 h-[260px] md:h-[360px]">
        {isLoaded ? (
          <GoogleMap
            zoom={7}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              zoomControl: false,
              fullscreenControl: false,
            }}
            mapContainerStyle={{
              height: "100%",
              width: "100%",
            }}
            center={polygonPath[2]}
          >
            <Polygon path={polygonPath} />
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <Loader size={40} />
          </div>
        )}
      </div>
      <div className="text-sm font-light">
        We&apos;re expanding our services across NSW soon! Enter your email and
        desired suburb to be the first to join the No.1 Metal Supply platform.
      </div>
      <form onSubmit={handleSubmit}>
        <TextInput
          value={email}
          onChange={setEmail}
          type="email"
          inputMode="email"
          fullWidth
          required
          rootClasses="mt-4 leading-4"
          placeholder="Email Address"
        />
        <TextInput
          value={suburb}
          onChange={setSuburb}
          fullWidth
          required
          rootClasses="my-4 leading-4"
          placeholder="Suburb"
        />
        <PrimaryButton text="Keep me posted" fullWidth type="submit" />
      </form>
      <Modal
        fullWidth
        overlay
        visible={modal}
        overlayContentPositon="end"
        overlayContentFullWidth
      >
        <div className="px-1">
          <div className="font-semibold">Thank you for subscribing!</div>
          <div className="font-medium text-on-surface">
            We will keep you posted when Pova is available in your suburb.
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
