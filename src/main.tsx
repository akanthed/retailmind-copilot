import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set up language attribute for proper font rendering
const htmlElement = document.getElementById('html-root') || document.documentElement;
const updateLanguageAttribute = () => {
  const savedLanguage = localStorage.getItem('language') || 'en';
  htmlElement.lang = savedLanguage;
};

// Initial setup
updateLanguageAttribute();

// Listen for storage changes from other tabs/windows
window.addEventListener('storage', updateLanguageAttribute);

// Listen for custom events from LanguageContext
window.addEventListener('languageChange', () => {
  setTimeout(updateLanguageAttribute, 0);
});

createRoot(document.getElementById("root")!).render(<App />);
