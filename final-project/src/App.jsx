import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import FormPage from "./pages/FormPage";


function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/form" element={<FormPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;