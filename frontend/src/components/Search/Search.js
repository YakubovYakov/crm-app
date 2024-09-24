import React, { useState } from "react";
import "./Search.css";
import search from "../../images/search.svg";

function Search({ onSearch }) {
  const [searchItem, setSearchItem] = useState("");

  const handleInputChange = (e) => {
    setSearchItem(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchItem);
  };

  const handleIconClick = (e) => {
    e.preventDefault();
    onSearch(searchItem);
  };

  return (
    <section className="search">
      <form className="search__form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Поиск по ФИО"
          value={searchItem}
          onChange={handleInputChange}
          className="search__input"
        />
				
        <img
          src={search}
          alt="search"
          className="search__icon"
          onClick={handleIconClick}
        />
      </form>
    </section>
  );
}

export default Search;
