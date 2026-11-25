export function coverRect({ container, image }) {
  const scale = Math.max(container.width / image.width, container.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;

  return {
    left: (container.width - width) / 2,
    top: (container.height - height) / 2,
    width,
    height,
  };
}

export function coverPoint({ container, image, x, y }) {
  const rect = coverRect({ container, image });

  return {
    left: rect.left + x * rect.width,
    top: rect.top + y * rect.height,
  };
}
