"use client";

import { useEffect, useState } from "react";

type Experience = {
  xata_id: string;
  category?: string;
  date?: string; // This will store the RFC 3339 date string from the API
  description?: string;
  experience?: number;
};

export default function ExperienceCRUD() {
  const [data, setData] = useState<Experience[]>([]);
  const [newEntry, setNewEntry] = useState({
    category: "",
    date: "", // Will store the YYYY-MM-DD string from the date input
    description: "",
    experience: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Experience | null>(null);

  // Utility function to convert YYYY-MM-DD to RFC 3339
  const toRFC3339 = (dateStr: string): string => {
    if (!dateStr) return "";
    // Ensure the date is parsed in UTC to avoid timezone issues
    // Appending T00:00:00.000Z or using UTC methods helps
    const date = new Date(dateStr + 'T00:00:00Z'); // Parse as UTC day start
    // Check if date is valid before converting
    if (isNaN(date.getTime())) {
        console.error("Invalid date string provided to toRFC3339:", dateStr);
        return ""; // Return empty string or handle error as needed
    }
    return date.toISOString(); // Converts to e.g., 2025-05-03T00:00:00.000Z
  };

  const fetchData = async () => {
    try {
      // --- MODIFIED: Call the new endpoint for fetching all records ---
      const res = await fetch("/api/experience_log/records");
      // --- END MODIFIED ---

      // Add robust error handling for the fetch response itself
      if (!res.ok) {
        console.error("Failed to fetch experience records:", res.status, res.statusText);
        setData([]); // Clear data on fetch error
        return; // Stop execution
      }

      const dataEnvelope = await res.json(); // Expecting { records: [...] } from the new API

      // --- MODIFIED: Access the array from the 'records' property ---
      const experienceArray = dataEnvelope.records;
      // --- END MODIFIED ---

      // Add a check to ensure the response actually contains an array in the expected format
      if (!Array.isArray(experienceArray)) {
         console.error("API response format is unexpected for records endpoint:", dataEnvelope);
         setData([]); // Set data to empty array if format is wrong
         return; // Stop processing
      }

      // Sort the array by date (descending)
      const sorted = experienceArray.sort(
        (a: Experience, b: Experience) => {
           // Robust date comparison handling potential undefined/invalid dates
           const dateA = new Date(a.date || ""); // Parse date string from API (RFC 3339)
           const dateB = new Date(b.date || ""); // Parse date string from API (RFC 3339)

           const timeA = isNaN(dateA.getTime()) ? -Infinity : dateA.getTime(); // Treat invalid dates at the beginning/end of the sort
           const timeB = isNaN(dateB.getTime()) ? -Infinity : dateB.getTime(); // Treat invalid dates at the beginning/end

           return timeB - timeA; // Sort descending (latest first)
        }
      );
      setData(sorted);

    } catch (err) {
      // Handle network errors or other exceptions during fetch/parse
      console.error("Failed to fetch experience data:", err);
      setData([]); // Clear data on error
    }
  };

  const handleAdd = async () => {
    // Basic validation
    if (!newEntry.category || !newEntry.date || !newEntry.description) {
      console.warn("Category, Date, and Description are required to add.");
      return; // Prevent adding if required fields are empty
    }

    // Format the date to RFC 3339 for the API
    const formattedEntry = {
      ...newEntry,
      date: toRFC3339(newEntry.date),
      // Ensure experience is a number, defaults to 0 if parsing fails
      experience: Number(newEntry.experience || 0),
    };

    try {
      const res = await fetch("/api/experience_log", { // POST to the original /api/experience_log route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedEntry),
      });

      if (!res.ok) {
        const errorBody = await res.text(); // Read error response body
        console.error("Add failed:", res.status, res.statusText, errorBody);
        alert(`Failed to add entry: ${res.statusText}`); // User feedback
        return;
      }

      // Clear the form and refetch data
      setNewEntry({ category: "", date: "", description: "", experience: 0 });
      fetchData();

    } catch (err) {
      console.error("Error during add operation:", err);
      alert("An error occurred while adding the entry."); // User feedback
    }
  };

  const handleUpdate = async () => {
    // Validate that an entry is selected and being edited
    if (!selectedId || !editingEntry) {
      console.warn("No entry selected or editing data is missing.");
      return;
    }
     // Basic validation for editing entry
     if (!editingEntry.category || !editingEntry.date || !editingEntry.description) {
        console.warn("Category, Date, and Description are required to update.");
        return; // Prevent updating if required fields are empty
     }

    // Format the date to RFC 3339 for the API
    const formattedEntry = {
      ...editingEntry,
      // The editingEntry.date might be YYYY-MM-DD from the input,
      // or potentially RFC3339 if it wasn't changed. toRFC3339 handles YYYY-MM-DD.
      date: toRFC3339(editingEntry.date.split("T")[0] || ""), // Ensure we format the YYYY-MM-DD part from the input
       // Ensure experience is a number, defaults to 0 if parsing fails
      experience: Number(editingEntry.experience || 0),
    };

    try {
      const res = await fetch(`/api/experience_log/${selectedId}`, { // PUT to the /api/experience_log/[id] route
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedEntry),
      });

      if (!res.ok) {
         const errorBody = await res.text();
         console.error("Update failed:", res.status, res.statusText, errorBody);
         alert(`Failed to update entry: ${res.statusText}`); // User feedback
         return;
      }

      // Clear selection and editing state, then refetch data
      setSelectedId(null);
      setEditingEntry(null);
      fetchData();

    } catch (err) {
       console.error("Error during update operation:", err);
       alert("An error occurred while updating the entry."); // User feedback
    }
  };

  const handleDelete = async (id: string) => {
    // Confirmation before deleting
    if (!confirm("Are you sure you want to delete this entry?")) {
        return; // Stop if user cancels
    }

    try {
      const res = await fetch(`/api/experience_log/${id}`, { method: "DELETE" }); // DELETE to the /api/experience_log/[id] route

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Delete failed:", res.status, res.statusText, errorBody);
        alert(`Failed to delete entry: ${res.statusText}`); // User feedback
        return;
      }

      // Refetch data after successful deletion
      fetchData();

    } catch (err) {
      console.error("Error during delete operation:", err);
      alert("An error occurred while deleting the entry."); // User feedback
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this runs only once on mount

  // Separate data for display
  const latestFive = data.slice(0, 5);
  const olderEntries = data.slice(5);

  // --- Helper to format API date (RFC 3339) for display (YYYY-MM-DD) ---
  const formatDisplayDate = (dateStr?: string) => {
      if (!dateStr) return "N/A";
      try {
         // Parse the RFC 3339 string. Using slice(0, 10) is simpler for just display,
         // but parsing ensures validity. new Date() parses RFC 3339 correctly.
         const date = new Date(dateStr);
         if (isNaN(date.getTime())) return "Invalid Date";
         // Get YYYY-MM-DD parts. Use UTC methods if you want to guarantee the day is the same
         // as input if input was YYYY-MM-DD and stored as T00:00:00Z
         return date.toISOString().split('T')[0];

      } catch (e) {
         console.error("Failed to format date for display:", dateStr, e);
         return "Error";
      }
  }
  // --- END Helper ---


  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Experience Log CRUD</h2> {/* Changed title slightly */}

      {/* Add New Entry Form */}
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-semibold">Add New Entry</h3>
        <input
          className="w-full p-2 border rounded"
          placeholder="Category"
          value={newEntry.category}
          onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
        />
        {/* Use type="date" input which natively handles YYYY-MM-DD */}
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={newEntry.date} // This should be YYYY-MM-DD for the input
          onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={newEntry.description}
          onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
        />
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="Experience Points"
          value={newEntry.experience}
          onChange={(e) => setNewEntry({ ...newEntry, experience: Number(e.target.value) })}
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Experience
        </button>
      </div>

      {/* Latest 5 Entries Display */}
      <h3 className="text-lg font-semibold mb-2">Latest 5 Entries</h3>
      {latestFive.length === 0 ? (
          <p className="text-gray-500">No recent entries.</p>
      ) : (
          <ul className="space-y-3 mb-4">
            {latestFive.map((item) => (
              <li key={item.xata_id} className="border p-3 rounded bg-gray-50">
                <div className="flex justify-between items-center">
                    <strong className="text-base">{item.category || 'Untitled'}</strong>
                    <span className="text-xs text-blue-700 font-medium">EXP: {item.experience || 0}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{item.description || 'No description'}</p>
                {/* Format date for display */}
                <p className="text-xs text-gray-500 mt-1">Date: {formatDisplayDate(item.date)}</p>
                {/* Delete button */}
                <button
                  className="text-red-500 hover:text-red-700 text-xs mt-2"
                  onClick={() => handleDelete(item.xata_id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
      )}


      {/* Edit Older Entry Section */}
      <h3 className="text-lg font-semibold mb-2">Edit Older Entry</h3>
      {data.length <= 5 && ( // Show message if no older entries to select
          <p className="text-gray-500 mb-4">No older entries to edit yet.</p>
      )}
      {data.length > 5 && ( // Only show select if there are older entries
        <select
          className="w-full mb-4 p-2 border rounded bg-white"
          value={selectedId || ""}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedId(id);
            // Find the selected entry from the full data array
            const found = data.find((d) => d.xata_id === id);
            // Set the editing state, formatting the date back to YYYY-MM-DD for the input
            setEditingEntry(found ? { ...found, date: found.date?.split("T")[0] || "" } : null);
          }}
        >
          <option value="">Select an older entry</option>
          {/* Map over older entries to create options */}
          {olderEntries.map((item) => (
            <option key={item.xata_id} value={item.xata_id}>
              {item.category || 'Untitled'} — {formatDisplayDate(item.date)}
            </option>
          ))}
        </select>
      )}


      {/* Editing Form (conditionally rendered) */}
      {editingEntry && selectedId && ( // Only show form if an entry is selected for editing
        <div className="space-y-2 border p-4 rounded bg-yellow-50"> {/* Highlight editing section */}
          <h4 className="text-md font-semibold">Editing: {editingEntry.category || 'Untitled'}</h4>
          <input
            className="w-full border p-2 rounded"
            placeholder="Category"
            value={editingEntry.category || ""}
            onChange={(e) =>
              setEditingEntry({ ...editingEntry, category: e.target.value })
            }
          />
           {/* Use type="date" input for editing date */}
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={editingEntry.date || ""} // This state should now hold YYYY-MM-DD
            onChange={(e) =>
              setEditingEntry({ ...editingEntry, date: e.target.value })
            }
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            value={editingEntry.description || ""}
            onChange={(e) =>
              setEditingEntry({ ...editingEntry, description: e.target.value })
            }
          />
          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Experience Points"
            // Ensure value is always a string for input, handle potential null/undefined
            value={editingEntry.experience?.toString() || "0"}
            onChange={(e) =>
              setEditingEntry({
                ...editingEntry,
                experience: Number(e.target.value),
              })
            }
          />
          <button
            onClick={handleUpdate}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Save Changes
          </button>
           <button
            onClick={() => { // Cancel editing button
                setSelectedId(null);
                setEditingEntry(null);
            }}
            className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 mt-2"
          >
            Cancel Editing
          </button>
        </div>
      )}
       {/* Message when no older entry is selected */}
       {data.length > 5 && !editingEntry && (
           <p className="text-gray-500">Select an entry from the dropdown above to edit.</p>
       )}

    </div>
  );
}