import Searchbar from "../components/Searchbar";
import List from "./components/List";
import type { Supplier } from "@/types/supplier";
import { FaSquareFacebook } from "react-icons/fa6";
import { BsInstagram, BsLinkedin } from "react-icons/bs";
import Link from "next/link";
import { Industry } from "@/types/industry";
import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";
import HomeButton from "./components/Button";
import ShopIcon from "@/components/Icons/Shop";
import FlashingIcon from "@/components/Icons/Flashing";
import FencingIcon from "@/components/Icons/Fencing";
import BusinessCredit from "./components/BusinessCredit";

export const metadata: Metadata = {
  title: {
    absolute: "Pova",
  },
};

async function getData() {
  const [industries, suppliers] = await Promise.all([
    fetch(`${process.env.BASE_URL}/api/industry/getMany`, {
      next: { revalidate: 7200, tags: ["industries"] },
    })
      .then<{ data: Array<Industry> }>((res) => res.json())
      .then(({ data }) => data)
      .catch((err) => {
        console.log(err);
        return undefined;
      }),
    fetch(`${process.env.BASE_URL}/api/supplier/getAll`, {
      next: { revalidate: 7200, tags: ["suppliers"] },
    })
      .then<{ data: Array<Supplier> }>((res) => res.json())
      .then(({ data }) => data)
      .catch((err) => {
        return undefined;
      }),
  ]);
  return { industries, suppliers };
}

export default async function Page() {
  const { industries, suppliers } = await getData();

  return (
    <div className="-mt-[61px]">
      <div className="z-1 absolute top-0 left-0 h-[19.5rem] w-full bg-black lg:h-[35rem] rounded-bl-pova-lg rounded-br-pova-lg" />
      <PageContainer>
        <div className="pt-[61px] z-2 h-[19.5rem] lg:h-[35rem]">
          <div className="text-white font-bold text-pova-heading leading-tight py-4 lg:pt-14 lg:pb-6 lg:text-[80px]">
            Metal Supply, <br />
            Simplified.
          </div>
          <div className="text-white text-lg pb-3.5 lg:text-3xl lg:pb-[6.5rem]">
            <span className="font-semibold">10000+&nbsp;</span>
            <span className="font-medium">products at your fingertips!</span>
          </div>
          <Link href="/search">
            <Searchbar placeholder="Search" fullWidth variant="transparent" />
          </Link>
        </div>
        <div className="mt-4.5">
          <HomeButton
            href="/location"
            text="Shop"
            icon={<ShopIcon />}
            color="primary"
          />
        </div>
        <div className="mt-4">
          <HomeButton
            href="/location?redirect=/flashings/cart"
            text="Flashing Tool"
            icon={<FlashingIcon />}
            color="flashing"
          />
        </div>
        <div className="mt-4">
          <HomeButton
            href="/location?redirect=/fencing"
            text="Fence Estimator"
            icon={<FencingIcon />}
            color="fencing"
          />
        </div>
        {industries && industries.length > 0 && (
          <div className="mt-4">
            <List
              sectionHeading="Browse by industry"
              link="location"
              items={industries.map((industry) => ({
                image: `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${industry.Industry_Image_Square}`,
                link: `/location?redirect=/shop/industry/${
                  industry._id
                }/category?s=${encodeURIComponent(industry.Industry_Name)}`,
                text: industry.Industry_Name,
              }))}
              width="6.25rem"
            />
          </div>
        )}
        {suppliers && suppliers.length > 0 && (
          <div className="mt-4">
            <List
              sectionHeading="Browse by supplier"
              link="location?redirect=/shop/supplier"
              items={suppliers.map((supplier) => ({
                image: `${process.env.NEXT_PUBLIC_IMAGE_PREFIX}/${supplier.Supplier_Image_Square}`,
                text: "",
                link: `/location?redirect=/shop/supplier/${
                  supplier._id
                }?s=${encodeURIComponent(supplier.Supplier_Name)}`,
              }))}
              width="6.25rem"
            />
          </div>
        )}
        <div className="mt-4">
          <BusinessCredit />
        </div>
      </PageContainer>
      <footer className="text-on-primary bg-primary px-5 pb-3 mt-12 lg:flex lg:justify-center">
        <div className="max-w-screen-lg w-full lg:pl-5">
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
              <Link href="/about">About Us</Link>
            </div>
            <div>
              <Link href="/about#who-is-pova">Who is Pova?</Link>
            </div>
            <div>
              <Link href="/about#products-and-services">
                Products & Services
              </Link>
            </div>
            <div>
              <Link href="/about#ordering-process">Ordering Process</Link>
            </div>
            <div>
              <Link href="/about#why-pova">Why Pova?</Link>
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
          <div className="text-on-primary text-xs font-medium mt-2">
            Australia
          </div>
          <div className="mt-2 text-on-prmary text-xs font-light">
            Copyright &copy; {new Date().getFullYear()} Pova Pty Ltd. All rights
            Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
