import React, { useEffect, useRef, useState } from 'react';
import * as go from 'gojs';

export const GoDiagramCanvas: React.FC = () => {

  const diagramRef = useRef<go.Diagram | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
  const [currentClass, setCurrentClass] = useState({
    name: '',
    attributes: [{ name: '', type: '' }],
    methods: [{ name: '', returnType: ''}],
    stereotype: '',
  });

  
  // Définir la liste des types possibles
  const typesOptions = [
    'string',
    'number',
    'boolean',
    'any',
    'void',
    'undefined',
    'null',
    'object',
    'Array',
    'Function',
    // Ajoutez d'autres types si nécessaire
  ];
  // Définir la liste des associations types possibles
  const associationTypes = [
    'Association',
    'Directed Association',
    'Reflexive Association',
    'Multiplicity',
    'Aggregation',
    'Composition',
    'Inheritance',
    'Realization',
  ];

  

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkFormPosition, setLinkFormPosition] = useState({ x: 0, y: 0 });
  const [currentLink, setCurrentLink] = useState<go.Link | null>(null);
  const [selectedLinkType, setSelectedLinkType] = useState('Association');
  const [fromMultiplicity, setFromMultiplicity] = useState('');
  const [toMultiplicity, setToMultiplicity] = useState('');

 const handleGenerateCode  = () => {
    const nodes = diagramRef.current?.model.nodeDataArray;

    if (!nodes) return;

    const code = nodes
    .map((node) => {
      const attributes = node.attributes
        .map((attr: { name: string; type: string }) => `  private ${attr.type} ${attr.name};`)
        .join('\n');

      const methods = node.methods
        .map(
          (method: { name: string; returnType: string }) =>
            `  public ${method.returnType} ${method.name}() {\n    // implémentation\n  }`
        )
        .join('\n');

      const stereotype = node.stereotype ? `${node.stereotype} ` : '';
      
      // Handle different stereotypes and cases
      switch(stereotype.trim()) {
        case '«interface»':
          return `public interface ${node.name} {\n${attributes}\n\n${methods}\n}`;
          
        case '«abstract»':
          return `public abstract class ${node.name} {\n${attributes}\n\n${methods}\n}`;
           
        default:
          return `public class ${stereotype}${node.name} {\n${attributes}\n\n${methods}\n}`;
      }
    })
    .join('\n\n');

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedClasses.java';
    a.click();
  };

  useEffect(() => {
    if (!divRef.current) return;
    
    const $ = go.GraphObject.make;
    const myDiagram = $(go.Diagram, divRef.current, {
      initialContentAlignment: go.Spot.Center,
      'undoManager.isEnabled': true,
      'linkingTool.isEnabled': true,
      'relinkingTool.isEnabled': true,
    });

    // Modifier le nodeTemplate
    myDiagram.nodeTemplate = $(
      go.Node,
      'Spot', // Utiliser un Panel de type 'Spot' pour positionner les ports
      { selectionObjectName: 'MAIN' },
      // La forme principale du nœud
      $(
        go.Panel,
        'Auto',
        { name: 'MAIN' },
        $(go.Shape, 'RoundedRectangle', {
          fill: 'lightblue',
          stroke: 'gray',
          strokeWidth: 2,
        }),
        $(
          go.Panel,
          'Vertical',
          { margin: 4 },
          // Afficher le stéréotype si présent
          $(
            go.TextBlock,
            {
              font: 'italic 10px sans-serif',
              margin: new go.Margin(0, 0, 4, 0),
            },
            new go.Binding('text', 'stereotype'),
            {
              visible: true,
            }
          ),
          // Nom de la classe
          $(
            go.TextBlock,
            {
              font: 'bold 12px sans-serif',
              margin: new go.Margin(0, 0, 4, 0),
            },
            new go.Binding('text', 'name')
          ),
          // Séparateur
          $(go.Shape, 'LineH', { stroke: 'black', strokeWidth: 1 }),
          // Afficher les attributs
          $(
            go.Panel,
            'Vertical',
            new go.Binding('itemArray', 'attributes'),
            {
              itemTemplate: $(
                go.Panel,
                'Horizontal',
                $(
                  go.TextBlock,
                  {
                    margin: new go.Margin(0, 0, 2, 0),
                    font: '12px sans-serif',
                  },
                  new go.Binding('text', '', (attr) => `${attr.name}: ${attr.type}`)
                )
              ),
            }
          ),
          // Séparateur
          $(go.Shape, 'LineH', { stroke: 'black', strokeWidth: 1 }),
          // Afficher les méthodes
          $(
            go.Panel,
            'Vertical',
            new go.Binding('itemArray', 'methods'),
            {
              itemTemplate: $(
                go.Panel,
                'Horizontal',
                $(
                  go.TextBlock,
                  {
                    margin: new go.Margin(0, 0, 2, 0),
                    font: '12px sans-serif',
                  },
                  new go.Binding('text', '', (method) => `${method.name}(): ${method.returnType}`)
                )
              ),
            }
          )
        )
      ),
      // Bouton d'édition en haut à droite, en dehors du nœud
      $(
        'Button',
        {
          alignment: new go.Spot(1, 0, 10, -10),  // Positionné en haut à droite avec un décalage
          click: (e, obj) => {
            const node = obj.part;
            if (node instanceof go.Node) {
              // Logique d'édition
              const data = node.data;
              setCurrentClass({
                name: data.name,
                attributes: data.attributes,
                methods: data.methods,
                stereotype: data.stereotype,
              });
              setFormPosition({
                x: e.viewPoint.x,
                y: e.viewPoint.y,
              });
              setShowForm(true);
              // Supprimer l'ancien nœud
              myDiagram.startTransaction('remove node');
              myDiagram.remove(node);
              myDiagram.commitTransaction('remove node');
            }
          },
        },
        $(go.TextBlock, '✏️', { margin: 2 })
      ),
      // Bouton de suppression en haut à gauche, en dehors du nœud
      $(
        'Button',
        {
          alignment: new go.Spot(0, 0, -10, -10),  // Positionné en haut à gauche avec un décalage
          click: (e, obj) => {
            const node = obj.part;
            if (node instanceof go.Node) {
              // Logique de suppression
              myDiagram.startTransaction('remove node');
              myDiagram.remove(node);
              myDiagram.commitTransaction('remove node');
            }
          },
        },
        $(go.TextBlock, '🗑️', { margin: 2 })
      ),
      // Ports de liaison
      $(
        go.Shape,
        'Circle',
        {
          alignment: go.Spot.Left,
          alignmentFocus: go.Spot.Center,
          portId: 'left',
          fromLinkable: true,
          toLinkable: true,
          cursor: 'pointer',
          desiredSize: new go.Size(8, 8),
          fill: 'gray',
          strokeWidth: 0,
        }
      ),
      $(
        go.Shape,
        'Circle',
        {
          alignment: go.Spot.Right,
          alignmentFocus: go.Spot.Center,
          portId: 'right',
          fromLinkable: true,
          toLinkable: true,
          cursor: 'pointer',
          desiredSize: new go.Size(8, 8),
          fill: 'gray',
          strokeWidth: 0,
        }
      ),
      $(
        go.Shape,
        'Circle',
        {
          alignment: go.Spot.Top,
          alignmentFocus: go.Spot.Center,
          portId: 'top',
          fromLinkable: true,
          toLinkable: true,
          cursor: 'pointer',
          desiredSize: new go.Size(8, 8),
          fill: 'gray',
          strokeWidth: 0,
        }
      ),
      $(
        go.Shape,
        'Circle',
        {
          alignment: go.Spot.Bottom,
          alignmentFocus: go.Spot.Center,
          portId: 'bottom',
          fromLinkable: true,
          toLinkable: true,
          cursor: 'pointer',
          desiredSize: new go.Size(8, 8),
          fill: 'gray',
          strokeWidth: 0,
        }
      ),
      // Désactiver les liaisons depuis le corps principal du nœud
      {
        fromLinkable: false,
        toLinkable: false,
      }
    );

    myDiagram.linkTemplate = $(
      go.Link,
      {
        routing: go.Routing.AvoidsNodes,
        curve: go.Curve.JumpOver,
        corner: 5,
        relinkableFrom: true,
        relinkableTo: true,
        selectable: true,
      },
      // Main line
      $(go.Shape, 
        { strokeWidth: 2 },
        new go.Binding('strokeDashArray', 'relationship', (rel) => {
          if (rel === 'Realization') return [6, 3];
          return null;
        })
      ),
      // Start arrow (from)
      $(go.Shape,
        {
          fromArrow: "",
          strokeWidth: 2,
          fill: "white"
        },
        new go.Binding('fromArrow', 'relationship', (rel) => {
          if (rel === 'Aggregation' || rel === 'Composition') return 'Diamond';
          return '';
        }),
        new go.Binding('fill', 'relationship', (rel) => {
          if (rel === 'Composition') return 'black';
          return 'white';
        })
      ),
      // End arrow (to)
      $(go.Shape,
        {
          toArrow: "",
          strokeWidth: 2,
        },
        new go.Binding('toArrow', 'relationship', (rel) => {
          if (rel === 'Inheritance' || rel === 'Realization' || rel === 'Directed Association') 
            return 'OpenTriangle';
          return '';
        })
      ),
      // From multiplicity (near source end of the link)
      $(go.TextBlock,
        {
          segmentIndex: 0, 
          segmentFraction: 1.5,  // Position closer to the source
          alignmentFocus: go.Spot.BottomRight, 
          font: "12px sans-serif"
        },
        new go.Binding('text', 'fromMultiplicity')  // Bind to 'fromMultiplicity'
      ),
      // To multiplicity (near target end of the link)
      $(go.TextBlock,
        {
          segmentIndex: -1, 
          segmentFraction: 1.9,  // Position closer to the target
          alignmentFocus: go.Spot.BottomRight, 
          font: "12px sans-serif"
        },
        new go.Binding('text', 'toMultiplicity')  // Bind to 'toMultiplicity'
      )
    );
    

    
    
    diagramRef.current = myDiagram;
    


    myDiagram.addDiagramListener('LinkDrawn', (e) => {
      const link = e.subject;
      setCurrentLink(link);
      const viewPosition = myDiagram.transformDocToView(link.midPoint);
      setLinkFormPosition({
        x: viewPosition.x,
        y: viewPosition.y,
      });
      setShowLinkForm(true);
      

    });
    
    return () => {
      myDiagram.div = null;
    };
  }, []);

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const elementType = event.dataTransfer.getData('application/class-type');
    if (!elementType || !diagramRef.current) return;

    // Définir le stéréotype en fonction du type d'élément
    let stereotype = '';
    if (elementType === 'Interface') {
      stereotype = '«interface»';
    } else if (elementType === 'Abstract Class') {
      stereotype = '«abstract»';
    }
    // Vous pouvez ajouter d'autres types ici

    setFormPosition({ x: event.clientX, y: event.clientY });
    setCurrentClass({
      name: '',
      attributes: [{ name: '', type: '' }],
      methods: [{ name: '', returnType: '' }],
      stereotype: stereotype,
    });
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagramRef.current) return;

    const point = diagramRef.current.transformViewToDoc(
      new go.Point(formPosition.x, formPosition.y)
    );

    const nodeData = {
      key: diagramRef.current.model.nodeDataArray.length + 1,
      name: currentClass.name,
      stereotype: currentClass.stereotype,
      attributes: currentClass.attributes.map(({ name, type }) => ({
        name,
        type,
      })),
      methods: currentClass.methods.map(({ name, returnType }) => ({
        name,
        returnType,
      })),
      loc: go.Point.stringify(point),
    };

    diagramRef.current.model.startTransaction('Add Node');
    diagramRef.current.model.addNodeData(nodeData);
    diagramRef.current.model.commitTransaction('Add Node');
    setShowForm(false);
  };

  const handleAttributeChange = (index: number, field: string, value: string) => {
    setCurrentClass((prev) => {
      const updatedAttributes = [...prev.attributes];
      updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
      return { ...prev, attributes: updatedAttributes };
    });
  };

  const addAttribute = () => {
    setCurrentClass((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', type: '' }],
      methods: [...prev.methods, { name: '', returnType: '' }],
    }));
  };

  const handleMethodChange = (index: number, field: string, value: string) => {
    setCurrentClass((prev) => {
      const updatedMethods = [...prev.methods];
      updatedMethods[index] = { ...updatedMethods[index], [field]: value };
      return { ...prev, methods: updatedMethods };
    });
  };

  const addMethod = () => {
    setCurrentClass((prev) => ({
      ...prev,
      methods: [...prev.methods, { name: '', returnType: '' }],
    }));
  };

  const handleLinkFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentLink && diagramRef.current) {
      diagramRef.current.model.startTransaction('update link');
      diagramRef.current.model.setDataProperty(currentLink.data, 'relationship', selectedLinkType);
      diagramRef.current.model.setDataProperty(currentLink.data, 'fromMultiplicity', fromMultiplicity);
      diagramRef.current.model.setDataProperty(currentLink.data, 'toMultiplicity', toMultiplicity);
      diagramRef.current.model.commitTransaction('update link');
      setShowLinkForm(false);
      setCurrentLink(null);
      setSelectedLinkType('Association');
      setFromMultiplicity('');
      setToMultiplicity('');
    }
  };

  


  return (
<div className="flex h-screen">

   <div
    ref={divRef}
    onDrop={handleDrop}
    onDragOver={(e) => e.preventDefault()}
    className="bg-gray-100 w-[85%] h-screen border-l border-gray-400"
  >
    {showForm && (
      <div
        style={{
          position: 'absolute',
          top: formPosition.y,
          left: formPosition.x,
          backgroundColor: 'white',
          padding: '16px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold mb-2">Nouvelle Classe</h3>
        <form onSubmit={handleFormSubmit}>
          <div>
            <label className="block mb-2">Nom de la classe :</label>
            <input
              type="text"
              value={currentClass.name}
              onChange={(e) => setCurrentClass((prev) => ({ ...prev, name: e.target.value }))}
              className="border p-2 mb-4 w-full"
            />
          </div>
          <div>
            <h4 className="font-medium mb-2">Attributs :</h4>
            {currentClass.attributes.map((attr, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder="Nom"
                  value={attr.name}
                  onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                  className="border p-2 mr-2"
                />
                <select
                  value={attr.type}
                  onChange={(e) => handleAttributeChange(index, 'type', e.target.value)}
                  className="border p-2"
                >
                  <option value="">Sélectionnez le type</option>
                  {typesOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              type="button"
              onClick={addAttribute}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              + Ajouter un attribut
            </button>
          </div>
          <div>
            <h4 className="font-medium mb-2">Méthodes :</h4>
            {currentClass.methods.map((method, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder="Nom"
                  value={method.name}
                  onChange={(e) => handleMethodChange(index, 'name', e.target.value)}
                  className="border p-2 mr-2"
                />
                <select
                  value={method.returnType}
                  onChange={(e) => handleMethodChange(index, 'returnType', e.target.value)}
                  className="border p-2"
                >
                  <option value="">Sélectionnez le type de retour</option>
                  {typesOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button type="button" onClick={addMethod} className="bg-blue-500 text-white px-2 py-1 mt-2">
              + Ajouter une méthode
            </button>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
          >
            Enregistrer la classe
          </button>
        </form>
      </div>
    )}
    {showLinkForm && (
      <div
        style={{
          position: 'absolute',
          top: linkFormPosition.y,
          left: linkFormPosition.x,
          backgroundColor: 'white',
          padding: '16px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold mb-2">Type d&apos;association</h3>
        <form onSubmit={handleLinkFormSubmit}>
          <div>
            <label className="block mb-2">Type :</label>
            <select
              value={selectedLinkType}
              onChange={(e) => setSelectedLinkType(e.target.value)}
              className="border p-2 mb-4 w-full"
            >
              {associationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Multiplicité (De) :</label>
            <input
              type="text"
              value={fromMultiplicity}
              onChange={(e) => setFromMultiplicity(e.target.value)}
              className="border p-2 mb-4 w-full"
            />  
          </div>
          <div>
            <label className="block mb-2">Multiplicité (À) :</label>
            <input
              type="text"
              value={toMultiplicity}
              onChange={(e) => setToMultiplicity(e.target.value)}
              className="border p-2 mb-4 w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
          >
            Enregistrer
          </button>
        </form>
      </div>
    )}
  </div>
  <div className='flex flex-col items-center justify-center w-[15%] h-screen bg-gray-800 text-white'>

  <button 
    onClick={handleGenerateCode} 
    className="bg-blue-400 text-white p-2 rounded-lg m-4 self-start h-16"
    >
    Generate Java Code
  </button>
  {/* <button 
    onClick={handleGenerateCode} 
    className="bg-yellow-400 text-white p-2 rounded-lg m-4 self-start h-16"
    >
    Generate Java Python
  </button>
  <button 
    onClick={handleGenerateCode} 
    className="bg-red-300 text-white p-2 rounded-lg m-4 self-start h-16"
    >
    Generate Java Php
  </button> */}
    </div>

</div>
  );
};
