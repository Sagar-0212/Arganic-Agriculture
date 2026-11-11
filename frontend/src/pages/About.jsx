import React from 'react';
import { motion } from 'framer-motion';
import { Award, Target, Users, Trees, BarChart } from 'lucide-react';

const About = () => {
  const [galleryFilter, setGalleryFilter] = React.useState('all');

  const milestones = [
    { year: '2016', title: 'Farming Inception', desc: 'Sunil Bhosale started organic conversion on his family-owned 5-acre farm in Baramati.' },
    { year: '2018', title: 'Direct Farm Alliance', desc: 'Partnered with 50 local farmers, forming the first local Organic Grower Alliance in Pune.' },
    { year: '2021', title: 'Arya malhar Platform Launch', desc: 'Created the online portal to supply chemical-free products directly to Pune and Mumbai.' },
    { year: '2023', title: 'Krushibhushan Award', desc: 'Sunil Bhosale received the state-level Krushibhushan Award for contribution to sustainable agriculture.' }
  ];

  const galleryItems = [
    { id: 1, type: 'farm', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=400', caption: 'Lush Green Fields in Baramati' },
    { id: 2, type: 'crops', url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=400', caption: 'Freshly Harvested Tomatoes' },
    { id: 3, type: 'team', url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=400', caption: 'Local Farmers Cooperative Training' },
    { id: 4, type: 'crops', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=400', caption: 'Unpolished Indrayani Rice Harvest' },
    { id: 5, type: 'farm', url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=400', caption: 'Compost Preparation Bed' },
    { id: 6, type: 'team', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400', caption: 'Sunil Bhosale Advising Farmers' }
  ];

  const filteredGallery = galleryFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.type === galleryFilter);

  return (
    <div className="space-y-16 py-10">
      {/* 1. Hero */}
      <section className="bg-primary text-white py-16 text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold">About Arya Malhar Group of Companies</h1>
        <p className="text-earth-200 max-w-xl mx-auto text-sm sm:text-base">Connecting natural health and soil health. Led by Krushibhushan Award Winner Sunil Bhosale.</p>
      </section>

      {/* 2. Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-1">
              <Award className="h-4 w-4" /> State Agricultural Laureate
            </span>
            <h2 className="text-3xl font-extrabold text-primary">Sunil Bhosale's Inspiring Vision</h2>
            <p className="text-earth-700 leading-relaxed">
              Believing that the chemical-free diet is a basic human right, farmer-entrepreneur **Sunil Bhosale** dedicated over a decade to transition conventional crop farms into organic soils. Baramati-based, his efforts have created employment, saved micro-watersheds, and reduced farming expenses.
            </p>
            <p className="text-earth-700 leading-relaxed">
              In recognition of his exemplary bio-fertilizer integrations and soil revival efforts, he was honored with the **Maharashtra Krushibhushan Award**. This online portal represents his dream to link organic consumers directly to authentic local growers, avoiding greedy middlemen inflation.
            </p>
          </div>
          <div className="h-96 rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-earth-200">
            <img 
              src="/sunil.jpg" 
              alt="Sunil Bhosale" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. Stats Banner */}
      <section className="bg-earth-100 py-12 border-y border-earth-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Farmers Linked', value: '450+', icon: <Users className="h-6 w-6 text-primary mx-auto mb-2" /> },
            { label: 'Organic Acres', value: '1,200+', icon: <Trees className="h-6 w-6 text-primary mx-auto mb-2" /> },
            { label: 'Products Offered', value: '50+', icon: <Target className="h-6 w-6 text-primary mx-auto mb-2" /> },
            { label: 'Satisfied Buyers', value: '10,000+', icon: <BarChart className="h-6 w-6 text-primary mx-auto mb-2" /> }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              {stat.icon}
              <div className="text-3xl font-extrabold text-primary">{stat.value}</div>
              <div className="text-xs text-earth-600 uppercase font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Timeline Milestones */}
      <section className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-primary text-center mb-12">Our Journey</h2>
        <div className="relative border-l-2 border-primary/20 ml-4 md:ml-32 space-y-8">
          {milestones.map((milestone, index) => (
            <div key={index} className="relative pl-6 pb-2">
              {/* Dot */}
              <span className="absolute -left-[9px] top-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-sm" />
              
              {/* Year label left side */}
              <span className="hidden md:block absolute -left-32 top-0.5 font-extrabold text-lg text-primary text-right w-24">
                {milestone.year}
              </span>
              
              <div className="bg-white p-5 rounded-2xl border border-earth-200/60 shadow-sm space-y-2">
                <span className="md:hidden inline-block font-extrabold text-primary text-sm mb-1">{milestone.year}</span>
                <h3 className="font-bold text-earth-900 text-lg">{milestone.title}</h3>
                <p className="text-sm text-earth-600 leading-relaxed">{milestone.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Gallery Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-3xl font-extrabold text-primary text-center mb-6">Farms & Crops Gallery</h2>
        
        {/* Buttons */}
        <div className="flex justify-center space-x-3 mb-10">
          {['all', 'farm', 'crops', 'team'].map(category => (
            <button 
              key={category}
              onClick={() => setGalleryFilter(category)}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                galleryFilter === category 
                  ? 'bg-primary text-white border-primary shadow-md' 
                  : 'bg-white text-earth-700 border-earth-300 hover:bg-earth-50'
              }`}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredGallery.map(item => (
            <motion.div 
              layout
              key={item.id} 
              className="bg-white rounded-2xl overflow-hidden border border-earth-200/60 shadow-sm group"
            >
              <div className="h-60 overflow-hidden bg-earth-100">
                <img 
                  src={item.url} 
                  alt={item.caption} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 bg-white border-t border-earth-100">
                <p className="text-xs font-semibold text-earth-800">{item.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
