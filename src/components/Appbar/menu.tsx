import Link from "next/link";
import { BsInstagram, BsLinkedin } from "react-icons/bs";
import { FaSquareFacebook } from "react-icons/fa6";
import { PrimaryButton, SecondaryButton } from "../Button";

type Props = {
  closeMenu: () => void;
};

export default function Menu({ closeMenu }: Props) {
  return (
    <div className="bg-white fixed left-0 top-[60px] z-50 w-full h-[calc(100vh-60px)] !h-[calc(100svh-60px)] overflow-y-auto max-md:no-scrollbar flex flex-col">
      <div className="px-5 pt-4 max-w-screen-lg w-full mx-auto grow">
        <div>
          <div className="font-bold text-pova-heading leading-relaxed">
            Pova Help
          </div>
          <a href="tel:0242179996" className="block mt-4" target="_blank">
            <PrimaryButton text="Phone Assistance" fullWidth />
          </a>
          <a
            href="mailto:help@pova.com.au"
            className="block mt-4"
            target="_blank"
          >
            <SecondaryButton
              text="Send us a message"
              fullWidth
              containerClasses="p-4 !text-base !rounded-pova-lg"
            />
          </a>
        </div>
        <div className="w-screen max-w-screen-lg h-[7px] bg-surface -mx-5 mt-4" />
        <nav aria-label="Site menu">
          <div className="font-bold text-pova-heading leading-relaxed">
            <span onClick={closeMenu}>
              <Link href="/location">Shop</Link>
            </span>
          </div>
          <div className="font-bold text-pova-heading leading-relaxed">
            <span onClick={closeMenu}>
              <Link href="/account">Account</Link>
            </span>
          </div>
          <div className="font-bold text-pova-heading leading-relaxed">
            <span onClick={closeMenu}>
              <Link href="/location?redirect=/shop/supplier">Suppliers</Link>
            </span>
          </div>
        </nav>
      </div>
      <footer className="pb-3 border-t-surface border-solid border-[1px] px-5 lg:flex lg:justify-center bg-on-primary">
        <div className="w-full max-w-screen-lg lg:pl-5">
          <div className="flex gap-x-10 pt-6 text-2xl">
            <a
              href="https://www.facebook.com/profile.php?id=61560083588848"
              aria-label="connect with Pova on Facebook"
            >
              <FaSquareFacebook />
            </a>
            <a
              href="https://www.instagram.com/pova.au/"
              aria-label="connect with Pova on Instagram"
            >
              <BsInstagram />
            </a>
            <a
              href="https://www.linkedin.com/company/pova-au/"
              aria-label="connect with Pova on LinkedIn"
            >
              <BsLinkedin />
            </a>
          </div>
          <div className="[&>div]:pb-2 mt-9 font-medium text-sm">
            <div>
              <span onClick={closeMenu}>
                <Link href="/about">About Us</Link>
              </span>
            </div>
            <div>
              <span onClick={closeMenu}>
                <Link href="/about#who-is-pova">Who is Pova?</Link>
              </span>
            </div>
            <div>
              <span onClick={closeMenu}>
                <Link href="/about#products-and-services">
                  Products & Services
                </Link>
              </span>
            </div>
            <div>
              <span onClick={closeMenu}>
                <Link href="/about#ordering-process">Ordering Process</Link>
              </span>
            </div>
            <div>
              <span onClick={closeMenu}>
                <Link href="/about#why-pova">Why Pova?</Link>
              </span>
            </div>
            <div>
              <a
                href={`${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/Privacy+Policy.pdf`}
                target="_blank"
              >
                Privacy Policy
              </a>
            </div>
            <div>
              <Link href="/terms/trade">Terms & Conditions</Link>
            </div>
          </div>
          <div className="text-xs font-medium mt-2">Australia</div>
          <div className="mt-2 text-xs font-light">
            Copyright &copy; {new Date().getFullYear()} Pova Pty Ltd. All rights
            Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
