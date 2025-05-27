// components/LeafletMap.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  Popup,
  useMap,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import axios from "axios";
import L from "leaflet";

const originIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
});

const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [30, 30],
});

type Coords = [number, number];

function FitRoute({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length === 2) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  return null;
}

function ClickHandler({
  points,
  setPoints,
  setCoords,
}: {
  points: Coords[];
  setPoints: React.Dispatch<React.SetStateAction<Coords[]>>;
  setCoords: (coords: [Coords, Coords]) => void;
}) {
  useMapEvents({
    click(e) {
      if (points.length < 2) {
        const newPoints = [...points, [e.latlng.lat, e.latlng.lng]] as Coords[];
        setPoints(newPoints);
        if (newPoints.length === 2) {
          setCoords(newPoints as [Coords, Coords]);
        }
      }
    },
  });
  return null;
}

export default function LeafletMap({
  setDistanceKm,
  setCoords,
  resetTrigger,
}: {
  setDistanceKm: (km: number) => void;
  setCoords: (coords: [Coords, Coords]) => void;
  resetTrigger: boolean;
}) {
  const [points, setPoints] = useState<Coords[]>([]);
  const [route, setRoute] = useState<Coords[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (resetTrigger && typeof window !== "undefined") {
      setPoints([]);
      setRoute([]);
      setDistance(null);
    }
  }, [resetTrigger]);

  useEffect(() => {
    const getRoute = async () => {
      if (points.length !== 2) return;
      try {
        const [start, end] = points;
        const res = await axios.post("http://localhost:8000/get-distance", {
          start,
          end,
        });
        const dist = res.data.distance_km;
        const coordinates = res.data.route_coords;

        const animate = async () => {
          const animatedRoute: Coords[] = [];
          for (let i = 0; i < coordinates.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 5));
            animatedRoute.push(coordinates[i]);
            setRoute([...animatedRoute]);
          }
        };

        setDistance(dist);
        setDistanceKm(dist);
        animate();
      } catch (err) {
        console.error("Route fetch error:", err);
      }
    };

    getRoute();
  }, [points]);

  if (!isClient) return null;

  return (
    <div>
      <MapContainer
        center={[20.3, 85.8]}
        zoom={7}
        style={{ height: "320px", width: "100%" }}
        className="rounded shadow"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler
          points={points}
          setPoints={setPoints}
          setCoords={setCoords}
        />
        {points.length === 2 && <FitRoute bounds={points} />}
        {points.map((pos, idx) => (
          <Marker
            key={idx}
            position={pos}
            icon={idx === 0 ? originIcon : destinationIcon}
          >
            <Popup>{idx === 0 ? "Origin" : "Destination"}</Popup>
          </Marker>
        ))}
        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{ color: "black", weight: 4 }}
          >
            <Tooltip sticky>Distance: {distance?.toFixed(2)} km</Tooltip>
          </Polyline>
        )}
      </MapContainer>

      {distance && (
        <p className="mt-2 font-medium">
          📏 Route Distance: <b>{distance.toFixed(2)} km</b>
        </p>
      )}
    </div>
  );
}
