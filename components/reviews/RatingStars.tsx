export function RatingStars({
  rating,
  size = "text-sm",
}: {
  rating: number;
  size?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <span className={`${size} tracking-tight text-gold`} aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }, (_, i) => (i < rounded ? "★" : "☆")).join("")}
    </span>
  );
}
