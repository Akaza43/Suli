"use client";

import Image from 'next/image';
import { useState } from 'react';
import { investingData } from '../modul-level-1/data';
import { blockchainData } from '../modul-level-2/data';
import { lev3Data } from '../modul-level-3/data';
import { liveclassData } from '../modul-level-4/data';
import { MdKeyboardArrowDown } from 'react-icons/md';

export default function AllClassesPage() {
  const [imgError, setImgError] = useState({});
  const [isGrid, setIsGrid] = useState(false); // default scroll (bukan grid)

  // Gabungkan semua data modul
  const allClasses = [
    ...investingData,
    ...blockchainData,
    ...lev3Data,
    ...liveclassData,
  ];

  function handleImageError(link) {
    setImgError((prev) => ({ ...prev, [link]: true }));
  }

  function toggleLayout() {
    setIsGrid((prev) => !prev);
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1
          onClick={toggleLayout}
          className="text-sm md:text-2xl font-bold text-white mb-2 md:mb-6 cursor-pointer hover:opacity-80 transition-opacity"
        >
          All Classes
        </h1>
        <button
          onClick={toggleLayout}
          className="mb-2 md:mb-6 text-white hover:opacity-80 transition-opacity"
        >
          <MdKeyboardArrowDown
            className={`text-xl md:text-3xl transform transition-transform duration-300 ${isGrid ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={
          isGrid
            ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-6"
            : "flex overflow-x-auto gap-2 md:gap-6 pb-2 md:pb-4 scrollbar-hide"
        }
      >
        {allClasses.map((item, index) => (
          <a
            key={index}
            href={item.link}
            rel="noopener noreferrer"
            className={
              isGrid
                ? "overflow-hidden hover:scale-[1.02] transition-transform rounded-lg md:rounded-xl w-full"
                : "overflow-hidden hover:scale-[1.02] transition-transform rounded-lg md:rounded-xl flex-none w-44 md:w-80"
            }
          >
            <div className="aspect-video relative rounded-md md:rounded-lg overflow-hidden">
              {imgError[item.link] ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <span className="text-[8px] md:text-base text-gray-400 text-center p-2">
                    {item.title}
                  </span>
                </div>
              ) : (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 176px, 320px"
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(item.link)}
                />
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
