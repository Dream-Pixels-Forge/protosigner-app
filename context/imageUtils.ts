// Available images in public/assets
const ASSET_IMAGES = [
  '/assets/1 (1).jpg',
  '/assets/1 (2).jpg',
  '/assets/1 (3).jpg',
  '/assets/1 (4).jpg',
  '/assets/1 (5).jpg',
  '/assets/1 (6).jpg',
  '/assets/1 (7).jpg',
  '/assets/1 (8).jpg',
  '/assets/1 (9).jpg',
  '/assets/1 (10).jpg'
];

export const getRandomImage = (): string => {
  const randomIndex = Math.floor(Math.random() * ASSET_IMAGES.length);
  return ASSET_IMAGES[randomIndex];
};

export const ensureImageSource = (element: any): any => {
  if (element.type === 'image' && (!element.props || !element.props.src)) {
    return {
      ...element,
      props: {
        ...element.props,
        src: getRandomImage(),
        alt: element.props?.alt || 'Image'
      }
    };
  }
  
  // Recursively check children
  if (element.children && Array.isArray(element.children)) {
    return {
      ...element,
      children: element.children.map(ensureImageSource)
    };
  }
  
  return element;
};
