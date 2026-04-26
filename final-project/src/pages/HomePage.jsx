import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="font-sans text-gray-800">

      {/* HERO */}
      <main className="mt-16">
        <section className="bg-gradient-to-br from-green-700 via-blue-700 to-green-800 text-white py-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12">

            {/* LEFT TEXT BLOCK */}
            <div className="text-center md:text-left max-w-xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">EcoRide Rentals</h1>

              <p className="text-lg md:text-xl mb-8 text-gray-100">
                Task-L: Sustainable e-bike rentals for your course project.
              </p>

              <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/signup"
                  className="bg-white text-green-700 px-6 py-3 rounded-lg text-lg font-semibold shadow hover:bg-gray-100 transition"
                >
                  Get Started
                </Link>

                <Link
                  to="/catalog"
                  className="bg-white text-green-700 px-6 py-3 rounded-lg text-lg font-semibold shadow hover:bg-gray-100 transition"
                >
                  View Catalog
                </Link>
              </div>
            </div>
still
            {/* RIGHT IMAGE */}
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

    </div>
  );
}
