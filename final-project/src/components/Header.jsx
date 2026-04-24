import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-20">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-green-600">EcoRide</h1>

        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <Link to="/catalog" className="hover:text-green-600">Catalog</Link>
          <Link to="/signup" className="hover:text-green-600">Sign Up</Link>
          <Link to="/login" className="hover:text-green-600">Log In</Link>
          <Link to="/form" className="hover:text-green-600">Form</Link>
        </nav>
      </div>
    </header>
  );
}
