"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";

const T = {
  paper: "#FBF8F1",
  ivory: "#F6F1E6",
  ivoryDeep: "#EEE6D4",
  line: "#E4DAC4",
  ink: "#33302A",
  inkSoft: "#6B6355",
  inkFaint: "#9A9284",
  sage: "#7C8863",
  sageDeep: "#54603F",
  sageLight: "#CBD3B7",
  gold: "#B79A5D",
};

function relativeTime(date) {
  if (!date) return "just now";
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 30) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Initials({ name }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: T.sageLight,
        color: T.sageDeep,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

function Sprig({ size = 46 }) {
  return (
    <svg viewBox="0 0 140 60" width={size} height={size * (60 / 140)} fill="none">
      <path d="M8 40 C 40 14, 100 14, 132 40" stroke={T.sageDeep} strokeWidth="1.2" opacity="0.5" />
      <g transform="translate(70 22) scale(0.7)">
        {Array.from({ length: 5 }).map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-11"
            rx="8"
            ry="12"
            fill="#FFFFFF"
            stroke={T.line}
            strokeWidth="0.5"
            transform={`rotate(${72 * i})`}
          />
        ))}
        <circle r="4" fill={T.gold} />
      </g>
    </svg>
  );
}

function WishCard({ w, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40 * Math.min(index, 10));
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        borderRadius: 6,
        padding: "16px 18px",
        background: T.paper,
        border: `1px solid ${T.line}`,
        boxShadow: "0 2px 8px rgba(60, 50, 30, 0.05)",
        display: "flex",
        gap: 12,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <Initials name={w.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>{w.name}</span>
          <span
            title={w.time}
            style={{ fontSize: 10.5, color: T.inkFaint, whiteSpace: "nowrap", letterSpacing: "0.03em" }}
          >
            {w.relative}
          </span>
        </div>
        <p style={{ marginTop: 5, marginBottom: 0, fontSize: 14.5, lineHeight: 1.55, color: T.inkSoft }}>
          {w.text}
        </p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: 6,
            padding: "16px 18px",
            background: T.paper,
            border: `1px solid ${T.line}`,
            display: "flex",
            gap: 12,
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.ivoryDeep }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: "40%", height: 12, borderRadius: 3, background: T.ivoryDeep }} />
            <div style={{ width: "85%", height: 11, borderRadius: 3, background: T.ivoryDeep, marginTop: 10 }} />
            <div style={{ width: "60%", height: 11, borderRadius: 3, background: T.ivoryDeep, marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WishesPage() {
  const [wishes, setWishes] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "wishes"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => {
          const data = doc.data();
          const created = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
          return {
            id: doc.id,
            name: data.name,
            text: data.text,
            time: created ? created.toLocaleString() : "just now",
            relative: relativeTime(created),
          };
        });
        setWishes(list);
        setLoaded(true);
      },
      (err) => {
        console.error("Failed to load wishes:", err);
        setLoaded(true);
      }
    );
    return () => unsub();
  }, []);

  // refresh relative-time labels every 30s without a refetch
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `radial-gradient(circle at 50% 0%, ${T.ivory}, ${T.paper} 60%)`,
        fontFamily: "'EB Garamond', 'Lora', serif",
        padding: "48px 20px 60px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Sprig />
        </div>

        <h1
          style={{
            textAlign: "center",
            fontSize: 34,
            fontFamily: "'Cormorant Garamond', serif",
            color: T.ink,
            margin: "6px 0 0",
          }}
        >
          Guest Wishes
        </h1>
        <p
          style={{
            marginTop: 6,
            textAlign: "center",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: T.sageDeep,
          }}
        >
          {loaded ? `${wishes.length} MESSAGE${wishes.length === 1 ? "" : "S"}` : "LOADING"}
        </p>

        <div
          style={{
            margin: "22px auto 30px",
            width: 60,
            height: 1,
            background: T.line,
          }}
        />

        {!loaded && <Skeleton />}

        {loaded && wishes.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              border: `1px dashed ${T.line}`,
              borderRadius: 6,
              color: T.inkFaint,
              fontSize: 14,
            }}
          >
            No wishes yet — check back soon.
          </div>
        )}

        {loaded && wishes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {wishes.map((w, i) => (
              <WishCard key={w.id} w={w} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}