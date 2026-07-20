/**
 * components/common/LoadingSpinner.jsx - Composant de chargement
 */

const LoadingSpinner = ({ size = 'medium', text = '' }) => {
  const sizes = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} border-[rgb(var(--color-border))] border-t-[rgb(var(--color-primary))] rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-[rgb(var(--color-text-muted))]">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
