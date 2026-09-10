import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SynthApp } from "@/components/synth/synth-app";
import "@/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SynthApp />
  </StrictMode>,
);
