import { describe, it, expect } from 'vitest';
import { 
  sleep, 
  getAbsoluteRect, 
  cloneElementWithNewIds, 
  updateElementRecursively, 
  insertNodeIntoParent, 
  deleteFromList,
  normalizeStyleProperties
} from './utils';
import { UIElement } from '../types';

describe('utils', () => {
  describe('sleep', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      await sleep(50);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(45); // Allow some tolerance
    });
  });

  describe('getAbsoluteRect', () => {
    it('should calculate absolute position for nested elements', () => {
      const elements: UIElement[] = [
        {
          id: 'parent',
          type: 'container',
          name: 'Parent',
          props: {},
          style: { left: 100, top: 50 },
          children: [
            {
              id: 'child',
              type: 'box',
              name: 'Child',
              props: {},
              style: { left: 20, top: 30 },
              children: []
            }
          ]
        }
      ];

      const rect = getAbsoluteRect('child', elements);
      expect(rect).toEqual({ x: 120, y: 80, w: 100, h: 50 });
    });

    it('should return null for non-existent element', () => {
      const elements: UIElement[] = [];
      const rect = getAbsoluteRect('nonexistent', elements);
      expect(rect).toBeNull();
    });
  });

  describe('cloneElementWithNewIds', () => {
    it('should create a deep clone with new ID', () => {
      const original: UIElement = {
        id: 'original',
        type: 'box',
        name: 'Test Box',
        props: { text: 'Hello' },
        style: { width: 100, height: 50 },
        children: []
      };

      const clone = cloneElementWithNewIds(original);
      
      expect(clone.id).not.toBe(original.id);
      expect(clone.name).toBe(original.name);
      expect(clone.props).toEqual(original.props);
      expect(clone.style).toEqual(original.style);
    });

    it('should clone nested children with new IDs', () => {
      const original: UIElement = {
        id: 'parent',
        type: 'container',
        name: 'Parent',
        props: {},
        style: {},
        children: [
          {
            id: 'child1',
            type: 'box',
            name: 'Child 1',
            props: {},
            style: {},
            children: []
          }
        ]
      };

      const clone = cloneElementWithNewIds(original);
      
      expect(clone.id).not.toBe(original.id);
      expect(clone.children?.[0].id).not.toBe(original.children?.[0].id);
    });
  });

  describe('updateElementRecursively', () => {
    it('should update element by ID', () => {
      const elements: UIElement[] = [
        {
          id: 'elem1',
          type: 'box',
          name: 'Original',
          props: {},
          style: {},
          children: []
        }
      ];

      const updated = updateElementRecursively(elements, 'elem1', (el) => ({
        ...el,
        name: 'Updated'
      }));

      expect(updated[0].name).toBe('Updated');
    });

    it('should update nested elements', () => {
      const elements: UIElement[] = [
        {
          id: 'parent',
          type: 'container',
          name: 'Parent',
          props: {},
          style: {},
          children: [
            {
              id: 'child',
              type: 'box',
              name: 'Child',
              props: {},
              style: {},
              children: []
            }
          ]
        }
      ];

      const updated = updateElementRecursively(elements, 'child', (el) => ({
        ...el,
        name: 'Updated Child'
      }));

      expect(updated[0].children?.[0].name).toBe('Updated Child');
    });
  });

  describe('insertNodeIntoParent', () => {
    it('should insert node into specified parent', () => {
      const elements: UIElement[] = [
        {
          id: 'parent',
          type: 'container',
          name: 'Parent',
          props: {},
          style: {},
          children: []
        }
      ];

      const newNode: UIElement = {
        id: 'new',
        type: 'box',
        name: 'New',
        props: {},
        style: {},
        children: []
      };

      const result = insertNodeIntoParent(elements, 'parent', newNode);
      
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children?.[0].id).toBe('new');
    });
  });

  describe('deleteFromList', () => {
    it('should delete element by ID', () => {
      const elements: UIElement[] = [
        {
          id: 'toDelete',
          type: 'box',
          name: 'Delete Me',
          props: {},
          style: {},
          children: []
        },
        {
          id: 'keep',
          type: 'box',
          name: 'Keep Me',
          props: {},
          style: {},
          children: []
        }
      ];

      const result = deleteFromList(elements, 'toDelete');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('keep');
    });

    it('should delete nested elements', () => {
      const elements: UIElement[] = [
        {
          id: 'parent',
          type: 'container',
          name: 'Parent',
          props: {},
          style: {},
          children: [
            {
              id: 'toDelete',
              type: 'box',
              name: 'Delete',
              props: {},
              style: {},
              children: []
            }
          ]
        }
      ];

      const result = deleteFromList(elements, 'toDelete');
      
      expect(result[0].children).toHaveLength(0);
    });
  });

  describe('normalizeStyleProperties', () => {
    it('should convert kebab-case to camelCase', () => {
      const input = {
        'background-color': 'red',
        'font-size': 16,
        'align-items': 'center'
      };

      const normalized = normalizeStyleProperties(input as any);
      
      expect(normalized.backgroundColor).toBe('red');
      expect(normalized.fontSize).toBe(16);
      expect(normalized.alignItems).toBe('center');
    });

    it('should handle undefined input', () => {
      const result = normalizeStyleProperties(undefined);
      expect(result).toEqual({});
    });

    it('should preserve already camelCase properties', () => {
      const input = {
        backgroundColor: 'blue',
        fontSize: 14
      };

      const normalized = normalizeStyleProperties(input);
      
      expect(normalized.backgroundColor).toBe('blue');
      expect(normalized.fontSize).toBe(14);
    });
  });
});
