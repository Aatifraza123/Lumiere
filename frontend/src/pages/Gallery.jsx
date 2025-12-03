import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiChevronLeft, 
  FiChevronRight, 
  FiGrid, 
  FiHeart, 
  FiBriefcase, 
  FiCoffee, 
  FiStar, 
  FiAperture,
  FiMaximize2
} from 'react-icons/fi';
import api from '../utils/api';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [filteredGallery, setFilteredGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modern Icon Mapping
  const categories = [
    { id: 'all', label: 'All', icon: FiGrid },
    { id: 'wedding', label: 'Weddings', icon: FiHeart },
    { id: 'corporate', label: 'Corporate', icon: FiBriefcase },
    { id: 'party', label: 'Parties', icon: FiCoffee },
    { id: 'anniversary', label: 'Anniversaries', icon: FiStar },
    { id: 'other', label: 'Other', icon: FiAperture },
  ];

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredGallery(gallery);
    } else {
      setFilteredGallery(gallery.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, gallery]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await api.get('/gallery?isActive=true');
      const galleryData = response.data?.data || response.data || [];
      setGallery(galleryData);
      setFilteredGallery(galleryData);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      // Enhanced Fallback Data
      const mockData = [
        {
          _id: '1',
          title: 'Royal Union',
          description: 'A grand wedding celebration with elegant decor and lighting',
          image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
          category: 'wedding'
        },
        {
          _id: '2',
          title: 'Tech Summit Gala',
          description: 'Professional corporate event setup for annual technology summit',
          image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80',
          category: 'corporate'
        },
        {
          _id: '3',
          title: 'Neon Night',
          description: 'Vibrant birthday celebration with modern neon aesthetics',
          image: 'https://images.unsplash.com/photo-1519225448526-064d816ddd21?w=1200&q=80',
          category: 'party'
        },
        {
          _id: '4',
          title: 'Golden Anniversary',
          description: '50th Anniversary celebration with classic gold themes',
          image: 'https://images.unsplash.com/photo-1530103862676-de3c9a59af57?w=1200&q=80',
          category: 'anniversary'
        },
      ];
      setGallery(mockData);
      setFilteredGallery(mockData);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    if (document.body) {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    if (document.body) {
      document.body.style.overflow = 'unset';
    }
  };

  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredGallery.length
      : (currentIndex - 1 + filteredGallery.length) % filteredGallery.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredGallery[newIndex]);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowRight') navigateImage('next');
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, currentIndex, filteredGallery]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Montserrat'] relative selection:bg-[#D4AF37] selection:text-black">
      
      {/* Cinematic Noise Overlay */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-[0] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-40 pb-12 px-6 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.4em] uppercase mb-6 inline-block border border-[#D4AF37]/30 px-4 py-2 rounded-full backdrop-blur-sm">
              Portfolio
            </span>
            <h1 className="font-['Playfair_Display'] text-[clamp(3rem,7vw,6rem)] mb-6 font-medium leading-[0.9] tracking-tight">
              Visual <span className="text-[#D4AF37] italic font-light">Stories</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
              A curated collection of moments, captured with precision and passion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Modern Filter Bar */}
      <section className="sticky top-6 z-40 px-6 mb-12">
        <div className="max-w-max mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-[90vw]">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                    ${isSelected ? 'text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-[#D4AF37] rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 text-lg"><Icon /></span>
                  <span className="relative z-10">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-24 px-8 md:px-12 lg:px-16 xl:px-20 z-10 relative">
        <div className="max-w-[1600px] mx-auto">
          {loading ? (
            <div className="h-[50vh] flex justify-center items-center">
              <div className="w-px h-24 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent animate-pulse"></div>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
            >
              <AnimatePresence mode='popLayout'>
                {filteredGallery.map((item, index) => {
                  // Varying sizes: some images span 2 columns/rows
                  const sizeVariants = [
                    { colSpan: 'col-span-1', rowSpan: 'row-span-1', aspect: 'aspect-square' },
                    { colSpan: 'col-span-1', rowSpan: 'row-span-2', aspect: 'aspect-[3/4]' },
                    { colSpan: 'col-span-2', rowSpan: 'row-span-1', aspect: 'aspect-[2/1]' },
                    { colSpan: 'col-span-1', rowSpan: 'row-span-1', aspect: 'aspect-square' },
                    { colSpan: 'col-span-1', rowSpan: 'row-span-1', aspect: 'aspect-[4/5]' },
                  ];
                  const size = sizeVariants[index % sizeVariants.length];
                  
                  // Varying border radius
                  const radiusVariants = [
                    'rounded-lg',
                    'rounded-2xl',
                    'rounded-3xl',
                    'rounded-xl',
                    'rounded-[2rem]',
                    'rounded-full',
                    'rounded-tl-3xl rounded-br-3xl',
                    'rounded-tr-3xl rounded-bl-3xl',
                  ];
                  const borderRadius = radiusVariants[index % radiusVariants.length];
                  
                  return (
                  <motion.div
                    layout
                    key={item._id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.03,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    onClick={() => openLightbox(item, index)}
                    className={`group relative ${size.colSpan} ${size.rowSpan} ${size.aspect} cursor-pointer overflow-hidden ${borderRadius} bg-[#121212]`}
                  >
                    {/* Image Container */}
                    <div className="w-full h-full overflow-hidden">
                      <motion.img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.15 }}
                        transition={{ 
                          duration: 0.6, 
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      />
                    </div>

                    {/* Premium Overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />

                    {/* Hover Content */}
                    <motion.div 
                      className="absolute inset-x-0 bottom-0 p-4 md:p-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <motion.span 
                          className="h-px w-6 bg-[#D4AF37]"
                          initial={{ width: 0 }}
                          whileHover={{ width: 24 }}
                          transition={{ duration: 0.3 }}
                        />
                        <span className="text-[#D4AF37] text-[10px] md:text-xs font-bold uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-['Playfair_Display'] text-lg md:text-xl text-white mb-1 leading-tight line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex justify-between items-end">
                        <p className="text-gray-300 text-xs line-clamp-1 font-light max-w-[75%]">
                          {item.description}
                        </p>
                        <motion.div 
                          className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white backdrop-blur-sm"
                          whileHover={{ scale: 1.1, borderColor: '#D4AF37' }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiMaximize2 className="w-3 h-3" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Immersive Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              // Only close if clicking directly on the background, not on child elements
              if (e.target === e.currentTarget) {
                closeLightbox();
              }
            }}
          >
            {/* Top Controls */}
            <div 
              className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-[110] pointer-events-none"
            >
               <div className="text-white/50 text-sm font-mono pointer-events-auto">
                 {currentIndex + 1} <span className="mx-2 text-white/20">/</span> {filteredGallery.length}
               </div>
               <motion.button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer pointer-events-auto z-[120] bg-transparent border-none outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">Close</span>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all pointer-events-none">
                  <FiX size={20} className="pointer-events-none" />
                </div>
              </motion.button>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
              className="absolute left-8 z-[110] p-4 text-white/50 hover:text-[#D4AF37] transition-colors hidden md:block"
            >
              <FiChevronLeft size={48} strokeWidth={1} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
              className="absolute right-8 z-[110] p-4 text-white/50 hover:text-[#D4AF37] transition-colors hidden md:block"
            >
              <FiChevronRight size={48} strokeWidth={1} />
            </button>

            {/* Main Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-7xl h-[85vh] px-6 md:px-20 flex flex-col md:flex-row gap-8 items-center justify-center"
            >
              {/* Image Canvas */}
              <div className="relative flex-1 h-full w-full flex items-center justify-center">
                 <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="max-h-full max-w-full object-contain shadow-2xl shadow-black"
                />
              </div>

              {/* Info Sidebar (Desktop) / Bottom (Mobile) */}
              <div className="md:w-80 w-full text-left shrink-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
                    {selectedImage.category}
                  </span>
                  <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-white mb-4">
                    {selectedImage.title}
                  </h2>
                  <p className="text-gray-400 font-light leading-relaxed mb-8 text-sm md:text-base">
                    {selectedImage.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;

