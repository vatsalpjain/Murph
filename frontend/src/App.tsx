import { useEffect, useState } from "react";
import "./App.css";

interface DataItem {
  id: number;
  name: string;
}

function App() {
  const [message, setMessage] = useState<string>("");
  const [data, setData] = useState<DataItem[]>([]);
  const [health, setHealth] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch root message
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching root:", err));

    // Fetch health status
    fetch("http://127.0.0.1:8000/health")
      .then((res) => res.json())
      .then((data) => setHealth(data.status))
      .catch((err) => console.error("Error fetching health:", err));

    // Fetch data from API
    fetch("http://127.0.0.1:8000/api/data")
      .then((res) => res.json())
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  const handleAddItem = async () => {
    const newItem = { id: data.length + 1, name: `Item ${data.length + 1}` };
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });
      
      const result = await response.json();
      console.log("Created:", result);
      
      // Refresh data
      const dataResponse = await fetch("http://127.0.0.1:8000/api/data");
      const dataResult = await dataResponse.json();
      setData(dataResult.data);
    } catch (err) {
      console.error("Error creating item:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          FastAPI + React Demo
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Server Status</h2>
          <p className="text-gray-700">
            <span className="font-medium">Message:</span> {message || "Loading..."}
          </p>
          <p className="text-gray-700 mt-2">
            <span className="font-medium">Health:</span>{" "}
            <span className={health === "healthy" ? "text-green-600" : "text-gray-400"}>
              {health || "Loading..."}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Data from API</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading data...</p>
          ) : (
            <>
              <ul className="space-y-2 mb-4">
                {data.map((item) => (
                  <li
                    key={item.id}
                    className="p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <span className="font-medium">ID: {item.id}</span> - {item.name}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={handleAddItem}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Add New Item
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
