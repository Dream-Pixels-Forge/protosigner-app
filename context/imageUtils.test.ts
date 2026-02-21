import { describe, it, expect } from 'vitest';
import { getRandomImage, ensureImageSource } from './imageUtils';

describe('imageUtils', () => {
  describe('getRandomImage', () => {
    it('should return a valid image path', () => {
      const image = getRandomImage();
      expect(image).toMatch(/^\/assets\/\d+ \(\d+\)\.jpg$/);
    });

    it('should return different images on multiple calls', () => {
      const images = new Set();
      for (let i = 0; i < 20; i++) {
        images.add(getRandomImage());
      }
      // Should have some variety (not guaranteed to be all unique, but likely)
      expect(images.size).toBeGreaterThan(1);
    });
  });

  describe('ensureImageSource', () => {
    it('should add source to image elements without src', () => {
      const element = {
        type: 'image' as const,
        props: { alt: 'Test' }
      };

      const result = ensureImageSource(element);
      
      expect(result.props).toHaveProperty('src');
      expect(result.props.src).toMatch(/^\/assets\//);
    });

    it('should preserve existing image source', () => {
      const element = {
        type: 'image' as const,
        props: { src: '/custom/image.jpg', alt: 'Test' }
      };

      const result = ensureImageSource(element);
      
      expect(result.props.src).toBe('/custom/image.jpg');
    });

    it('should handle elements without props', () => {
      const element = {
        type: 'image' as const
      };

      const result = ensureImageSource(element);
      
      expect(result.props).toHaveProperty('src');
    });

    it('should recursively process children', () => {
      const element = {
        type: 'container' as const,
        props: {},
        children: [
          {
            type: 'image' as const,
            props: {}
          },
          {
            type: 'text' as const,
            props: { text: 'Hello' }
          }
        ]
      };

      const result = ensureImageSource(element);
      
      expect(result.children?.[0].props).toHaveProperty('src');
    });

    it('should handle nested containers', () => {
      const element = {
        type: 'container' as const,
        props: {},
        children: [
          {
            type: 'container' as const,
            props: {},
            children: [
              {
                type: 'image' as const,
                props: {}
              }
            ]
          }
        ]
      };

      const result = ensureImageSource(element);
      
      expect(result.children?.[0].children?.[0].props).toHaveProperty('src');
    });

    it('should return non-image elements unchanged', () => {
      const element = {
        type: 'text' as const,
        props: { text: 'Hello' }
      };

      const result = ensureImageSource(element);
      
      expect(result).toEqual(element);
    });
  });
});
