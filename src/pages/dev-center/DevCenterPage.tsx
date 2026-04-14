import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  BookOpen,
  FileText,
  Cpu,
  ArrowRight,
  Code2,
  Layers,
  Zap,
} from 'lucide-react';
import { TUTORIALS } from './tutorialData';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: string;
  color: string;
}

const FeatureCard: React.FC<CardProps> = ({ icon, title, description, href, badge, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(href)}
      className="group text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200"
    >
      <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
        {icon}
      </div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        {badge && (
          <span className="shrink-0 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{description}</p>
      <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:gap-2 gap-1 transition-all">
        <span>Explore</span>
        <ArrowRight size={14} />
      </div>
    </button>
  );
};

const DevCenterPage: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Code2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Center</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Learn, Build, Deploy</p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-2xl">
          Everything you need to build enterprise applications on Zorbit. Watch video tutorials,
          explore architecture patterns, and generate your first module in minutes.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Video Tutorials', value: `${TUTORIALS.length}`, icon: <Video size={16} /> },
          { label: 'Platform Capabilities', value: '4', icon: <Layers size={16} /> },
          { label: 'Config:Code Ratio', value: '90:10', icon: <Zap size={16} /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-100 dark:border-primary-800 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <div className="text-primary-600 dark:text-primary-400">{stat.icon}</div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FeatureCard
          icon={<Video size={22} className="text-red-600" />}
          title="Video Tutorials"
          description="Watch step-by-step guides. See ZMB in action — from empty console to running module."
          href="/dev-center/tutorials"
          badge={`${TUTORIALS.length} videos`}
          color="bg-red-50 dark:bg-red-900/20"
        />
        <FeatureCard
          icon={<BookOpen size={22} className="text-emerald-600" />}
          title="Module Creation Guide"
          description="Build your first module with ZMB. Step-by-step instructions with CLI commands."
          href="/dev-center/zmb-guide"
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <FeatureCard
          icon={<FileText size={22} className="text-blue-600" />}
          title="API Documentation"
          description="Explore platform APIs with interactive Swagger UI for all backend services."
          href="/api-docs"
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <FeatureCard
          icon={<Cpu size={22} className="text-violet-600" />}
          title="Architecture Overview"
          description="Understand the 4 platform capabilities and the 90:10 configuration-to-code philosophy."
          href="/dev-center/architecture"
          color="bg-violet-50 dark:bg-violet-900/20"
        />
      </div>

      {/* Quick start banner */}
      <div className="mt-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-bold mb-1">Quick Start: Build a Module in 5 Minutes</h2>
        <p className="text-white/80 text-sm mb-4">
          Design a form, generate an access token, run one CLI command — your module is live.
        </p>
        <div className="bg-black/30 rounded-xl px-4 py-3 font-mono text-sm mb-4">
          <span className="text-white/60">$ </span>
          <span className="text-green-300">zorbit zmb create</span>
          <span className="text-white"> --form claims-intake --theme default</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/dev-center/tutorials'}
            className="bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Watch Tutorial
          </button>
          <button
            onClick={() => window.location.href = '/dev-center/zmb-guide'}
            className="bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors"
          >
            Read Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevCenterPage;
