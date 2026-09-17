interface OrbsProps {
  variant?: "default" | "hero" | "results"
}

export default function Orbs({ variant = "default" }: OrbsProps) {
  if (variant === "hero") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="orb-blue"
          style={{
            width: 600,
            height: 600,
            top: -200,
            right: -100,
            opacity: 0.6,
          }}
        />
        <div
          className="orb-purple"
          style={{
            width: 500,
            height: 500,
            bottom: -100,
            left: -100,
            opacity: 0.5,
          }}
        />
        <div
          className="orb-cyan"
          style={{
            width: 300,
            height: 300,
            top: "30%",
            left: "40%",
            opacity: 0.4,
          }}
        />
      </div>
    )
  }
  if (variant === "results") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="orb-purple"
          style={{
            width: 700,
            height: 700,
            top: -300,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.4,
          }}
        />
        <div
          className="orb-cyan"
          style={{
            width: 400,
            height: 400,
            bottom: -100,
            right: -100,
            opacity: 0.3,
          }}
        />
      </div>
    )
  }
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="orb-blue"
        style={{ width: 400, height: 400, top: -100, right: 0, opacity: 0.3 }}
      />
      <div
        className="orb-purple"
        style={{ width: 300, height: 300, bottom: 0, left: -50, opacity: 0.2 }}
      />
    </div>
  )
}
