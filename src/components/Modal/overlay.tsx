type Props = {
  children: React.ReactNode;
  contentPosition: "center" | "start" | "end";
  contentFullWidth?: boolean;
};

export default function Overlay({
  children,
  contentPosition,
  contentFullWidth = false,
}: Props) {
  const positionMap = {
    center: "items-center",
    start: "items-start",
    end: "items-end",
  };
  return (
    <div
      className={`w-full h-screen !h-[100dvh] flex justify-center ${positionMap[contentPosition]} bg-black/50`}
    >
      <div className={`w-full ${!contentFullWidth ? "px-4" : ""}`}>
        {children}
      </div>
    </div>
  );
}
