import React from 'react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Welcome to Insonic!',
  subtitle = 'Your journey starts here.'
}) => (
  <section className="py-16 text-center bg-gradient-to-b from-blue-100 to-white">
    <h1 className="text-4xl font-bold mb-4">{title}</h1>
    <p className="text-lg text-gray-600">{subtitle}</p>
  </section>
);

export default HeroSection;
