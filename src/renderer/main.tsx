//Libs
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

//Imports
import "./index.css"
import App from "@/App/App"

//Main
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
