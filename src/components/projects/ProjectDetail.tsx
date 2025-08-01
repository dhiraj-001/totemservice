import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  mediaUrl: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [categoryProjects, setCategoryProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [staticImages, setStaticImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchProjectAndRelated = async () => {
      try {
        setIsLoading(true);
        
        const projectResponse = await fetch(`https://totem-consultancy-alpha.vercel.app/api/projects/${id}`);
        
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project');
        }

        const projectData = await projectResponse.json();
        setProject(projectData);

        const allProjectsResponse = await fetch('https://totem-consultancy-alpha.vercel.app/api/projects');
        
        if (!allProjectsResponse.ok) {
          throw new Error('Failed to fetch related projects');
        }

        const allProjects = await allProjectsResponse.json();
        const relatedProjects = allProjects.filter(
          (p: Project) => p.categoryId === projectData.categoryId
        );
        
        setCategoryProjects(relatedProjects);

        // Split images into carousel and static
        const allImages = relatedProjects.map((p: Project) => p.mediaUrl);
        setCarouselImages(allImages.slice(0, 3));  // Only first 3 for carousel
        setStaticImages(allImages.slice(3));       // Rest are static

      } catch (err) {
        setError('Failed to load project');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProjectAndRelated();
    }
  }, [id]);

  useEffect(() => {
    if (carouselImages.length === 3) {  // Only run carousel if we have exactly 3 images
      const interval = setInterval(() => {
        setCarouselImages(prev => {
          const newImages = [...prev];
          const firstImage = newImages.shift();
          if (firstImage) newImages.push(firstImage);
          return newImages;
        });
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [carouselImages.length]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <button 
            onClick={() => navigate('/projects')}
            className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors duration-300"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FDF8F3] py-16">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/projects')}
            className="px-6 py-2 border border-black hover:bg-black hover:text-white transition-colors duration-300"
          >
            ← Back to Projects
          </button>
        </div>

        {/* Carousel Section */}
        <div className="relative w-full h-[400px] md:h-[600px] overflow-visible mb-8">
  <div className="absolute w-full top-1/3 -translate-y-1/2 flex justify-center items-center">
    {carouselImages.map((imageUrl, index) => {
      let className = "absolute transition-all duration-1000 ease-in-out ";
      let style: React.CSSProperties = { opacity: 0 };

      if (index === 0) {
        className += "w-[160px] h-[160px] md:w-[318px] md:h-[318px]";
        style = { 
          transform: 'translateX(-110%)', 
          opacity: 0.7,
          filter: 'brightness(0.7)'
        };
      } else if (index === 1) {
        className += "w-[240px] h-[240px] md:w-[531px] md:h-[531px] z-10";
        style = { 
          transform: 'translateX(0)', 
          opacity: 1,
          filter: 'brightness(1)'
        };
      } else if (index === 2) {
        className += "w-[160px] h-[160px] md:w-[318px] md:h-[318px]";
        style = { 
          transform: 'translateX(110%)', 
          opacity: 0.7,
          filter: 'brightness(0.7)'
        };
      }

      return (
        <div
          key={index}
          className={className}
          style={{
            ...style,
            transition: 'all 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <img
            src={imageUrl}
            alt={`Project image ${index + 1}`}
            className="w-full h-full rounded-lg shadow-xl object-cover"
          />
        </div>
      );
    })}
  </div>
</div>
        {staticImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {staticImages.map((imageUrl, index) => (
              <div 
                key={index}
                className="aspect-square w-full overflow-hidden rounded-lg shadow-lg"
              >
                <img
                  src={imageUrl}
                  alt={`Project image ${index + 4}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectDetail;