import React from "react";

interface ProfileForm {
  name: string;
  email: string;
  bio?: string;
}

interface ProfilEditProps {
  formData: ProfileForm;
  setFormData: (data: ProfileForm) => void;
  onSubmit: () => void; // ✅ Correction du type
  error?: string;
  loading: boolean;
  onCancel: () => void;
}

export default function ProfilEdit({ formData, setFormData, onSubmit, error, loading, onCancel }: ProfilEditProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(); 
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium">Nom</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex space-x-4">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-400 text-white rounded">
          Annuler
        </button>
      </div>
    </form>
  );
}
