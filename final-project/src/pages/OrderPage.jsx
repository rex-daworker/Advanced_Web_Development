export default function OrderPage() {
  return (
    <div className="mt-24 max-w-lg mx-auto bg-white shadow-lg p-8 rounded-xl">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">Place Order</h1>

      <form className="space-y-4">
        <input type="text" placeholder="Bike Model" className="w-full p-3 border rounded-lg" />
        <input type="date" className="w-full p-3 border rounded-lg" />
        <input type="number" placeholder="Rental Days" className="w-full p-3 border rounded-lg" />

        <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
          Submit Order
        </button>
      </form>
    </div>
  );
}
