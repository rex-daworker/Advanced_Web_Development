export default function Header() {
  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-20">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-green-600">EcoRide</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="#top" className="hover:text-green-600">Home</a>
          <a href="#catalog" className="hover:text-green-600">Catalog</a>
          <a href="#signup" className="hover:text-green-600">Sign Up</a>
          <a href="#top" className="hover:text-green-600">Log In</a>
        </nav>
      </div>
    </header>
  );
}