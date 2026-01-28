type Props = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: Props) {
  return (
    <div className="md:flex md:justify-center">
      <div className="w-full max-w-screen-lg px-5 relative">{children}</div>
    </div>
  );
}
