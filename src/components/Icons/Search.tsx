type Props = {
  className?: string;
};

export default function Search({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className={className}
    >
      <path
        d="M9.95914 17.9183C14.3548 17.9183 17.9183 14.3548 17.9183 9.95914C17.9183 5.56343 14.3548 2 9.95914 2C5.56343 2 2 5.56343 2 9.95914C2 14.3548 5.56343 17.9183 9.95914 17.9183Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeMiterlimit="10"
      />
      <path
        d="M14.9824 14.9819L20.8466 20.8461"
        stroke="currentColor"
        strokeWidth="3"
        strokeMiterlimit="10"
      />
    </svg>
  );
}
