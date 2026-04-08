export default function MainContent() {
  return (
    <section className="py-16 bg-gray-50">
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
  );
}