export default function QuestionCard({ question, selected, onSelect }) {
  return (
    <div style={{ flex: 1 }}>
      <h3>{question.question}</h3>

      {question.options.map((opt, i) => (
        <div key={i}>
          <input
            type="radio"
            checked={selected === i}
            onChange={() => onSelect(i)}
          />
          {opt}
        </div>
      ))}
    </div>
  );
}
