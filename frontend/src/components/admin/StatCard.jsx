export default function StatCard({ title, value, colorClass = "border-indigo-500" }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 ${colorClass}`}>
      <h4 className="text-gray-500 text-sm font-medium mb-2">
        {title}
      </h4>
      <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
    </div>
  );
}