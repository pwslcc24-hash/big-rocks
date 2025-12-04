import React from 'react';

// Determine if text should be white or black based on background color
function getContrastColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default function TagBadge({ tag, onRemove, size = "sm" }) {
  const textColor = getContrastColor(tag.color);
  const sizeClasses = size === "sm" 
    ? "text-[10px] px-1.5 py-0.5" 
    : "text-xs px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: tag.color, color: textColor }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
          className="hover:opacity-70 ml-0.5"
        >
          ×
        </button>
      )}
    </span>
  );
}