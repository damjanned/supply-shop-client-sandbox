import React from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setTutorial } from "@/redux/flashings";
import Modal from "@/components/Modal";
import { SecondaryButton } from "@/components/Button";
import { FaChevronRight } from "react-icons/fa6";
import Link from "next/link";

type Props = {
  show: boolean;
};

export default function Help({ show }: Props) {
  const [step, setStep] = React.useState(1);
  const stepsData = [
    {
      title: "Draw",
      description: (
        <ol className="text-sm font-semibold list-decimal list-inside">
          <li>Click/Tap to draw a point</li>
          <li>Draw 2nd point to draw a line</li>
          <li>Add 3rd point to draw an angle</li>
        </ol>
      ),
      link: "https://pova-nsw.s3.ap-southeast-2.amazonaws.com/Step-1.mp4",
    },
    {
      title: "Adjust",
      description: (
        <ol
          className="text-sm font-semibold list-decimal list-inside"
          start={4}
        >
          <li>Drag node to change position</li>
          <li>Adjust side & angle values</li>
          <li>Undo & Delete</li>
        </ol>
      ),
      link: "https://pova-nsw.s3.ap-southeast-2.amazonaws.com/Step-2.mp4",
    },
    {
      title: "Adjust",
      description: (
        <ol
          className="text-sm font-semibold list-decimal list-inside"
          start={7}
        >
          <li>
            Click the &quot;Colour Side&quot; icon to switch the painted side
          </li>
        </ol>
      ),
      link: "https://pova-nsw.s3.ap-southeast-2.amazonaws.com/Step-3.mp4",
    },
  ];
  const dispatch = useAppDispatch();

  function moveToNext() {
    setStep((curr) => {
      if (curr < 3) {
        return curr + 1;
      } else {
        dispatch(setTutorial(true));
        return 1;
      }
    });
  }

  return (
    <Modal visible={show} overlay contentClassName="rounded-pova-lg !p-0">
      <div className="px-2.5 py-4">
        <div className="flex justify-between mb-4">
          <div className="font-bold text-pova-heading leading-[50px]">
            {stepsData[step - 1].title}
          </div>
          <Link href="/help" className="text-xs font-medium">
            Help?
          </Link>
        </div>
        <div>{stepsData[step - 1].description}</div>
        <div className="w-full h-[350px] max-w-[350px] mx-auto mt-4">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full"
            key={step}
          >
            <source type="video/mp4" src={stepsData[step - 1].link} />
          </video>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <SecondaryButton
            text="Skip Tutorial"
            onClick={() => {
              dispatch(setTutorial(true));
            }}
          />
          <div className="flex gap-x-2.5 items-center">
            <span className="font-semibold inline-block my-auto">{step}/3</span>
            <div
              className="bg-primary rounded-full w-12 h-12 flex items-center justify-center text-2xl cursor-pointer text-on-primary"
              onClick={moveToNext}
            >
              <FaChevronRight />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
