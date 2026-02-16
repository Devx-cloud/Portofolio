import { Route, Routes, useLocation } from "react-router-dom"
import { Home } from "./pages/Home"
import { NotFound } from "./pages/NotFound"
import { Contact } from "./pages/Contact"
import { StarBackground } from "./components/StarBackground"
import { CloudBackground } from "./components/CloudBackground"
import { useEffect, useState } from "react"


function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(document.documentElement.classList.contains("dark"));
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    };

    // No need to call checkTheme() here as useState is initialized directly
    // The observer will handle subsequent changes

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {isDarkTheme ? (
        <StarBackground isHomePage={isHomePage} />
      ) : (
        <CloudBackground isHomePage={isHomePage} />
      )}
      <Routes>
        <Route index element={<Home/>}/>
        <Route path="/contact" element={<Contact />}/>

        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </>
  )
}

export default App
