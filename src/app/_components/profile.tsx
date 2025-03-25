import { useState } from "react";
import Image from "next/image";
import SignOutBtn from "./signOutBtn";

interface SessionData {
  user: {
    name: string;
    email: string;
    image: string;
  };
  expires: string;
}

export default function Profile({ session }: { session: SessionData }) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleProfileClick = () => {
    setModalOpen(!isModalOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={handleProfileClick}
        className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Image
          src={session.user.image}
          alt="Profile Picture"
          width={48}
          height={48}
          className="object-cover w-full h-full"
        />
      </button>

      {isModalOpen && (
        <div
          className="absolute top-16 right-0 bg-white shadow-lg rounded-lg p-4 z-50 w-64"
          onClick={() => setModalOpen(false)}
        >
          <p className="text-lg font-medium text-gray-900">{session.user.name}</p>
          <p className="text-sm text-gray-600 border-solid border-b-2 border-gray-100 pb-3">{session.user.email}</p>
          <SignOutBtn />
        </div>
      )}
    </div>
  );
}
