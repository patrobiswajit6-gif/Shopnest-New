import React from 'react'
import { Link } from 'react-router-dom'

const ICONS = {
  beauty: '💄',
  fragrances: '🌸',
  furniture: '🛋️',
  groceries: '🛒',
  'home-decoration': '🏺',
  kitchen: '🍳',
  laptops: '💻',
  mens: '👔',
  mobile: '📱',
  motorcycle: '🏍️',
  skin: '🧴',
  smartphones: '📱',
  tablets: '📱',
  tops: '👕',
  vehicle: '🚗',
  watches: '⌚',
  womens: '👗',
  bags: '👜',
  jewellery: '💍',
  shoes: '👟',
  sunglasses: '🕶️',
  shirts: '👔',
  dresses: '👗',
  default: '🛍️'
}

function pickIcon(slug) {
  const match = Object.keys(ICONS).find((key) => slug.includes(key))
  return ICONS[match] || ICONS.default
}

export default function CategoryCard({ category }) {
  return (
    <Link to={`/category/${category.slug}`} className="category-card">
      <span className="category-card-icon">{pickIcon(category.slug)}</span>
      <span className="category-card-label">{category.name}</span>
      <style>{`
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 18px 10px;
          background: var(--paper-raised);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          text-align: center;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-card);
        }
        .category-card-icon {
          font-size: 26px;
        }
        .category-card-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--navy-deep);
          text-transform: capitalize;
        }
      `}</style>
    </Link>
  )
}
