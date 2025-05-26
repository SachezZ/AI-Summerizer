const Header = ({ title }) => {
  return (
    <header className="bg-gray-700 text-white py-4 text-left px-6 shadow-md">
      <h1 className="text-3xl font-bold">{title}</h1>
    </header>
  );
};

export default Header;
