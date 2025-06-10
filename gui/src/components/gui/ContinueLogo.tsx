interface NoirAgentLogoProps {
  height?: number;
  width?: number;
}

export default function NoirAgentLogo({
  height = 299,
  width = 987,
}: NoirAgentLogoProps) {
  return (
    <img
      src="/assets/logo.png"
      alt="NoirAgent Logo"
      width={width}
      height={height}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
}
