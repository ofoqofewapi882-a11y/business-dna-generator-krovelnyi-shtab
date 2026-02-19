import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 md:p-10 text-center shadow-lg">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">🏠 Кровельный Штаб</h1>
      <p className="opacity-90 text-sm md:text-base font-light max-w-2xl mx-auto">
        Центр управления проектом Студии Кровли
      </p>
    </div>
  );
};

export default Header;
