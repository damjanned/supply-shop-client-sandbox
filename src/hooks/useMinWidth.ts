import React from "react";

export default function useMinWidth(width: number) {
  const [viewport, setViewport] = React.useState(200);
  const [isLarger, setIsLarge] = React.useState(false);

  React.useLayoutEffect(() => {
    function checkIsLarger() {
      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
      );
      setIsLarge(vw >= width);
      setViewport(vw);
    }
    checkIsLarger();
    window.addEventListener("resize", checkIsLarger);

    return () => window.removeEventListener("resize", checkIsLarger);
  }, [width]);

  return { isLarger, viewport };
}
