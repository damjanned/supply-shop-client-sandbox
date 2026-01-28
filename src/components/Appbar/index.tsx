"use client";
import Image from "next/image";
import { HiMinus } from "react-icons/hi";
import React from "react";
import Link from "next/link";
import Menu from "./menu";
import { useAppSelector } from "@/redux/hooks";
import { selectCart, selectCheckout } from "@/redux/app";
import Cart from "../Icons/Cart";
import Search from "../Icons/Search";
import Location from "../Icons/Location";
import { selectFlashingCart } from "@/redux/flashings";
import MenuIcon from "../Icons/MenuIcon";

type Props = {
  children: React.ReactNode;
};

export default function Appbar({ children }: Props) {
  const cart = useAppSelector(selectCart);
  const flashingsCart = useAppSelector(selectFlashingCart);
  const [isOpen, setIsOpen] = React.useState(false);
  const checkout = useAppSelector(selectCheckout);

  const totalItems = cart.length + flashingsCart.length;

  function handleMenuToggle() {
    setIsOpen((curr) => !curr);
  }

  return (
    <div className="relative w-full">
      <nav
        className={`flex justify-between items-center h-[61px] px-5  top-0 left-0 right-0  z-50 text-2xl fixed bg-primary text-on-primary shadow-pova-sm`}
        aria-label="App wide navigation"
      >
        <Link href="/">
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/Pova Logo.svg`}
            alt="POVA Logo"
            onClick={() => setIsOpen(false)}
            width={76}
            height={25}
            unoptimized
            loading="eager"
          />
        </Link>
        <div className="flex gap-x-6 items-center">
          {!isOpen && (
            <>
              <Link href="/search" aria-label="Search over 20000+ products">
                <Search />
              </Link>
              {checkout.location && (
                <Link href="/location/update" aria-label="Update your location">
                  <Location />
                </Link>
              )}
              <Link className="relative" href="/checkout" aria-label="Checkout">
                <Cart className="cursor-pointer" />
                {totalItems > 0 && (
                  <span
                    className={`absolute text-xs -top-[2px] left-[6px] font-semibold text-primary`}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
            </>
          )}
          {isOpen ? (
            <HiMinus className="cursor-pointer" onClick={handleMenuToggle} />
          ) : (
            <MenuIcon className="cursor-pointer" onClick={handleMenuToggle} />
          )}
        </div>
      </nav>
      {/* <div className="h-px bg-transparent relative top-[60px]" ref={ghostRef} /> */}
      <main className="pt-[60px]">
        {isOpen ? <Menu closeMenu={handleMenuToggle} /> : children}
      </main>
    </div>
  );
}
