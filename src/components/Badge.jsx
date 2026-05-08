/* eslint-disable react-refresh/only-export-components */

export function Badge({ text, type }) {
  const cls = type
    ? `badge badge-${type.toLowerCase().replace(/\s+/g, "-").replace("_", "-")}`
    : "badge";
  return <span className={cls}>{text}</span>;
}

export function statusBadge(status) {
  return <Badge text={status} type={status} />;
}

export function priorityBadge(priority) {
  return <Badge text={priority} type={priority} />;
}

export function moodEmoji(mood) {
  return (
    {
      Excellent: "🚀",
      Good: "😊",
      Okay: "😐",
      Struggling: "😔",
      "Burned Out": "😩",
    }[mood] || "😊"
  );
}
