import { createRoot } from "react-dom/client";

const root = document.getElementById("root");

if (!root) {
  document.body.innerHTML = "<h1>ROOT DIV NOT FOUND</h1>";
} else {
  createRoot(root).render(
    <div style={{ padding: 40, fontSize: 24 }}>
      ✅ React is rendering successfully
    </div>
  );
}
