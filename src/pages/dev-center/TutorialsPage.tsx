import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Tag, ChevronRight } from 'lucide-react';
import VideoPlayer, { Chapter } from '../../components/video/VideoPlayer';
import { TUTORIALS, CATEGORIES, Tutorial } from './tutorialData';

const TutorialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>(TUTORIALS[0]?.id ?? '');
  const [activeCategory, setActiveCategory] = useState('All');

  const current = TUTORIALS.find((t) => t.id === selectedId) ?? TUTORIALS[0];

  const filtered =
    activeCategory === 'All'
      ? TUTORIALS
      : TUTORIALS.filter((t) => t.category === activeCategory);

  const handleEnded = useCallback(() => {
    const idx = TUTORIALS.findIndex((t) => t.id === selectedId);
    if (idx !== -1 && idx < TUTORIALS.length - 1) {
      setSelectedId(TUTORIALS[idx + 1].id);
    }
  }, [selectedId]);

  const handleChapterChange = useCallback((_ch: Chapter) => {
    // could highlight in sidebar; no-op for now
  }, []);

  if (!current) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dev-center')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Video Tutorials</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {TUTORIALS.length} tutorials available
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar — playlist */}
        <div className="lg:w-72 shrink-0">
          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {CATEGORIES.filter((c) =>
              c === 'All' || TUTORIALS.some((t) => t.category === c),
            ).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Playlist */}
          <div className="space-y-2">
            {filtered.map((tutorial, idx) => (
              <PlaylistItem
                key={tutorial.id}
                tutorial={tutorial}
                index={idx + 1}
                isActive={tutorial.id === selectedId}
                onClick={() => setSelectedId(tutorial.id)}
              />
            ))}
          </div>
        </div>

        {/* Right — video player */}
        <div className="flex-1 min-w-0">
          {/* Title + meta */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wide">
                  {current.category}
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {current.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {current.description}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {current.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  {current.tags.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Video player */}
          <VideoPlayer
            src={current.videoUrl}
            chapters={current.chapters}
            title={current.title}
            onEnded={handleEnded}
            onChapterChange={handleChapterChange}
          />

          {/* Prev / Next buttons */}
          <div className="flex justify-between mt-5">
            <NavButton
              label="Previous"
              tutorial={TUTORIALS[TUTORIALS.findIndex((t) => t.id === selectedId) - 1]}
              direction="prev"
              onClick={(id) => setSelectedId(id)}
            />
            <NavButton
              label="Next"
              tutorial={TUTORIALS[TUTORIALS.findIndex((t) => t.id === selectedId) + 1]}
              direction="next"
              onClick={(id) => setSelectedId(id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlaylistItemProps {
  tutorial: Tutorial;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ tutorial, index, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-3 rounded-xl transition-colors flex items-start gap-3 ${
      isActive
        ? 'bg-primary-50 border border-primary-200 dark:bg-primary-900/30 dark:border-primary-700'
        : 'bg-gray-50 border border-transparent hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
    }`}
  >
    <div
      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
      }`}
    >
      {isActive ? <Play size={12} className="ml-0.5" /> : index}
    </div>
    <div className="min-w-0 flex-1">
      <div
        className={`text-sm font-medium leading-snug ${
          isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'
        }`}
      >
        {tutorial.title}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-gray-400">{tutorial.duration}</span>
        <span className="text-xs text-gray-400">·</span>
        <span className="text-xs text-gray-400">{tutorial.chapters.length} chapters</span>
      </div>
    </div>
  </button>
);

interface NavButtonProps {
  label: string;
  tutorial: Tutorial | undefined;
  direction: 'prev' | 'next';
  onClick: (id: string) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, tutorial, direction, onClick }) => {
  if (!tutorial) return <div />;
  return (
    <button
      onClick={() => onClick(tutorial.id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm ${
        direction === 'next' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <ChevronRight
        size={16}
        className={`text-gray-400 ${direction === 'prev' ? 'rotate-180' : ''}`}
      />
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="font-medium text-gray-700 dark:text-gray-200 line-clamp-1">
          {tutorial.title}
        </div>
      </div>
    </button>
  );
};

export default TutorialsPage;
