export default function CatalogPage() {
  return (
    <div className="mt-20 px-6 max-w-6xl mx-auto">

      <h1 className="text-4xl font-bold text-green-700 mb-10 text-center">
        EcoRide Catalog
      </h1>

      <div className="grid md:grid-cols-3 gap-10">

        {/* Example Item 1 */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <img src="/images/primeebike-header2.png" className="rounded-lg mb-4" />
          <h2 className="text-xl font-semibold mb-2">Prime E‑Bike</h2>
          <p className="text-gray-600 mb-4">Fast, durable, and eco‑friendly.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Rent Now
          </button>
        </div>

        {/* Duplicate this block for more items */}
      </div>

    </div>
  );
}
