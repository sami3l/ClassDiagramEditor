import React, { useState } from 'react';
import { ClerkProvider, UserButton } from '@clerk/nextjs';
import {CodeGenerator} from './CodeGenerate';



const classElements = [
  { key: 'Class', label: 'Class' },
  { key: 'Interface', label: 'Interface' },
  { key: 'Abstract Class', label: 'Abstract Class' },
  { key: 'Enum', label: 'Enum' },
];


export const Sidebar: React.FC = () => {
  const [droppedElements, setDroppedElements] = useState<string[]>([]);
  // const [showSelect, setShowSelect] = useState(false);
  // const [selectedLanguage, setSelectedLanguage] = useState('');

  const handleDragStart = (event: React.DragEvent, elementType: string) => {
    event.dataTransfer.setData('application/class-type', elementType);
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const elementType = event.dataTransfer.getData('application/class-type');
    if (elementType && !droppedElements.includes(elementType)) {
      setDroppedElements((prev) => [...prev, elementType]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault(); // Prevent default to allow drop
  };

  // const handleGenerateCodeClick = () => {
  //   setShowSelect((prev) => !prev);
  // };

  // const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedLanguage(event.target.value);
  // };
  

  return (
    <aside
      className="bg-gray-800 p-6 w-64 h-screen flex flex-col text-white"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      aria-labelledby="sidebar-title"
    >
      <h3 id="sidebar-title" className="text-2xl font-bold mb-4">Elements</h3>
      <ul className="flex-1">
        {classElements.map((element) => (
          <li
            key={element.key}
            draggable
            onDragStart={(event) => handleDragStart(event, element.key)}
            className="p-3 cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-lg mb-2 transition"
            aria-label={`Drag ${element.label}`}
          >
            {element.label}
          </li>
          
        ))}
{/*         
      <button
        onClick={handleGenerateCodeClick}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
      >
        Generate Code
      </button> */}
{/* 
      {showSelect && (
        <div className="mt-4">
          <label htmlFor="language-select" className="block text-sm font-medium mb-2">
            Choose Language
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-gray-700 text-white p-2 rounded-lg w-full"
          >
            <option value="" disabled>
              Select a language
            </option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="python">Python</option>
          </select>
        </div>
      )} */}
      </ul>

      <CodeGenerator />

      <ClerkProvider>
        <div className="mt-auto">
          <UserButton />
        </div>
      </ClerkProvider>
    </aside>
  );
};
