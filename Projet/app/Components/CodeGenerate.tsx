import React, { useState, ChangeEvent } from 'react';


export const CodeGenerator: React.FC = () => {
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const handleGenerateCodeClick = () => {
    setShowSelect((prevShowSelect) => !prevShowSelect); // Basculer le menu déroulant
  };

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const language = event.target.value;
    setSelectedLanguage(language); // Mettre à jour le langage sélectionné
// Appeler la fonction avec le langage sélectionné
  };

  return (
    <div className="flex flex-col items-center w-full h-screen bg-gray-800 text-white">
      <button
        onClick={handleGenerateCodeClick}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
        aria-expanded={showSelect}
        aria-controls="language-select"
      >
        {selectedLanguage ? `Générer le code ${selectedLanguage}` : 'Générer le code'}
      </button>

      {showSelect && (
        <div className="mt-4">
          <label htmlFor="language-select" className="block text-sm font-medium mb-2">
            Choisir un langage
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-gray-700 text-white p-2 rounded-lg w-full"
          >
            <option value="" disabled>
              Sélectionner un langage
            </option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="python">Python</option>
          </select>
        </div>
      )}
    </div>
  );
};
