export default function HomePage() {
  return (
    <div className="font-sans text-gray-800">

      {/* HEADER */}
      <header className="bg-white shadow-md fixed top-0 left-0 w-full z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-green-600">EcoRide</h1>

          <nav className="hidden md:flex space-x-6">
            <a href="/" className="hover:text-green-600">Home</a>
            <a href="/catalog" className="hover:text-green-600">Catalog</a>
            <a href="/signup" className="hover:text-green-600">Sign Up</a>
            <a href="/login" className="hover:text-green-600">Log In</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <main className="mt-16">
        <section className="bg-gradient-to-br from-green-700 via-blue-700 to-green-800 text-white py-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12">

            <div className="text-center md:text-left max-w-xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">EcoRide Rentals</h1>
              <p className="text-lg md:text-xl mb-8 text-gray-100">
                Task-L: Sustainable e-bike rentals for your course project.
              </p>

              <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                <a href="/signup" className="bg-white text-green-700 px-6 py-3 rounded-lg text-lg font-semibold shadow hover:bg-gray-100 transition">
                  Get Started
                </a>
                <a href="/catalog" className="bg-white text-green-700 px-6 py-3 rounded-lg text-lg font-semibold shadow hover:bg-gray-100 transition">
                  View Catalog
                </a>
              </div>
            </div>

            <div className="mt-12 md:mt-0">
              <img
                src="/images/primeebike-header2.png"
                alt="EcoRide e-bike"
                className="w-full max-w-sm mx-auto md:ml-10 rounded-3xl shadow-2xl border border-white/10"
                loading="lazy"
              />
            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-4 text-center md:text-left">

          <div>
            <h3 className="text-xl font-bold mb-2 text-white">EcoRide</h3>
            <p>Empowering greener journeys through smarter bike rentals.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-white">Quick Links</h4>
            <ul className="space-y-1">
              <li><a href="/" className="hover:text-green-500">Home</a></li>
              <li><a href="/catalog" className="hover:text-green-500">Catalog</a></li>
              <li><a href="/signup" className="hover:text-green-500">Sign Up</a></li>
              <li><a href="/login" className="hover:text-green-500">Log In</a></li>
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

    </div>
  );
}
