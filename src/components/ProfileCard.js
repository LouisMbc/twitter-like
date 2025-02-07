export default function ProfileCard({ user }) {
    return (
      <div className="border p-4 rounded-lg shadow-md flex items-center">
        <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full mr-4" />
        <div>
          <h2 className="font-bold">{user.name}</h2>
          <p className="text-gray-500">@{user.username}</p>
        </div>
      </div>
    );
  }
  