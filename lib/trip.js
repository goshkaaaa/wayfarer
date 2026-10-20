export const categories = ["Explore", "Food", "Stay", "Travel"];
export const initialTrip = {
  version: 1,
  destination: "A long weekend in Lisbon",
  budget: 400,
  days: [
    {
      id: "day-1",
      title: "Find your bearings",
      stops: [
        {
          id: "s1",
          name: "Coffee & a pastel de nata",
          place: "Manteigaria · Chiado",
          category: "Food",
          cost: 8,
          time: "09:00",
        },
        {
          id: "s2",
          name: "Get a little lost in Alfama",
          place: "Alfama · Old town",
          category: "Explore",
          cost: 0,
          time: "10:30",
        },
        {
          id: "s3",
          name: "The city from up here",
          place: "Miradouro da Graça",
          category: "Explore",
          cost: 0,
          time: "16:00",
        },
      ],
    },
    {
      id: "day-2",
      title: "Follow the coastline",
      stops: [
        {
          id: "s4",
          name: "A train to the ocean",
          place: "Cais do Sodré → Cascais",
          category: "Travel",
          cost: 10,
          time: "09:30",
        },
        {
          id: "s5",
          name: "Lunch by the water",
          place: "Cascais",
          category: "Food",
          cost: 28,
          time: "13:00",
        },
      ],
    },
    { id: "day-3", title: "One more slow morning", stops: [] },
  ],
};
export function totalCost(days) {
  return days.reduce(
    (sum, day) =>
      sum + day.stops.reduce((subtotal, stop) => subtotal + stop.cost, 0),
    0,
  );
}
export function validateTrip(value) {
  if (
    !value ||
    value.version !== 1 ||
    typeof value.destination !== "string" ||
    !value.destination.trim() ||
    value.destination.length > 100 ||
    !Number.isFinite(value.budget) ||
    value.budget < 0 ||
    value.budget > 1e7 ||
    !Array.isArray(value.days) ||
    value.days.length < 1 ||
    value.days.length > 14
  )
    return false;
  const ids = new Set();
  for (const day of value.days) {
    if (
      typeof day.id !== "string" ||
      ids.has(day.id) ||
      typeof day.title !== "string" ||
      day.title.length > 100 ||
      !Array.isArray(day.stops) ||
      day.stops.length > 100
    )
      return false;
    ids.add(day.id);
    for (const stop of day.stops) {
      if (
        typeof stop.id !== "string" ||
        ids.has(stop.id) ||
        typeof stop.name !== "string" ||
        !stop.name.trim() ||
        stop.name.length > 100 ||
        typeof stop.place !== "string" ||
        stop.place.length > 150 ||
        !categories.includes(stop.category) ||
        !Number.isFinite(stop.cost) ||
        stop.cost < 0 ||
        stop.cost > 1e7 ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(stop.time)
      )
        return false;
      ids.add(stop.id);
    }
  }
  return true;
}
export function itineraryText(trip) {
  return `# ${trip.destination}\n\nBudget: €${trip.budget}\nPlanned: €${totalCost(trip.days)}\n\n${trip.days.map((day, index) => `## Day ${index + 1}: ${day.title}\n\n${day.stops.map((stop) => `- ${stop.time} — ${stop.name} (${stop.place || stop.category}) · €${stop.cost}`).join("\n") || "Leave room for something unexpected."}`).join("\n\n")}`;
}
