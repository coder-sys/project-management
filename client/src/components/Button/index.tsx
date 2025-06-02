import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ className = '', children, ...props }) => {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
