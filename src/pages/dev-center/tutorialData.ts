import { Chapter } from '../../components/video/VideoPlayer';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  duration: string;
  chapters: Chapter[];
  tags: string[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'zmb-claims-intake',
    title: 'Building a Module: Claims Intake',
    description:
      'Learn how to create a complete business module using ZMB — from form design to running app.',
    category: 'Module Creation',
    videoUrl: '/videos/ZMB-Tutorial-Claims-Intake.mp4',
    duration: '1:06',
    chapters: [
      { title: 'Introduction', startTime: 0 },
      { title: 'The 4 Platform Capabilities', startTime: 5 },
      { title: 'Login to Console', startTime: 13 },
      { title: 'Design the Form', startTime: 19 },
      { title: 'Generate Access Token', startTime: 28 },
      { title: 'White Label Theme', startTime: 35 },
      { title: 'Generate Module (CLI)', startTime: 41 },
      { title: 'Generate Module (UI)', startTime: 49 },
      { title: 'Inside Generated Code', startTime: 55 },
      { title: 'Power of Configuration', startTime: 62 },
    ],
    tags: ['zmb', 'claims', 'form-builder', 'module'],
  },
  {
    id: 'zmb-prospect-portal',
    title: 'Prospect Portal: Distribution Side',
    description:
      'Explore the prospect portal as a ZMB reference implementation — form submission, PII masking, FQP queues.',
    category: 'Module Creation',
    videoUrl: '/videos/ZMB-Tutorial-Prospect-Portal.mp4',
    duration: '1:06',
    chapters: [
      { title: 'Introduction', startTime: 0 },
      { title: 'Distribution vs Servicing', startTime: 5 },
      { title: 'The Form in Form Builder', startTime: 12 },
      { title: 'Portal in Action', startTime: 25 },
      { title: 'Resolution Precedence', startTime: 33 },
      { title: 'PII Visibility', startTime: 40 },
      { title: 'FQP Queue', startTime: 48 },
      { title: 'Same Pattern, Different Domain', startTime: 55 },
      { title: 'Key Takeaways', startTime: 62 },
    ],
    tags: ['zmb', 'prospect', 'pii', 'fqp', 'portal'],
  },
];

export const CATEGORIES = ['All', 'Getting Started', 'Module Creation', 'Platform Capabilities'];
