import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-4 text-center md:text-left">

        <div>
          <h3 className="text-xl font-bold mb-2 text-white">EcoRide</h3>
          <p>Empowering greener journeys through smarter bike rentals.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Quick Links</h4>
          <ul className="space-y-1">
            <li><Link to="/" className="hover:text-green-500">Home</Link></li>
            <li><Link to="/catalog" className="hover:text-green-500">Catalog</Link></li>
            <li><Link to="/signup" className="hover:text-green-500">Sign Up</Link></li>
            <li><Link to="/login" className="hover:text-green-500">Log In</Link></li>
            <li><Link to="/form" className="hover:text-green-500">Form</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Contact</h4>
          <p>Email: support@ecoride.com</p>
          <p>Phone: +358 123 456 789</p>
        </div>

      </div>

      <p className="text-center text-sm mt-10">&copy; 2025 EcoRide. All rights reserved.</p>
    </footer>
  );
}
