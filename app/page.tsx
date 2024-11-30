"use client";

import HeroSection from '@/app/components/home/HeroSection';
import FeatureShowcase from '@/app/components/home/FeatureShowcase';
import { VisionBoard } from '@/app/components/home/VisionBoard';
import { UserFeedback } from '@/app/components/home/UserFeedback';
import { CallToAction } from '@/app/components/home/CallToAction';

export default function Home() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <FeatureShowcase />
      <VisionBoard />
      <UserFeedback />
      <CallToAction />
    </main>
  );
}
