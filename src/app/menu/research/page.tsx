"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Loading from "@/ui/loading";
import { AccessButton } from "@/components/buttons/AccessButton";
import { createClient } from "@supabase/supabase-js";
import { FaSearch } from "react-icons/fa";

export interface GridItem {
  id: number;
  title: string;
  image: string;
  link: string;
  category: string;
}

// Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ReusableGrid = ({ data }: { data: GridItem[] }) => {
  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-b from-white/[0.02] via-black/90 to-black/95 rounded-xl overflow-hidden hover:-translate-y-1 transition-transform cursor-pointer border border-gray-800/40"
            >
              <img
                src={item.image.startsWith("http") ? item.image : `/images/${item.image}`}
                alt={item.title}
                className="w-full h-auto object-contain"
              />
              <div className="p-4">
                <span className="text-xs font-semibold text-blue-400">{item.category}</span>
                <h3 className="font-semibold mt-1 text-white">{item.title}</h3>
                <button
                  onClick={() => window.open(item.link, "_blank")}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <span>View Research</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ResearchPage() {
  const { data: session, status } = useSession();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [beginnerData, setBeginnerData] = useState<GridItem[]>([]);
  const [deepDiveData, setDeepDiveData] = useState<GridItem[]>([]);
  const [researchData, setResearchData] = useState<GridItem[]>([]);
  const [filter, setFilter] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState(""); // state tambahan

  // Check access
  useEffect(() => {
    const checkAccess = async () => {
      if (session?.accessToken) {
        try {
          const response = await fetch("/api/verify-role", {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });

          if (!response.ok && response.status === 429) {
            setTimeout(checkAccess, 5000);
            return;
          }

          if (response.ok) {
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        } catch (error) {
          console.error("Error verifying role:", error);
          setHasAccess(false);
        }
      } else {
        setHasAccess(false);
      }
      setLoading(false);
    };

    if (status === "authenticated") {
      checkAccess();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setHasAccess(false);
    }
  }, [session, status]);

  // Fetch data from beginnersuli & deepdrivesuli
  useEffect(() => {
    if (hasAccess) {
      const fetchData = async () => {
        const { data: beginner, error: beginnerErr } = await supabase
          .from("beginnersuli")
          .select("id, title, image, link, category")
          .order("id", { ascending: false });

        const { data: deepDive, error: deepErr } = await supabase
          .from("deepdrivesuli")
          .select("id, title, image, link, category")
          .order("id", { ascending: false });

        if (beginnerErr) console.error(beginnerErr);
        if (deepErr) console.error(deepErr);

        setBeginnerData(beginner || []);
        setDeepDiveData(deepDive || []);
      };

      fetchData();
    }
  }, [hasAccess]);

  // Update researchData when filter changes
  useEffect(() => {
    if (filter === "Semua") {
      setResearchData([...beginnerData, ...deepDiveData]);
    } else if (filter === "Beginner") {
      setResearchData(beginnerData);
    } else if (filter === "Deep Dive") {
      setResearchData(deepDiveData);
    }
  }, [filter, beginnerData, deepDiveData]);

  // hasil filter search
  const filteredData = researchData.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || status === "loading") return <Loading />;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="auth-box bg-zinc-950/90 p-8 rounded-2xl backdrop-blur-md max-w-md w-full border border-zinc-900">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Login untuk Akses Penuh
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Silahkan login untuk mengakses semua fitur premium kami:
            <ul className="mt-2 space-y-1">
              <li className="flex items-center gap-2"><span className="text-purple-400">•</span> Modul pembelajaran crypto</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Research dan analisis pasar</li>
              <li className="flex items-center gap-2"><span className="text-green-400">•</span> Komunitas ekslusif</li>
            </ul>
          </p>
          <button
            onClick={() => signIn("discord")}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <i className="fas fa-lock-open mr-2"></i> Masuk dengan Discord
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="auth-box bg-zinc-950/90 p-8 rounded-2xl backdrop-blur-md max-w-md w-full border border-zinc-900">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-6">
            Akses Ditolak
          </h2>
          <p className="text-gray-400 mb-6">
            Anda tidak memiliki akses ke halaman ini. Silakan hubungi admin untuk informasi lebih lanjut.
          </p>
          <div className="flex gap-4">
            <AccessButton />
            <button
              onClick={() => signOut()}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <i className="fas fa-sign-out-alt mr-2"></i> Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/80" />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Banner Image */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/bannerresearch.png"
            alt="Trade With Suli"
            className="max-w-full h-auto rounded-lg"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4 text-center">
          RESEARCH
          <div className="mt-2 w-16 h-1 mx-auto bg-blue-500 rounded" />
        </h1>

        {/* Filter Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto mb-4">
          {["Semua", "Beginner", "Deep Dive"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition ${
                filter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center max-w-md mx-auto bg-gray-900 rounded-lg px-3 py-2 mb-8 border border-gray-800 focus-within:border-blue-500 transition">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Cari research..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none text-white placeholder:text-gray-500"
          />
        </div>

        <ReusableGrid data={filteredData} />
      </div>
    </div>
  );
}
