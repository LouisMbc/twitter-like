export default function Tweet({ user, content, createdAt }) {
    return (
      <div className="border p-4 rounded-lg shadow-md mb-4">
        <h2 className="font-bold">{user}</h2>
        <p>{content}</p>
        <span className="text-sm text-gray-500">{createdAt}</span>
      </div>
    );
}