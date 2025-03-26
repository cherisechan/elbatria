import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

type ApiResponse = { uid: string | null };

export default function CreateBases() {
  const [modal, setModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [baseName, setBaseName] = useState("Untitled");

  useEffect(() => {
    const getId = async () => {
      try {
        const response = await fetch("/api/auth/userid", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = (await response.json()) as ApiResponse;
        
        if (typeof data.uid === 'string' ) {
            setUserId(data.uid);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    void getId();
  }, []);

  const createBaseAndTable = api.post.createBaseAndTable.useMutation();
  const createNewBaseAndTable = async () => {
    if (!userId) {
      return;
    }

    if (baseName === "") {
      setBaseName("Untitled");
    }

    try {
      await createBaseAndTable.mutateAsync({
        user_id: parseInt(userId, 10),
        base_name: baseName,
        table_name: "Table 1",
      });
    } catch (error) {
      console.error("Failed to create base and table:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setModal(!modal)}
        className="bg-blue-500 mt-3 text-white py-1 px-2 rounded-md hover:bg-blue-600"
      >
        + Create
      </button>
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100/50 z-100 text-black">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Base Name</h2>
            <input
              type="text"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="Enter table name"
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal(!modal)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={createNewBaseAndTable}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
