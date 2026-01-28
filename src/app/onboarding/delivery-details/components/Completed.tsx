import { FaCheckCircle } from "react-icons/fa";

export default function Completed() {
  return (
    <div className="h-[calc(100vh-61px)] !h-[calc(100dvh-61px)] w-screen fixed top-[61px] left-0 flex justify-center items-center px-5 bg-white">
      <div>
        <div className="mb-5 md:mb-16 text-[120px] md:text-[150px] flex justify-center">
          <FaCheckCircle />
        </div>
        <div className="font-medium text-lg text-center">
          Thank you for submitting details, your response has been recorded
        </div>
      </div>
    </div>
  );
}
