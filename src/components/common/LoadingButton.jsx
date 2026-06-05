import { Loader2 } from 'lucide-react';

const LoadingButton = ({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    aria-busy={isLoading}
    className={className}
    {...props}
  >
    {isLoading ? (
      <>
        <Loader2 size={18} className="animate-spin" />
        {loadingText}
      </>
    ) : (
      <>
        {Icon && <Icon size={18} />}
        {children}
      </>
    )}
  </button>
);

export default LoadingButton;
