import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { NotFound } from "./pages/NotFound"
import { Contact } from "./pages/Contact"


function App() {

  return (
    <>
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
