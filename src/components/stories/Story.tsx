import { useStories } from "@/hooks/useStories";
import { useState } from "react";
import Image from "next/image";
import ReactPlayer from "react-player";

const Story = () => {
  const { stories, loading } = useStories();
  const [currentStory, setCurrentStory] = useState<number | null>(null);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="flex space-x-3 overflow-x-auto p-4 bg-gray-900 rounded-lg">
      {stories.map((story, index) => (
        <div
          key={story.id}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 cursor-pointer"
          onClick={() => setCurrentStory(index)}
        >
          {story.media_type === "image" ? (
            <Image src={story.media_url} alt="Story" width={64} height={64} className="object-cover" />
          ) : (
            <video src={story.media_url} className="w-full h-full object-cover" muted />
          )}
        </div>
      ))}

      {/* Affichage en plein écran de la Story sélectionnée */}
      {currentStory !== null && (
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setCurrentStory(null)}
        >
          {stories[currentStory].media_type === "image" ? (
            <Image
              src={stories[currentStory].media_url}
              alt="Story"
              width={300}
              height={500}
              className="rounded-lg"
            />
          ) : (
            <ReactPlayer url={stories[currentStory].media_url} playing controls width="80%" height="80%" />
          )}
        </div>
      )}
    </div>
  );
};

export default Story;
