type LoaderProps = {
  message?: string;
  size?: "sm" | "md";
  minHeight?: string;
};

export function Loader({
  message,
  size = "md",
  minHeight = "200px",
}: LoaderProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        minHeight,
        padding: "48px 24px",
      }}
    >
      <div className={size === "sm" ? "spinner spinner-sm" : "spinner"} />
      {message && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
            textAlign: "center",
            maxWidth: "320px",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export function LoaderOverlay({ message }: { message: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.92)",
        borderRadius: "12px",
      }}
    >
      <Loader message={message} size="sm" minHeight="auto" />
    </div>
  );
}
