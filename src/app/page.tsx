import React from 'react';

const Header = () => {
  return (
    <header className="bg-blue-500 text-white p-4">
      <h1 className="text-xl font-bold">Twitter-like</h1>
    </header>
  );
};

export default Header;
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-4">
      <p className="text-center">&copy; 2023 Twitter-like. All rights reserved.</p>
    </footer>
  );
};

export { Footer };