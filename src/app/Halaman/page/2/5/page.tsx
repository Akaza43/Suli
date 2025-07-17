"use client";

import { useSession } from "next-auth/react";
import { Data } from "../5/data";
import Loading from "@/ui/loading";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const getGoogleDriveEmbedUrl = (url: string) => {
  const matches = url.match(/\/d\/(.+?)(?:\/|$|\?)/);
  const fileId = matches ? matches[1] : "";
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

export default function Container() {
  const { data: session, status } = useSession();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideOverlay, setHideOverlay] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const videoId = searchParams?.get("id") || Data[0].id;
  const nextModuleLink = searchParams?.get("next") || "";
  const thumbnail = searchParams?.get("thumbnail") || "";
  const videoData = Data.find((item) => item.id === videoId);

  useEffect(() => {
    const checkAccess = async () => {
      if (session?.accessToken) {
        try {
          const response = await fetch("/api/verify-role", {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setHideOverlay(true);
    }, 120000);
    return () => clearTimeout(timer);
  }, []);

  const handleOverlayClick = () => {
    if (nextModuleLink) {
      router.push(nextModuleLink);
    }
  };

  const handleClickLesson = (item: typeof Data[number]) => {
    router.push(
      `?id=${item.id}&next=${encodeURIComponent(item.link)}&thumbnail=`
    );
  };

  if (loading || status === "loading") return <Loading />;
  if (!session || !hasAccess) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}

      <div className="flex flex-col lg:flex-row">
        {/* Left: Video Player */}
        <div className="lg:w-[60%]">
          <div className="p-6 lg:fixed lg:w-[55%] lg:max-w-[800px]">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-900">
              <div
                className={`absolute top-0 right-0 w-16 h-16 bg-transparent z-10 transition-opacity duration-1000 ${
                  hideOverlay ? "opacity-0" : "opacity-100"
                }`}
                onClick={handleOverlayClick}
              />
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : videoData?.drive ? (
                <iframe
                  src={getGoogleDriveEmbedUrl(videoData.drive)}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  style={{ border: "none" }}
                />
              ) : null}
            </div>
            <h1 className="text-2xl font-bold mt-4 text-white">
              {videoData?.title}
            </h1>
          </div>
        </div>

        {/* Right: Lessons List */}
        <div className="lg:w-[40%] bg-black border-l border-gray-900 min-h-screen p-6">
          <h2 className="text-md font-semibold mb-4">
            Lesson ({Data.length})
          </h2>

          {Data.map((item) => (
            <div
              key={item.id}
              className={`bg-blue-500 text-black font-medium p-4 rounded-xl mb-3 hover:bg-blue-600 transition cursor-pointer flex items-center gap-3 ${
                videoId === item.id ? "ring-2 ring-orange-600" : ""
              }`}
              onClick={() => handleClickLesson(item)}
            >
              <img
                src="/images/play.svg"
                alt="Play"
                className="h-5 w-5"
              />
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
