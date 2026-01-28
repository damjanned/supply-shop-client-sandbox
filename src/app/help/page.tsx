"use client";
import PageContainer from "@/components/PageContainer";
import React from "react";
import Accordion from "./accordion";
import { PrimaryButton, SecondaryButton } from "@/components/Button";

const options = [
  {
    title: "Contact",
    description: (
      <div>
        <div className="font-medium text-base">
          For General Enquiries contract us via:
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
    ),
  },
  {
    title: "Pova Flashing Tool",
    description: (
      <div>
        <div className="font-medium">
          Help Page for Pova Custom Flashing Tool:
        </div>
        <p className="text-sm font-light mt-4">
          Here, you&apos;ll find step-by-step instructions and tips to navigate
          through the process of creating and ordering custom-made flashings. If
          you encounter any issues or need further assistance, please refer to
          our <strong className="font-semibold">Contact Page</strong> to reach
          our technical support team
        </p>
        <div className="my-4 text-base font-medium">Getting Started</div>
        <ol className="list-inside list-decimal">
          <li className="text-sm font-medium">
            <span>Choose Your Design Method:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                <strong className="font-bold">
                  Select from Existing Shapes:{" "}
                </strong>
                Choose from our library of popular shapes to customise & modify
                as needed.
              </li>
              <li>
                <strong className="font-bold">Draw from Scratch: </strong>
                Start with a Blank grid to create a unique flashing design.
              </li>
            </ul>
          </li>
          <li className="text-sm font-medium mt-4">
            <span>Entering the Grid:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                <strong className="font-bold">Draw: </strong>
                Begin drawing your custom flashing by clicking and dragging on
                the grid.
              </li>
              <li>
                <strong className="font-bold">Undo: </strong>
                Use this option to revert the last action.
              </li>
              <li>
                <strong className="font-bold">Download: </strong>
                Save your drawing to your device.
              </li>
              <li>
                <strong className="font-bold">Delete: </strong>
                Remove your current drawing and start over.{" "}
              </li>
            </ul>
          </li>
        </ol>
        <div className="my-4 text-base font-medium">
          Customise Your Flashing
        </div>
        <ol className="list-inside list-decimal">
          <li className="text-sm font-medium">
            <span>Determine Length and Angles:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                Adjust the length of each side (A, B, C, D, etc.) and set the
                angle of bends as needed.
              </li>
            </ul>
          </li>
          <li className="text-sm font-medium mt-4">
            <span>Adjust Green Nodes:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                Manually move the green nodes to set the start, end, and bend
                points of your flashing.
              </li>
            </ul>
          </li>
          <li className="text-sm font-medium mt-4">
            <span>Colour Selection:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                Click the <strong className="font-bold">Colour Side</strong>{" "}
                icon on the right to choose which side of the flashing is
                painted (solid blue) or unpainted (dotted black).
              </li>
            </ul>
          </li>
          <li className="text-sm font-medium mt-4">
            <span>Help Icon:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                Click the <strong className="font-bold">Help Icon</strong> below
                the colour side icon to watch our step-by-step video guide,
                which is also available upon entering the grid.
              </li>
            </ul>
          </li>
        </ol>
        <div className="my-4 text-base font-medium">
          Viewing and Managing Flashings
        </div>
        <ol className="list-inside list-decimal">
          <li className="text-sm font-medium">
            <span>Total Girth & Bends:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                Check the bottom left of the grid to see the total girth and
                number of bends in your current drawing
              </li>
            </ul>
          </li>
          <li className="text-sm font-medium mt-4">
            <span>Navigating Flashings:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                Click the top middle of the screen to return to the list of
                shapes or flashings you&apos;ve created.
              </li>
            </ul>
          </li>
        </ol>
        <div className="my-4 text-base font-medium">
          Finalising Your Drawing
        </div>
        <ol className="list-inside list-decimal">
          <li className="text-sm font-medium">
            <span>Review and Adjust:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                Ensure all dimensions and angles are accurate and to your
                satisfaction.
              </li>
            </ul>
          </li>
          <li className="text-sm font-medium mt-4">
            <span>Select Colour Range and Colour:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                After finalising the drawing, choose from a range of colours for
                your flashing
              </li>
            </ul>
          </li>
          <li className="text-sm font-medium mt-4">
            <span>Create a Cutting List:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                Specify the quantity and length (in millimetres) of each piece
                of flashing you need.
              </li>
              <li>View the automatically calculated price for your order.</li>
            </ul>
          </li>
          <li className="text-sm font-medium mt-4">
            <span>Add to Cart:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                Once satisfied with your cutting list, add it to your cart using
                the bottom left arrow continue button
              </li>
            </ul>
          </li>
        </ol>
        <div className="my-4 text-base font-medium">Troubleshooting</div>
        <ol className="list-inside list-decimal">
          <li className="text-sm font-medium">
            <span>Technical Difficulties:</span>
            <ul className="list-disc list-outside mt-4 pl-8 text-sm font-light">
              <li>
                If you experience any technical issues, visit our{" "}
                <strong className="font-bold">Contact Page</strong> . Take a
                screenshot of the problem and get in touch with our{" "}
                <strong className="font-bold">Support</strong> team for
                assistance.
              </li>
              <li>
                <strong className="font-bold">help@pova.com.au</strong>
              </li>
            </ul>
          </li>
        </ol>
      </div>
    ),
  },
];

export default function Help() {
  const [expanded, setExpanded] = React.useState(-1);

  return (
    <PageContainer>
      <div className="text-pova-heading my-4 font-bold">Need Help?</div>
      <div className="text-xl font-bold">
        Pova Customer Service team is here to help you!
      </div>
      <div className="text-xs font-light mt-2.5">
        Hello from Pova!
        <br />
        <br />
        For more information on your related topic please select one from the
        following options.
      </div>
      <div className="mt-4 border-b border-b-surface -mx-5">
        {options.map((option, index) => (
          <Accordion
            title={option.title}
            description={option.description}
            expanded={expanded === index}
            key={option.title}
            onClick={() => setExpanded((curr) => (curr === index ? -1 : index))}
          />
        ))}
      </div>
    </PageContainer>
  );
}
