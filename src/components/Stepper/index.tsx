type Props = {
  step: number;
  onStepClick: (stepNo: number) => void;
  steps: string[];
  disabled?: string[];
};

export default function Stepper({ step, onStepClick, steps, disabled }: Props) {
  return (
    <div className="bg-on-primary flex items-center fixed top-[60px] w-full max-w-screen-lg left-0 lg:left-1/2 lg:-translate-x-1/2 lg z-30">
      {steps.map((currStep, index) => {
        const isDisabled = disabled?.includes(currStep) || false;
        return (
          <div
            className={`grow shrink text-xl leading-[26px] text-on-surface font-bold px-4 pt-[17px] pb-3 text-center border-b-[5px]  cursor-pointer ${
              step === index + 1
                ? "text-primary border-b-primary"
                : "border-b-surface"
            } ${isDisabled ? "opacity-30 !cursor-not-allowed" : ""}`}
            onClick={() => {
              if (!isDisabled) {
                onStepClick(index + 1);
              }
            }}
            key={currStep}
          >
            {currStep}
          </div>
        );
      })}
    </div>
  );
}
