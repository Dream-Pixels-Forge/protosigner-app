
import { UIElement } from '../types';

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const getAbsoluteRect = (targetId: string, nodes: UIElement[], parentX = 0, parentY = 0): { x: number, y: number, w: number, h: number } | null => {
  for (const node of nodes) {
    const parse = (val: string | number | undefined) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return parseFloat(val) || 0;
        return 0;
    };
    const x = parentX + parse(node.style?.left);
    const y = parentY + parse(node.style?.top);
    const w = parse(node.style?.width) || 100;
    const h = parse(node.style?.height) || 50;

    if (node.id === targetId) return { x, y, w, h };
    if (node.children) {
      const result = getAbsoluteRect(targetId, node.children, x, y);
      if (result) return result;
    }
  }
  return null;
};

export const cloneElementWithNewIds = (el: UIElement): UIElement => {
    const newId = Math.random().toString(36).substr(2, 9);
    return {
        ...el,
        id: newId,
        children: el.children?.map(cloneElementWithNewIds)
    };
};

export const updateElementRecursively = (els: UIElement[], targetId: string, updater: (el: UIElement) => UIElement): UIElement[] => {
    return els.map(el => {
      if (el.id === targetId) return updater(el);
      if (el.children) return { ...el, children: updateElementRecursively(el.children, targetId, updater) };
      return el;
    });
};

export const insertNodeIntoParent = (els: UIElement[], parentId: string, newNode: UIElement): UIElement[] => {
    return els.map(el => {
        if (el.id === parentId) return { ...el, children: [...(el.children || []), newNode] };
        if (el.children) return { ...el, children: insertNodeIntoParent(el.children, parentId, newNode) };
        return el;
    });
};


export const deleteFromList = (list: UIElement[], id: string): UIElement[] => {
    const filtered = list.filter(el => el.id !== id);
    return filtered.map(el => {
      if (el.children) return { ...el, children: deleteFromList(el.children, id) };
      return el;
    });
};

// Convert kebab-case CSS properties to camelCase (e.g., "align-items" -> "alignItems")
// This fixes React warnings about unsupported style properties
export const normalizeStyleProperties = (style: React.CSSProperties | undefined): React.CSSProperties => {
    if (!style) return {};

    const normalized: React.CSSProperties = {};
    const kebabToCamelMap: Record<string, string> = {
        'align-items': 'alignItems',
        'justify-content': 'justifyContent',
        'background-color': 'backgroundColor',
        'background-image': 'backgroundImage',
        'background-size': 'backgroundSize',
        'border-radius': 'borderRadius',
        'border-width': 'borderWidth',
        'border-color': 'borderColor',
        'border-style': 'borderStyle',
        'box-shadow': 'boxShadow',
        'flex-direction': 'flexDirection',
        'flex-wrap': 'flexWrap',
        'font-size': 'fontSize',
        'font-weight': 'fontWeight',
        'font-family': 'fontFamily',
        'line-height': 'lineHeight',
        'letter-spacing': 'letterSpacing',
        'text-align': 'textAlign',
        'text-color': 'textColor',
        'margin-top': 'marginTop',
        'margin-bottom': 'marginBottom',
        'margin-left': 'marginLeft',
        'margin-right': 'marginRight',
        'padding-top': 'paddingTop',
        'padding-bottom': 'paddingBottom',
        'padding-left': 'paddingLeft',
        'padding-right': 'paddingRight',
        'max-width': 'maxWidth',
        'min-width': 'minWidth',
        'max-height': 'maxHeight',
        'min-height': 'minHeight',
        'z-index': 'zIndex',
        'object-fit': 'objectFit',
        'overflow-x': 'overflowX',
        'overflow-y': 'overflowY',
        'transition-duration': 'transitionDuration',
        'transition-delay': 'transitionDelay',
        'animation-name': 'animationName',
        'animation-duration': 'animationDuration',
        'animation-delay': 'animationDelay',
        'animation-iteration-count': 'animationIterationCount',
        'animation-timing-function': 'animationTimingFunction',
        'animation-fill-mode': 'animationFillMode'
    };

    for (const [key, value] of Object.entries(style)) {
        const styleKey = key as keyof React.CSSProperties;
        const camelKey = kebabToCamelMap[key] || styleKey;
        if (camelKey) {
            (normalized as any)[camelKey] = value;
        }
    }

    return normalized;
};
