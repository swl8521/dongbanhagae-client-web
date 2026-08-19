import { useRef, useState } from 'react';
import './ImageGallery.css';

export default function ImageGallery({ images, alt }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  function handleScroll() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="image-gallery">
      <div className="image-gallery__track" ref={trackRef} onScroll={handleScroll}>
        {images.map((img, i) => (
          <img
            key={img.url}
            src={img.url}
            alt={`${alt} 사진 ${i + 1}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="image-gallery__img"
          />
        ))}
      </div>

      {images.length > 1 && (
        <div className="image-gallery__dots">
          {images.map((img, i) => (
            <span
              key={img.url}
              className={`image-gallery__dot ${i === activeIndex ? 'image-gallery__dot--active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
