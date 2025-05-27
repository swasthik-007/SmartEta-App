"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

// Dynamically import LeafletMap without SSR
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
});

type Coords = [number, number];

export default function Home() {
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [coords, setCoords] = useState<[Coords, Coords] | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [theme, setTheme] = useState("light");
  const [resetMap, setResetMap] = useState(false);

  const [form, setForm] = useState({
    order_items: "2",
    weather: "sunny",
    traffic: "1",
    rider_queue: "0",
    prep_time_min: "10",
    order_hour: new Date().getHours().toString(),
  });

  // Theme setup

  // Auto-reset resetMap to false
  useEffect(() => {
    if (resetMap) setResetMap(false);
  }, [resetMap]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setCoords(null);
    setDistanceKm(null);
    setResult(null);
    setForm({
      order_items: "2",
      weather: "sunny",
      traffic: "1",
      rider_queue: "0",
      prep_time_min: "10",
      order_hour: new Date().getHours().toString(),
    });
    setResetMap(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords || !distanceKm) return;

    const data = {
      ...form,
      distance_km: distanceKm,
      order_items: parseInt(form.order_items),
      traffic: parseInt(form.traffic),
      rider_queue: parseInt(form.rider_queue),
      prep_time_min: parseInt(form.prep_time_min),
      order_hour: parseInt(form.order_hour),
    };

    try {
      const res = await axios.post(
        "https://smarteta-app-e26i.onrender.com/predict",
        data
      );
      setResult(res.data.predicted_eta);
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <main className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white text-center">
            🚚 Smart ETA
          </h1>
        </div>

        <LeafletMap
          setDistanceKm={setDistanceKm}
          setCoords={setCoords}
          resetTrigger={resetMap}
        />

        {coords && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <p className="font-medium text-lg text-center text-white">
              🏁 Distance: <b>{distanceKm?.toFixed(2)} km</b>
            </p>

            {Object.entries(form).map(([key, val]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  name={key}
                  value={val}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            ))}

            <div className="flex justify-between gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-150"
              >
                Predict ETA
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition duration-150"
              >
                Reset
              </button>
            </div>
          </form>
        )}

        {result !== null && (
          <div className="text-xl font-semibold text-center text-green-600 dark:text-green-400">
            📦 Estimated Delivery Time:{" "}
            <span className="text-black dark:text-white">
              {result.toFixed(2)} minutes
            </span>
          </div>
        )}
      </main>

      <footer className="mt-10 text-sm text-center text-gray-400">
        Made with ❤️ by Swasthik
      </footer>
    </div>
  );
}
