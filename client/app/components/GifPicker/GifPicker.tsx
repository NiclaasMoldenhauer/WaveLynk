"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ onGifSelect }) => {
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchTrendingGifs();
  }, []);

  useEffect(() => {
    if (search) {
      fetchGifs(search);
    } else if (selectedCategory) {
      fetchGifs(selectedCategory);
    }
  }, [search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/tenor?endpoint=categories");
      setCategories([
        "Favoriten",
        "Angesagte GIFs",
        ...response.data.tags.map((tag: any) => tag.name),
      ]);
      setError(null);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Unable to load GIF categories. Please try again later.");
    }
  };

  const fetchGifs = async (query: string) => {
    try {
      const response = await axios.get(
        `/api/tenor?endpoint=search&q=${encodeURIComponent(query)}`
      );
      setGifs(response.data.results);
      setError(null);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
      setError("Unable to load GIFs. Please try again later.");
    }
  };

  const fetchTrendingGifs = async () => {
    try {
      const response = await axios.get("/api/tenor?endpoint=trending");
      setGifs(response.data.results);
      setError(null);
    } catch (error) {
      console.error("Error fetching trending GIFs:", error);
      setError("Unable to load trending GIFs. Please try again later.");
    }
  };

  return (
    <div
      className="gif-picker bg-gray-800 text-white rounded-lg shadow-lg"
      style={{ width: "400px", height: "500px" }}
    >
      <div className="flex p-2 border-b border-gray-700">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tenor durchsuchen"
          className="w-full p-2 bg-gray-700 rounded text-white"
        />
      </div>
      <div className="flex h-[calc(100%-56px)]">
        <div className="w-1/3 p-2 border-r border-gray-700 overflow-y-auto">
          {categories.map((category) => (
            <div
              key={category}
              className={`p-2 cursor-pointer rounded ${
                selectedCategory === category
                  ? "bg-blue-500"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </div>
          ))}
        </div>
        <div className="w-2/3 p-2 overflow-y-auto">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif: any) => (
              <img
                key={gif.id}
                src={gif.media_formats.tinygif.url}
                alt={gif.content_description}
                onClick={() => onGifSelect(gif.media_formats.gif.url)}
                className="w-full h-auto cursor-pointer rounded"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GifPicker;
