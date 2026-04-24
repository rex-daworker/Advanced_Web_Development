import { useState } from "react";

export default function FormPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: ""
  });

  const [responseData, setResponseData] = useState(null);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    setResponseData(data);
  }

  return (
    <div className="mt-24 max-w-lg mx-auto bg-white shadow-lg p-8 rounded-xl">

      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
        Submit Your Info
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="date"
          name="date"
          required
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
          Submit
        </button>
      </form>

      {responseData && (
        <pre className="mt-6 bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
          {JSON.stringify(responseData, null, 2)}
        </pre>
      )}
    </div>
  );
}
