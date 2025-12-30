import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {Bounce, ToastContainer} from "react-toastify";

export const envUrl = "http://localhost:8082/";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
      />
  </StrictMode>,
)
