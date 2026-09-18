import { useId } from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  title?: string;
}

/**
 * TableView.dev Brand Mark.
 *
 * Geometric tabular identity mark:
 * - Rounded squircle canvas with deep indigo gradient
 * - White architectural table header bar
 * - Solid structured data column on the left
 * - Dual analytical cells on the right with an electric sky-blue active calculation highlight
 */
export function BrandLogo({ size = 32, className = '', title = 'TableView.dev' }: BrandLogoProps) {
  const id = useId();
  const bgGradId = `tv-bg-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={bgGradId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop stopColor="#3730a3" />
        </linearGradient>
      </defs>

      {/* Squircle base with subtle edge highlight */}
      <rect width="32" height="32" rx="8" fill={`url(#${bgGradId})`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#ffffff" strokeOpacity="0.18" />

      {/* Tabular Header Bar */}
      <rect x="6" y="6" width="20" height="4.5" rx="2.2" fill="#ffffff" />

      {/* Left Data Column Pillar */}
      <rect x="6" y="13.5" width="8.5" height="12.5" rx="2.2" fill="#ffffff" fillOpacity="0.95" />

      {/* Right Top Cell: Active Calculation / Data Highlight */}
      <rect x="17.5" y="13.5" width="8.5" height="5" rx="2.2" fill="#38bdf8" />

      {/* Right Bottom Cell */}
      <rect x="17.5" y="21" width="8.5" height="5" rx="2.2" fill="#ffffff" fillOpacity="0.65" />
    </svg>
  );
}

export default BrandLogo;
