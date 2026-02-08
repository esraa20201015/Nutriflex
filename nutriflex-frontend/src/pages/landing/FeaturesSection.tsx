import React from 'react';

interface Feature {
  title: string;
  description: string;
}

const features: Feature[] = [
  { title: 'Fast', description: 'Lightning fast performance for your needs.' },
  { title: 'Secure', description: 'Top-notch security for your data.' },
  { title: 'User Friendly', description: 'Easy to use and intuitive interface.' },
];

const FeaturesSection: React.FC = () => (
  <section className="py-12 bg-white">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-8 text-center">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="p-6 border rounded shadow-sm">
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
