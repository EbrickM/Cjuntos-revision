import { emojiIconMap } from './IconHelperUtils';

export function EmojiIcon({ emoji, size = 18, className = '' }) {
  const IconComponent = emojiIconMap[emoji];
  if (!IconComponent) return <span>{emoji}</span>;
  return <IconComponent size={size} className={className} />;
}
