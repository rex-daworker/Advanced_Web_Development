import CatalogPage from "./pages/CatalogPage";
import HomePage from "./pages/HomePage";

<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/catalog" element={<CatalogPage />} />
  <Route path="/form" element={<FormPage />} />
</Routes>
