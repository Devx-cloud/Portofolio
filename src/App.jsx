import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { NotFound } from "./pages/NotFound"
import { Contact } from "./pages/Contact"
import { StarBackground } from "./components/StarBackground"
import { CloudBackground } from "./components/CloudBackground"
import { StaticCloudBackground } from "./components/StaticCloudBackground"
import { useEffect, useState } from "react"


function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {isDarkTheme ? (
        <StarBackground />
      ) : (
        <>
          <CloudBackground />
          <StaticCloudBackground />
        </>
      )}
      <BrowserRouter>
        <Routes>
          <Route index element={<Home/>}/>
          <Route path="/contact" element={<Contact />}/>

          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
