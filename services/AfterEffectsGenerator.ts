
import { UIElement, ProjectSettings } from '../types';

export class AfterEffectsGenerator {
  static generateScript(elements: UIElement[], settings: ProjectSettings): string {
    const compName = "Protosigner_HUD_Export";
    const width = settings.pageSize.width;
    const height = settings.pageSize.height;
    const fps = 30;
    const duration = 10; // seconds

    let script = `
    {
      app.beginUndoGroup("Import Protosigner HUD");

      // 1. Create Composition
      var comp = app.project.items.addComp("${compName}", ${width}, ${height}, 1, ${duration}, ${fps});
      comp.openInViewer();
      
      var layers = [];
    `;

    // 2. Helper Functions (Hex to RGB 0-1)
    script += `
      function hexToRgb(hex) {
        var result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        ] : [1, 1, 1];
      }
    `;

    // 3. Traverse and generate layers (Reverse order so top in DOM is top in AE)
    // Flatten tree for simplicity in this version, or handle parenting
    const flatten = (nodes: UIElement[], parentId: string | null = null): (UIElement & { parentId: string | null })[] => {
        let flat: (UIElement & { parentId: string | null })[] = [];
        nodes.forEach(node => {
            flat.push({ ...node, parentId });
            if (node.children) {
                flat = flat.concat(flatten(node.children, node.id));
            }
        });
        return flat;
    };

    const flatList = flatten(elements); // We iterate normally; AE layers added stack on top

    // In AE, layers added via code stack on top. 
    // HTML: Last child is on top. 
    // We should iterate the flat list naturally? 
    // Let's iterate normally.
    
    flatList.forEach((el) => {
        if (el.style?.display === 'none') return;
        if (el.type === 'page') return; // Skip page container

        const safeName = el.name.replace(/"/g, '\\"');
        const x = parseFloat(String(el.style?.left || 0)) || (width / 2); // Default to center if no pos
        const y = parseFloat(String(el.style?.top || 0)) || (height / 2);
        const w = parseFloat(String(el.style?.width || 100));
        const h = parseFloat(String(el.style?.height || 100));
        const opacity = (parseFloat(String(el.style?.opacity || 1)) * 100);
        const rotation = parseFloat(String(el.style?.rotate || 0));
        
        const bgColor = el.style?.backgroundColor || '#ffffff';
        const borderColor = el.style?.borderColor || '#ffffff';
        const borderWidth = parseFloat(String(el.style?.borderWidth || 0));

        // --- TEXT LAYERS ---
        if (el.type === 'text' || el.type === 'button') {
            const textContent = (el.props.text || el.props.label || 'Text').replace(/\n/g, '\\r');
            const fontSize = parseFloat(String(el.style?.fontSize || 24));
            const textColor = el.style?.color || '#ffffff';
            
            script += `
            // Layer: ${safeName}
            var textLayer = comp.layers.addText("${textContent}");
            textLayer.name = "${safeName}";
            var textProp = textLayer.property("Source Text");
            var textDocument = textProp.value;
            textDocument.fontSize = ${fontSize};
            textDocument.fillColor = hexToRgb("${textColor}");
            textDocument.font = "Arial"; // Fallback font
            textProp.setValue(textDocument);
            
            textLayer.property("Position").setValue([${x + (w/2)}, ${y + (h/2)}]); // Approx text centering
            textLayer.property("Opacity").setValue(${opacity});
            textLayer.property("Rotation").setValue(${rotation});
            `;
        } 
        
        // --- SHAPE LAYERS (Box, Container, Circle, Rectangle) ---
        else {
            const isCircle = el.type === 'circle';
            const shapeType = isCircle ? 'Ellipse' : 'Rect';
            
            script += `
            // Layer: ${safeName}
            var shapeLayer = comp.layers.addShape();
            shapeLayer.name = "${safeName}";
            
            var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
            var shapePath = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - ${shapeType}");
            
            // Size
            var size = [${w}, ${h}];
            ${isCircle ? '' : `shapePath.property("Size").setValue(size);`} 
            ${isCircle ? `shapePath.property("Size").setValue([${w}, ${w}]);` : ''} 
            
            // Fill
            if ("${bgColor}" !== "transparent" && "${bgColor}" !== "rgba(0,0,0,0)") {
                var fill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
                fill.property("Color").setValue(hexToRgb("${bgColor}"));
            }

            // Stroke
            if (${borderWidth} > 0) {
                var stroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
                stroke.property("Color").setValue(hexToRgb("${borderColor}"));
                stroke.property("Stroke Width").setValue(${borderWidth});
            }

            // Transform
            shapeLayer.property("Position").setValue([${x + (w/2)}, ${y + (h/2)}]);
            shapeLayer.property("Opacity").setValue(${opacity});
            shapeLayer.property("Rotation").setValue(${rotation});
            `;
        }
    });

    script += `
      app.endUndoGroup();
    }
    `;

    return script;
  }
}
