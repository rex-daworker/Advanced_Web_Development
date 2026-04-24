import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import OrderPage from "./pages/OrderPage";
import FormPage from "./pages/FormPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/form" element={<FormPage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
