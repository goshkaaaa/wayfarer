import "./globals.css";
export const metadata = {
  title: "Wayfarer — A little room for adventure",
  description:
    "A quiet place to plan your next trip. Build a day-by-day itinerary and keep your budget in view.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
