export default function MainContent() {
  return (
    <main>
      <section id="catalog" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Why Choose EcoRide?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-2xl font-semibold mb-2">Eco-Friendly</h3>
              <p>Zero emissions. Sustainable transportation for a better planet.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-semibold mb-2">Easy Booking</h3>
              <p>Simple online reservation system. Flexible rental periods.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-2xl font-semibold mb-2">Secure & Safe</h3>
              <p>All bikes maintained and insured. Your safety is our priority.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold">See EcoRide in Action</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              This rebuild now matches the original page structure and image-based hero.
            </p>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl shadow-lg">
            <img
              src="/images/primeebike-header2.png"
              alt="EcoRide e-bike"
              className="w-full h-auto max-h-[420px] object-cover"
            />
          </div>
        </div>
      </section>

      <section id="signup" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="rounded-3xl bg-white p-10 shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Start your EcoRide journey</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              This page is a React rebuild of the original layout. The hero image has been
              integrated in a way that is close to the course page design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#top"
                className="inline-flex items-center justify-center rounded-full bg-green-600 px-8 py-3 text-white font-semibold hover:bg-green-700 transition"
              >
                Get Started
              </a>
              <a
                href="#top"
                className="inline-flex items-center justify-center rounded-full border border-green-600 px-8 py-3 text-green-700 font-semibold hover:bg-green-50 transition"
              >
                Log In
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
