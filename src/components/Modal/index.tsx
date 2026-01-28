import React from "react";
import Overlay from "./overlay";
import Content from "./content";

type Props = {
  children: React.ReactNode;
  visible: boolean;
  fullWidth?: boolean;
  overlay?: boolean;
  overlayContentPositon?: "center" | "start" | "end";
  overlayContentFullWidth?: boolean;
  onClose?: () => void;
  contentClassName?: string;
};

export default function Modal({
  children,
  visible,
  fullWidth,
  overlay,
  overlayContentPositon = "center",
  overlayContentFullWidth = false,
  onClose,
  contentClassName,
}: Props) {
  function containerClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (
      (e.target === e.currentTarget ||
        (e.target as any).parentNode === e.currentTarget) &&
      onClose
    ) {
      onClose();
    }
  }

  return (
    <div
      className={`${
        visible ? "visible" : "hidden"
      } transition-all duration-200 z-[60] fixed 
      ${fullWidth ? "w-[calc(100%-32px)] max-w-screen-lg" : ""}
      ${
        overlay
          ? "left-0 top-0 w-screen !max-w-none"
          : "left-1/2 bottom-1/2 -translate-x-2/4 -translate-y-2/4"
      }`}
      onClick={containerClick}
    >
      {overlay ? (
        <Overlay
          contentPosition={overlayContentPositon}
          contentFullWidth={overlayContentFullWidth}
        >
          <Content noShadow className={contentClassName}>
            {children}
          </Content>
        </Overlay>
      ) : (
        <Content className={contentClassName}>{children}</Content>
      )}
    </div>
  );
}
