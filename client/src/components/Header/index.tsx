import React from "react";

type Props = {
  name: string;
  buttonComponent?: React.ReactNode;
  isSmallText?: boolean;
  subtitle?: string;
};

const Header = ({ name, buttonComponent, isSmallText = false, subtitle }: Props) => {
  return (
    <div className="mb-6 flex w-full items-center justify-between">
      <div>
        <h1
          className={`${
            isSmallText ? "text-lg" : "text-2xl"
          } font-semibold tracking-tight text-gray-900 dark:text-white`}
        >
          {name}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {buttonComponent && (
        <div className="flex items-center gap-2">
          {buttonComponent}
        </div>
      )}
    </div>
  );
};

export default Header;
