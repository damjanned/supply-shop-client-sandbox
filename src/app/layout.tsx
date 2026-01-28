import ReduxProvider from "@/components/ReduxProvider";
import Appbar from "../components/Appbar";
import "./global.css";
import localFont from "next/font/local";
import { Viewport } from "next";

type Props = {
  children: React.ReactNode;
};

export const metadata = {
  title: {
    template: "Pova | %s",
    default: "Pova",
  },
  other: {
    "theme-color": "#000000",
    "msapplication-navbutton-color": "#000000",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const povaFont = localFont({
  src: [
    {
      path: "./fonts/Sharp Sans Light.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Sharp Sans Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Sharp Sans Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/SharpSansBold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pova",
});

export default function Layout({ children }: Props) {
  return (
    <html lang="en" className={`${povaFont.variable} max-md:no-scrollbar`}>
      <body className="font-pova">
        <ReduxProvider>
          <Appbar>{children}</Appbar>
        </ReduxProvider>
      </body>
    </html>
  );
}
