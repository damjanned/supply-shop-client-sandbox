type Props = {
  className?: string;
};

export default function Location({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="21"
      viewBox="0 0 15 21"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_3564_343)">
        <path
          d="M7.50365 0C3.80763 0 -0.363357 2.9484 0.0252436 7.9548C0.413845 12.9696 7.50365 21 7.50365 21C7.50365 21 14.5935 12.9696 14.9821 7.9548C15.362 2.9484 11.1997 0 7.50365 0ZM7.50365 10.0968C6.00106 10.0968 4.79208 8.9124 4.79208 7.4592C4.79208 6.006 6.0097 4.8216 7.50365 4.8216C8.99761 4.8216 10.2152 6.006 10.2152 7.4592C10.2152 8.9124 8.99761 10.0968 7.50365 10.0968Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_3564_343">
          <rect width="15" height="21" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
}
