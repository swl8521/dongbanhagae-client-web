import { extractConditionTags } from '../lib/petConditionTags';
import './ConditionTags.css';

export default function ConditionTags({ item, limit }) {
  const tags = extractConditionTags(item);
  const shown = limit ? tags.slice(0, limit) : tags;

  if (shown.length === 0) return null;

  return (
    <ul className="condition-tags">
      {shown.map((tag) => (
        <li key={tag.key} className={`condition-tag condition-tag--${tag.tone}`}>
          {tag.label}
        </li>
      ))}
    </ul>
  );
}
