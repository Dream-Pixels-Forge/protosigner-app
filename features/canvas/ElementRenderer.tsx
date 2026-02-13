
import React from 'react';
import { UIElement } from '../../types';
import { SelectableWrapper } from './SelectableWrapper';
import { useEditor } from '../../context/EditorContext';

interface ElementRendererProps {
  element: UIElement;
  zoom: number;
  parentLayout?: string; // Passed down from parent element
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, zoom, parentLayout = 'block' }) => {
  const { 
    selectedId, 
    selectElement, 
    updateElementStyle
  } = useEditor();

  const commonProps = {
    id: element.id,
    name: element.name,
    selectedId,
    onSelect: selectElement,
    zoom,
    initialStyle: element.style,
    onUpdate: updateElementStyle,
    isLocked: element.isLocked,
    parentLayout, // Pass the context of the PARENT to the wrapper
    animation: element.props.animation // Pass animation settings from props
  };

  // Determine the layout mode of THIS element to pass to children
  const currentLayout = element.style?.display || 'block';

  const renderChildren = () => {
    return element.children?.map(child => (
      <ElementRenderer 
        key={child.id} 
        element={child} 
        zoom={zoom} 
        parentLayout={currentLayout} // Pass THIS element's display as the parent layout for children
      />
    ));
  };

  const renderContent = () => {
      switch (element.type) {
          case 'text':
              return element.props.text;
          case 'button':
              return element.props.label || 'Button';
          default:
              return null;
      }
  };

  if (element.type === 'image') {
      return (
          <SelectableWrapper {...commonProps}>
              <img 
                src={element.props.src || 'https://via.placeholder.com/150'} 
                alt={element.props.alt || element.name}
                className="w-full h-full pointer-events-none" 
                style={{ objectFit: (element.style?.objectFit as any) || 'cover' }}
              />
              {renderChildren()}
          </SelectableWrapper>
      );
  }

  if (element.type === 'button') {
      return (
          <SelectableWrapper {...commonProps}>
              <button className="w-full h-full flex items-center justify-center pointer-events-none whitespace-nowrap">
                  {renderContent()}
              </button>
              {renderChildren()}
          </SelectableWrapper>
      );
  }
  
  return (
    <SelectableWrapper {...commonProps}>
      {renderContent()}
      {renderChildren()}
    </SelectableWrapper>
  );
};
