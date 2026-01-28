type Props = {
  children: React.ReactNode;
  noShadow?: boolean;
  className?: string;
};

export default function Content({ children, noShadow, className }: Props) {
  return (
    <div
      className={`w-full bg-white p-4  ${
        noShadow ? "" : "shadow-pova-sm border-2 border-surface"
      } ${className}`}
    >
      {children}
    </div>
  );
}
