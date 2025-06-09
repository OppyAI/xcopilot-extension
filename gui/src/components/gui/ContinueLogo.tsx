interface ContinueLogoProps {
  height?: number;
  width?: number;
}

export default function ContinueLogo({
  height = 299,
  width = 987,
}: ContinueLogoProps) {
  return (
    <img
      src="/assets/logo.png"
      alt="Continue Logo"
      width={width}
      height={height}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
}
