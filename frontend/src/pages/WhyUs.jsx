import React from 'react';
import { CheckCircle } from 'lucide-react';

const WhyUs = () => {
  const advantages = [
    { title: '100% Organic Certified', desc: 'Compliant with NPOP (National Programme for Organic Production) standards. Zero chemicals.' },
    { title: 'Sustainable Soil Farming', desc: 'Promotes soil conservation, zero tillage damage, and microbial biodiverse growth.' },
    { title: 'Direct Farm Linkages', desc: 'No middle wholesalers. Better profit share for growers, cheaper fresh harvest for buyers.' },
    { title: 'Rigorous Quality Checks', desc: 'Strict checks on moisture, sorting grades, and toxin free testing logs.' },
    { title: 'Affordable Healthy Living', desc: 'Designed to make organic nourishment accessible and reasonable, not luxury priced.' },
    { title: 'Agronomist Advisory', desc: ' सुनील भोसले leads expert training workshops for farmers transitioning to organic.' },
    { title: 'Community Supportive', desc: 'Profit shares fund seed loans and compost subsidies for marginal farmer cooperatives.' }
  ];

  return (
    <div className="space-y-16 py-10 pb-16">
      {/* 1. Hero */}
      <section className="bg-primary text-white py-16 text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold">Why Choose Arya Malhar Group of Companies?</h1>
        <p className="text-earth-200 max-w-xl mx-auto text-sm sm:text-base">We prioritize premium purity, ecological health, and direct-to-grower transparency.</p>
      </section>

      {/* 2. Seven Advantages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-extrabold text-primary">Our 7 Pillars of Excellence</h2>
          <p className="text-earth-600 max-w-lg mx-auto">Providing a sustainable model for healthy consumers and prosperous farms.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((adv, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-earth-200/60 shadow-sm flex items-start space-x-3.5">
              <span className="bg-secondary/15 text-primary rounded-xl p-2.5 flex-shrink-0">
                <CheckCircle className="h-6 w-6" />
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-earth-900">{adv.title}</h3>
                <p className="text-sm text-earth-650 leading-relaxed">{adv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Comparison Table */}
      <section className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-primary text-center mb-10">How We Stand Out</h2>
        <div className="overflow-x-auto rounded-3xl border border-earth-200/80 shadow-md">
          <table className="w-full text-left bg-white min-w-[500px]">
            <thead>
              <tr className="bg-primary text-white text-sm">
                <th className="p-4 font-bold">Feature Matrix</th>
                <th className="p-4 font-bold">Arya Malhar Group of Companies</th>
                <th className="p-4 font-bold text-earth-200">Local Wholesalers</th>
                <th className="p-4 font-bold text-earth-200">Premium Organics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-150 text-sm text-earth-800">
              <tr>
                <td className="p-4 font-semibold">100% Organic Sourcing</td>
                <td className="p-4 text-primary font-bold">Yes (Certified)</td>
                <td className="p-4 text-red-500">Rarely (Conventional)</td>
                <td className="p-4 text-primary">Yes (Certified)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Fair Farmer Remuneration</td>
                <td className="p-4 text-primary font-bold">Direct (High Share)</td>
                <td className="p-4 text-red-500">Low (Middlemen fees)</td>
                <td className="p-4 text-earth-500">Indirect (Low-Med)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Product Freshness Log</td>
                <td className="p-4 text-primary font-bold">Harvested Daily</td>
                <td className="p-4 text-earth-600">Stored 3-7 Days</td>
                <td className="p-4 text-earth-600">Stored 2-5 Days</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Pricing Point</td>
                <td className="p-4 text-primary font-bold">Reasonable/Direct</td>
                <td className="p-4 text-primary font-bold">Low (Chemical crop)</td>
                <td className="p-4 text-red-500">Extremely Expensive</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default WhyUs;
