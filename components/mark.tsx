export function Mark({ size = 28 }: { size?: number }) {
  return (
    <img
      className="brand-mark"
      src="/logo-credprofile.png"
      alt=""
      width={272}
      height={287}
      style={{ height: size, width: "auto" }}
    />
  );
}
