"use client";

import { useRef, useState } from "react";
import {
  categories,
  itineraryText,
  totalCost,
  validateTrip,
} from "../lib/trip";
import { useTrip } from "../lib/use-trip";

const money = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Home() {
  const { trip, setTrip, ready, error } = useTrip();
  const [activeDay, setActiveDay] = useState("day-1");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const fileInput = useRef(null);
  const nameInput = useRef(null);
  const day = trip.days.find((item) => item.id === activeDay) || trip.days[0];
  const dayIndex = trip.days.indexOf(day);
  const spent = totalCost(trip.days);

  function updateDay(transform) {
    setTrip((current) => ({
      ...current,
      days: current.days.map((item) =>
        item.id === day.id ? transform(item) : item,
      ),
    }));
  }

  function addStop(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    if (!name || day.stops.length >= 100) return;
    updateDay((current) => ({
      ...current,
      stops: [
        ...current.stops,
        {
          id: crypto.randomUUID(),
          name,
          place: String(form.get("place")).trim(),
          category: String(form.get("category")),
          cost: Number(form.get("cost")),
          time: String(form.get("time")),
        },
      ].sort((a, b) => a.time.localeCompare(b.time)),
    }));
    event.currentTarget.reset();
    nameInput.current.focus();
    setNotice("Stop added to your itinerary.");
  }

  async function importTrip(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1e6) throw new Error();
      const value = JSON.parse(await file.text());
      if (!validateTrip(value)) throw new Error();
      setTrip(value);
      setActiveDay(value.days[0].id);
      setNotice("Trip imported.");
    } catch {
      setNotice(
        "That file is not a valid Wayfarer backup. Your trip is unchanged.",
      );
    }
    event.target.value = "";
  }

  return (
    <>
      <header className="topbar">
        <a href="#main" className="brand">
          <span className="brand-mark">w.</span> wayfarer
          <span className="brand-note">A FIELD GUIDE TO GETTING AWAY</span>
        </a>
        <div className="header-actions">
          <button onClick={() => fileInput.current.click()}>Import trip</button>
          <button
            className="button-dark"
            onClick={() =>
              download(
                "wayfarer-trip.json",
                JSON.stringify(trip, null, 2),
                "application/json",
              )
            }
          >
            Save backup ↗
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          aria-label="Import trip backup"
          accept="application/json,.json"
          onChange={importTrip}
          hidden
        />
      </header>
      <main id="main">
        <section className="hero">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER / PERSONAL TRIP PLANNER</p>
            <h1>
              A little room
              <br />
              for <em>adventure.</em>
            </h1>
            <p className="hero-copy">
              Less open tabs. More open roads.
              <br />
              Put the plan in one place, then go get lost.
            </p>
            <div className="hero-stamp">
              TAKE THE SCENIC ROUTE <span>↗</span>
            </div>
          </div>
          <div className="postcard">
            <div className="postcard-art">
              <div className="sun" />
              <div className="hill back" />
              <div className="hill front" />
              <div className="house h1" />
              <div className="house h2" />
              <div className="house h3" />
              <div className="house h4" />
              <div className="tram">28</div>
              <div className="art-caption">
                LISBOA
                <br />
                <span>38°43′ N 9°08′ W</span>
              </div>
            </div>
            <div className="postcard-footer">
              <span>Somewhere worth slowing down.</span>
              <span>PORTUGAL / 001</span>
            </div>
          </div>
        </section>
        <section className="planner">
          <div className="trip-heading">
            <div>
              <p className="eyebrow">THE ITINERARY</p>
              {editing ? (
                <form
                  className="title-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const value = new FormData(event.currentTarget)
                      .get("destination")
                      .trim();
                    if (value) {
                      setTrip((current) => ({
                        ...current,
                        destination: value,
                      }));
                      setEditing(false);
                    }
                  }}
                >
                  <input
                    aria-label="Trip name"
                    name="destination"
                    defaultValue={trip.destination}
                    maxLength={100}
                    required
                    autoFocus
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <h2>
                  {trip.destination}{" "}
                  <button
                    className="edit"
                    aria-label="Edit trip name"
                    onClick={() => setEditing(true)}
                  >
                    ↗
                  </button>
                </h2>
              )}
            </div>
            <button
              className="text-button"
              onClick={() =>
                download("itinerary.md", itineraryText(trip), "text/markdown")
              }
            >
              Export itinerary ↓
            </button>
          </div>
          <div className="planner-grid">
            <aside className="days">
              <p className="eyebrow">ONE DAY AT A TIME</p>
              {trip.days.map((item, index) => (
                <button
                  key={item.id}
                  className={`day-tab ${item.id === day.id ? "active" : ""}`}
                  onClick={() => setActiveDay(item.id)}
                >
                  <span>0{index + 1}</span>
                  <span>
                    Day {index + 1}
                    <small>{item.stops.length} stops planned</small>
                  </span>
                  <span>↗</span>
                </button>
              ))}
              <button
                className="add-day"
                disabled={trip.days.length >= 14}
                onClick={() => {
                  const id = crypto.randomUUID();
                  setTrip((current) => ({
                    ...current,
                    days: [
                      ...current.days,
                      { id, title: "A new adventure", stops: [] },
                    ],
                  }));
                  setActiveDay(id);
                }}
              >
                + Add a day
              </button>
              <div className="local-note">
                <span>◉</span>
                <p>
                  Your plans stay yours.
                  <br />
                  Saved on this device.
                  <br />
                  Export a backup to keep them.
                </p>
              </div>
            </aside>
            <div className="schedule">
              <div className="schedule-heading">
                <p className="eyebrow">
                  DAY {String(dayIndex + 1).padStart(2, "0")}
                </p>
                <input
                  className="day-title"
                  aria-label="Day title"
                  maxLength={100}
                  value={day.title}
                  onChange={(event) =>
                    updateDay((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </div>
              <ol className="stops">
                {day.stops.map((stop) => (
                  <li key={stop.id}>
                    <time>{stop.time}</time>
                    <span
                      className={`stop-dot ${stop.category.toLowerCase()}`}
                    />
                    <div className="stop-content">
                      <span className="category">{stop.category}</span>
                      <h3>{stop.name}</h3>
                      <p>{stop.place || "The location is up to you"}</p>
                    </div>
                    <span className="stop-cost">
                      {stop.cost ? money.format(stop.cost) : "Free"}
                    </span>
                    <button
                      className="remove"
                      aria-label={`Remove ${stop.name}`}
                      onClick={() =>
                        updateDay((current) => ({
                          ...current,
                          stops: current.stops.filter(
                            (item) => item.id !== stop.id,
                          ),
                        }))
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ol>
              {!day.stops.length ? (
                <p className="empty">
                  An open day is a good beginning.
                  <br />
                  Add your first stop below.
                </p>
              ) : null}
              <form className="stop-form" onSubmit={addStop}>
                <h3>
                  Make a little plan <span>+</span>
                </h3>
                <label>
                  What&apos;s the plan?
                  <input
                    ref={nameInput}
                    name="name"
                    placeholder="A bookshop, a beach, a very good lunch…"
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Where?
                  <input
                    name="place"
                    placeholder="Place or neighborhood"
                    maxLength={150}
                  />
                </label>
                <div className="form-row">
                  <label>
                    Time
                    <input
                      name="time"
                      type="time"
                      defaultValue="12:00"
                      required
                    />
                  </label>
                  <label>
                    Category
                    <select name="category">
                      {categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Cost (€)
                    <input
                      name="cost"
                      type="number"
                      min="0"
                      max="10000000"
                      step="0.01"
                      defaultValue="0"
                      required
                    />
                  </label>
                </div>
                <button
                  className="button-dark"
                  disabled={!ready || day.stops.length >= 100}
                >
                  Add to day {dayIndex + 1} ↗
                </button>
              </form>
              {trip.days.length > 1 && !day.stops.length ? (
                <button
                  className="text-button delete-day"
                  onClick={() =>
                    setTrip((current) => ({
                      ...current,
                      days: current.days.filter((item) => item.id !== day.id),
                    }))
                  }
                >
                  Remove empty day
                </button>
              ) : null}
            </div>
            <aside className="budget">
              <p className="eyebrow">THE TRAVEL FUND</p>
              <h3>
                Good trips.
                <br />
                <em>Small budgets.</em>
              </h3>
              <label>
                Trip budget (€)
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step="0.01"
                  value={trip.budget}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isFinite(value) && value >= 0 && value <= 1e7)
                      setTrip((current) => ({ ...current, budget: value }));
                  }}
                />
              </label>
              <div className="budget-number">{money.format(spent)}</div>
              <p className="muted">planned so far</p>
              <progress
                aria-label="Budget used"
                value={Math.min(spent, trip.budget || 1)}
                max={trip.budget || 1}
              />
              <div className="budget-left">
                {money.format(Math.abs(trip.budget - spent))}{" "}
                {spent > trip.budget ? "over budget" : "left to wander"}
              </div>
              <div className="budget-breakdown">
                {categories.map((category) => (
                  <div key={category}>
                    <span>{category}</span>
                    <span>
                      {money.format(
                        trip.days
                          .flatMap((item) => item.stops)
                          .filter((stop) => stop.category === category)
                          .reduce((sum, stop) => sum + stop.cost, 0),
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <p className="budget-footnote">
                The best part of a trip rarely costs a thing.
              </p>
            </aside>
          </div>
        </section>
        <p className="notice" role="status">
          {error || notice}
        </p>
      </main>
      <footer>
        <span className="brand">wayfarer.</span>
        <span>GO SOMEWHERE. COME BACK DIFFERENT.</span>
        <a href="https://github.com/goshkaaaa/wayfarer">Source ↗</a>
      </footer>
    </>
  );
}
