"use client";

import { useState, useEffect } from 'react';
import { ProfileForm } from '@/types';

interface ProfileEditFormProps {
  formData: ProfileForm;
  setFormData: React.Dispatch<React.SetStateAction<ProfileForm>>;
  onSubmit: (formData: ProfileForm) => Promise<void>;
  error: string;
  loading: boolean;
  onCancel: () => void;
}

export default function ProfileEditForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  error, 
  loading,
  onCancel
}: ProfileEditFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>(() => {
    // Utiliser la date du formData si elle existe, sinon date par défaut
    if (formData?.birthDate) {
      return new Date(formData.birthDate);
    }
    return new Date('2005-08-05');
  });

  // Initialiser les photos avec les images existantes
  useEffect(() => {
    if (formData?.currentProfilePicture) {
      setPreviewUrl(formData.currentProfilePicture);
    }
    if (formData?.currentCoverPicture) {
      setCoverPreviewUrl(formData.currentCoverPicture);
    }
  }, [formData?.currentProfilePicture, formData?.currentCoverPicture]);

  // Nettoyer les URLs d'objets au démontage
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [previewUrl, coverPreviewUrl]);

  // Synchroniser birthDate avec formData.birthDate quand formData change
  useEffect(() => {
    if (formData?.birthDate) {
      setBirthDate(new Date(formData.birthDate));
    }
  }, [formData?.birthDate]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'nickname':
        if (value.length < 3) {
          newErrors[name] = 'Le pseudo doit contenir au moins 3 caractères';
        } else if (value.length > 20) {
          newErrors[name] = 'Le pseudo ne peut pas dépasser 20 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'firstName':
        if (value.length > 50) {
          newErrors[name] = 'Le nom ne peut pas dépasser 50 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'lastName':
        if (value.length > 50) {
          newErrors[name] = 'Le prénom ne peut pas dépasser 50 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'bio':
        if (value.length > 280) {
          newErrors[name] = 'La bio ne peut pas dépasser 280 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'website':
        if (value && !value.match(/^https?:\/\/.+/)) {
          newErrors[name] = 'L\'URL doit commencer par http:// ou https://';
        } else {
          delete newErrors[name];
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'profile') {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      // Nettoyer l'ancienne URL
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setFormData(prev => ({ ...prev, coverPicture: file }));
      // Nettoyer l'ancienne URL
      if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
      const url = URL.createObjectURL(file);
      setCoverPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const currentDate = new Date(birthDate);
    
    if (name === 'day') {
      currentDate.setDate(parseInt(value));
    } else if (name === 'month') {
      currentDate.setMonth(parseInt(value) - 1);
    } else if (name === 'year') {
      currentDate.setFullYear(parseInt(value));
    }
    
    setBirthDate(currentDate);
  };

  const saveBirthDate = () => {
    setFormData(prev => ({ ...prev, birthDate: birthDate.toISOString() }));
    setShowDatePicker(false);
  };

  const cancelDateChange = () => {
    // Remettre la date à la valeur actuelle dans formData
    if (formData?.birthDate) {
      setBirthDate(new Date(formData.birthDate));
    } else {
      setBirthDate(new Date('2005-08-05'));
    }
    setShowDatePicker(false);
  };

  const formatBirthDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const generateDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  const generateMonths = () => {
    return [
      { value: 1, name: 'Janvier' },
      { value: 2, name: 'Février' },
      { value: 3, name: 'Mars' },
      { value: 4, name: 'Avril' },
      { value: 5, name: 'Mai' },
      { value: 6, name: 'Juin' },
      { value: 7, name: 'Juillet' },
      { value: 8, name: 'Août' },
      { value: 9, name: 'Septembre' },
      { value: 10, name: 'Octobre' },
      { value: 11, name: 'Novembre' },
      { value: 12, name: 'Décembre' },
    ];
  };

  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="bg-black text-white">
      {/* Cover Photo Section - Style amélioré */}
      <div className="relative h-48 bg-gray-700 overflow-visible">
        {coverPreviewUrl ? (
          <img
            src={coverPreviewUrl}
            alt="Photo de couverture"
            className="w-full h-full object-cover"
            onError={() => setCoverPreviewUrl(null)}
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Cover photo camera button - centered */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 group overflow-hidden">
          <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'cover')}
            />
          </label>
        </div>
      </div>
      
      {/* Profile Picture - Positionnée après la cover photo pour être entièrement visible */}
      <div className="relative px-6 -mt-12 mb-4">
        <div className="flex justify-start">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black shadow-xl bg-white">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewUrl(null)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Camera overlay centered */}
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100">
              <label className="cursor-pointer">
                <div className="bg-black bg-opacity-70 text-white p-2 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content - Espacement ajusté */}
      <div className="pb-8">
        <form onSubmit={handleSubmit} className="px-6 space-y-6">
          {/* Pseudo Field - Style comme dans l'image */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">Pseudo</label>
            <input
              type="text"
              name="nickname"
              value={formData?.nickname || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors duration-300 text-lg"
              placeholder="Votre_Pseudo"
              required
            />
          </div>

          {/* Nom Field */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">Nom</label>
            <input
              type="text"
              name="firstName"
              value={formData?.firstName || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors duration-300 text-lg"
              placeholder="Votre_Nom"
            />
          </div>

          {/* Prénom Field */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">Prénom</label>
            <input
              type="text"
              name="lastName"
              value={formData?.lastName || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors duration-300 text-lg"
              placeholder="Votre_Prénom"
            />
          </div>

          {/* Bio Field */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">Bio</label>
            <textarea
              name="bio"
              rows={3}
              value={formData?.bio || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors duration-300 text-lg resize-none"
              placeholder="Parlez-nous de vous..."
            />
            <div className="flex justify-end">
              <p className={`text-sm ${
                (formData?.bio || '').length > 250 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {(formData?.bio || '').length}/280
              </p>
            </div>
          </div>

          {/* Date de naissance - Utiliser la date du formData */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">Date de naissance</label>
            <div className="flex items-center justify-between py-3 px-4 border border-gray-600 rounded-lg">
              <span className="text-red-500 text-lg">
                {formatBirthDate(formData?.birthDate ? new Date(formData.birthDate) : new Date('2005-08-05'))}
              </span>
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>

          {/* Join date info - Style comme dans l'image */}
          <div className="py-4 border-t border-gray-700">
            <div className="flex items-center text-sm text-gray-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              A rejoint Flow le JJ/MM/AAAA
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Modal de sélection de date */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-80 max-w-sm mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Modifier la date de naissance</h3>
              <button
                onClick={cancelDateChange}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Sélecteur de jour */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Jour</label>
                <select
                  name="day"
                  value={birthDate.getDate()}
                  onChange={handleDateChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  {generateDays().map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Sélecteur de mois */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mois</label>
                <select
                  name="month"
                  value={birthDate.getMonth() + 1}
                  onChange={handleDateChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  {generateMonths().map(month => (
                    <option key={month.value} value={month.value}>{month.name}</option>
                  ))}
                </select>
              </div>

              {/* Sélecteur d'année */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Année</label>
                <select
                  name="year"
                  value={birthDate.getFullYear()}
                  onChange={handleDateChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  {generateYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={cancelDateChange}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveBirthDate}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}