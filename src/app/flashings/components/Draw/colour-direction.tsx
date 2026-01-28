import { Panel } from "reactflow";
import { ColourDirection as ColourDirEnum } from "./utils";
import { ColourContext } from "./utils";
import React from "react";
import { MdInfoOutline } from "react-icons/md";
import { useAppDispatch } from "@/redux/hooks";
import { setTutorial } from "@/redux/flashings";

type Props = {
  setDirection: (newDir: ColourDirEnum) => void;
  edgesCount: number;
};

export default function ColourDirection({ setDirection, edgesCount }: Props) {
  const direction = React.useContext(ColourContext);
  const dispatch = useAppDispatch();

  return (
    <Panel position="top-right" className="!mt-5 !mr-5">
      <div>
        <div
          className="drop-shadow-pova-flashing bg-white cursor-pointer rounded-pova-lg py-2 px-2.5"
          onClick={() => {
            if (edgesCount > 0) {
              setDirection(Math.abs(direction - 1));
            }
          }}
        >
          <div
            className={`font-bold text-xs mb-1 ${
              edgesCount === 0 ? "text-disabled" : ""
            }`}
          >
            Colour Side
          </div>
          <div className="flex flex-col">
            <ColourSide edgesCount={edgesCount} direction={direction} />
          </div>
          <div
            className={`text-[10px] font-light mt-1 ${
              edgesCount === 0 ? "text-disabled" : ""
            }`}
          >
            Click to switch
          </div>
        </div>
        <div className="mt-4 text-on-surface-variant text-[22px] flex justify-end">
          <MdInfoOutline
            className="cursor-pointer"
            onClick={() => {
              dispatch(setTutorial(false));
            }}
          />
        </div>
      </div>
    </Panel>
  );
}

function ColourSide({
  edgesCount,
  direction,
}: {
  edgesCount: number;
  direction: ColourDirEnum;
}) {
  return (
    <div
      className={`${
        direction === ColourDirEnum.OUTSIDE ? "self-start" : "self-end"
      }`}
    >
      {direction === ColourDirEnum.OUTSIDE ? (
        <svg
          width="36"
          height="40"
          viewBox="0 0 36 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M22.5501 40L22.55 2.62268e-07L25.55 0L25.5501 40L22.5501 40Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "#276EF1"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M32.55 2L32.55 2.62268e-07L35.55 0L35.55 2L32.55 2ZM32.55 10L32.55 6L35.55 6L35.55 10L32.55 10ZM32.5501 18L32.5501 14L35.5501 14L35.5501 18L32.5501 18ZM32.5501 26L32.5501 22L35.5501 22L35.5501 26L32.5501 26ZM32.5501 34L32.5501 30L35.5501 30L35.5501 34L32.5501 34ZM32.5501 40L32.5501 38L35.5501 38L35.5501 40L32.5501 40Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "black"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.95 22L7.94995 14L10.0501 11.8999L18.0501 19.8999L15.95 22Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "#276EF1"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.05 20L10.05 28L7.94994 25.8999L15.9499 17.8999L18.05 20Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "#276EF1"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15 21.4499L0 21.45L-2.62268e-07 18.45L15 18.4499L15 21.4499Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "#276EF1"}
          />
        </svg>
      ) : (
        <svg
          width="37"
          height="40"
          viewBox="0 0 37 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.5 0L13.5 40H10.5L10.5 0H13.5Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "#276EF1"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.5 38V40H0.5L0.5 38H3.5ZM3.5 30V34H0.5L0.5 30H3.5ZM3.5 22V26H0.5L0.5 22H3.5ZM3.5 14L3.5 18H0.5L0.5 14H3.5ZM3.5 6L3.5 10H0.5L0.5 6H3.5ZM3.5 0L3.5 2H0.5L0.5 0H3.5Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "black"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20.1001 18L28.1001 26L26 28.1001L18 20.1001L20.1001 18Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "#276EF1"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18 20L26 12L28.1001 14.1001L20.1001 22.1001L18 20Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "#276EF1"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.05 18.55H36.05V21.55H21.05V18.55Z"
            fill={edgesCount === 0 ? "#d7d7d7" : "#276EF1"}
          />
        </svg>
      )}
    </div>
  );
}
