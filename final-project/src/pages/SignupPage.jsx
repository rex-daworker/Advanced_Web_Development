export default function SignupPage() {
  return (
    <div className="mt-24 max-w-md mx-auto bg-white shadow-lg p-8 rounded-xl">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">Sign Up</h1>

      <form className="space-y-4">
        <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" />
        <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" />
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" />

        <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
          Create Account
        </button>
      </form>
    </div>
  );
}
