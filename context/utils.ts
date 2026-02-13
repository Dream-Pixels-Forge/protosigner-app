
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
