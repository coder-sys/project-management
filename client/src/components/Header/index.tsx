import React from "react";

type Props = {
  name: string;
  buttonComponent?: React.ReactNode;
  isSmallText?: boolean;
};

const Header = ({ name, buttonComponent, isSmallText = false }: Props) => {
  return (
    <div className="mb-6 flex w-full items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold tracking-tight text-gray-900 dark:text-white`}
      >
        {name}
      </h1>
      {buttonComponent && (
        <div className="flex items-center gap-2">
          {buttonComponent}
        </div>
      )}
    </div>
  );
};

export default Header;
