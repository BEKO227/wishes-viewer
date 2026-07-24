"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";

const T = {
  paper: "#FBF8F1",
  ivoryDeep: "#EEE6D4",
  line: "#E4DAC4",
  ink: "#33302A",
  inkSoft: "#6B6355",
  sageDeep: "#54603F",
};

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

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: T.paper,
        fontFamily: "'EB Garamond', 'Lora', serif",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: 32,
            fontFamily: "'Cormorant Garamond', serif",
            color: T.ink,
            margin: 0,
          }}
        >
          Guest Wishes
        </h1>
        <p
          style={{
            marginTop: 4,
            textAlign: "center",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: T.sageDeep,
          }}
        >
          {wishes.length} MESSAGE{wishes.length === 1 ? "" : "S"}
        </p>

        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
          {!loaded && (
            <p style={{ textAlign: "center", fontSize: 14, color: T.sageDeep }}>Loading wishes…</p>
          )}
          {loaded && wishes.length === 0 && (
            <p style={{ textAlign: "center", fontSize: 14, color: T.inkSoft }}>No wishes yet.</p>
          )}
          {wishes.map((w) => (
            <div
              key={w.id}
              style={{
                borderRadius: 2,
                padding: 16,
                background: T.ivoryDeep,
                border: `1px solid ${T.line}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{w.name}</span>
                <span style={{ fontSize: 10, color: T.sageDeep }}>{w.time}</span>
              </div>
              <p style={{ marginTop: 4, fontSize: 14, color: T.inkSoft }}>{w.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}