export default function QuestionPalette({
  total,
  current,
  answers,
  onNavigate,
}) {
  return (
    <div style={{ width: 150, marginLeft: 20 }}>
      <h4>Questions</h4>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            style={{
              width: 35,
              height: 35,
              background:
                i === current
                  ? "#4F46E5"
                  : answers[i] !== undefined
                  ? "#10B981"
                  : "#E5E7EB",
              color: "#000",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
