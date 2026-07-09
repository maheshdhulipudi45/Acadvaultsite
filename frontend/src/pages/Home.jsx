import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SliderModule from 'react-slick';

const Slider = SliderModule.default?.default ?? SliderModule.default ?? SliderModule;
import { useAuth } from '../context/AuthContext';
import { resourceService, userService } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import PreviewModal from '../components/PreviewModal';
import ReportModal from '../components/ReportModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { FileUp, Sparkles, Award, ArrowRight, Star, Cpu, Code, FileText } from 'lucide-react';
import heroImg from '../assets/hero.png';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ resources: 0, downloads: 0, students: 0, contributors: 0 });
  const [latestResources, setLatestResources] = useState([]);
  const [trendingResources, setTrendingResources] = useState([]);
  const [placementResources, setPlacementResources] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals interaction states
  const [previewResource, setPreviewResource] = useState(null);
  const [reportResource, setReportResource] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        // Fetch resources with specific query options
        const [resLatest, resTrending, resPlacement, resLeaderboard] = await Promise.all([
          resourceService.getResources({ limit: 6, sort: 'Newest' }),
          resourceService.getResources({ limit: 6, sort: 'Most Downloaded' }),
          resourceService.getResources({ limit: 6, branch: 'Placement', sort: 'Newest' }),
          userService.getLeaderboard(),
        ]);

        const latest = resLatest.data.resources || [];
        const trending = resTrending.data.resources || [];
        const placement = resPlacement.data.resources || [];
        const leaderboard = resLeaderboard.data || [];

        setLatestResources(latest);
        setTrendingResources(trending);
        setPlacementResources(placement);
        setTopContributors(leaderboard.slice(0, 5));

        // Derive statistics dynamically
        const totalResources = resLatest.data.total || latest.length;
        const totalDownloads = trending.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0) + 12; // Base offset
        const totalStudents = leaderboard.length + 8; // Base offset
        const totalContributors = leaderboard.filter(u => u.points > 0).length + 2;

        setStats({
          resources: totalResources,
          downloads: totalDownloads,
          students: totalStudents,
          contributors: totalContributors,
        });

      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleActionClick = (path) => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', path);
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  // Slider Configurations
  const carouselSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          arrows: false,
        }
      }
    ]
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-12 border-b border-slate-100">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge Label */}
              <div className="flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-600 shadow-sm w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                <span>One Place. All Your Academic Needs.</span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.12]">
                Share Knowledge. <br />
                Empower <span className="bg-gradient-to-r from-brand-600 to-accent-655 bg-clip-text text-transparent">Students.</span>
              </h1>

              {/* Subheading */}
              <p className="text-slate-500 leading-relaxed text-sm sm:text-base max-w-xl">
                Upload notes, discover useful resources and help students learn <span className="text-brand-600 font-semibold underline">smarter</span> || Share knowledge and build university networks together.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/resources"
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3 font-bold text-white shadow-lg shadow-brand-100 hover:from-brand-700 hover:to-brand-855 transition-all hover:-translate-y-0.5"
                >
                  Explore Resources
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <button
                  onClick={() => handleActionClick('/upload')}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <FileUp className="h-4.5 w-4.5 text-slate-400" />
                  Upload Notes
                </button>
              </div>

              {/* Ratings badge */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2.5">
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-brand-400 shadow-sm"></div>
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-accent-400 shadow-sm"></div>
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-yellow-400 shadow-sm"></div>
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-pink-400 shadow-sm"></div>
                </div>
                <div className="flex flex-col items-start text-xs">
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                    <span className="text-slate-800 ml-1">4.5</span>
                  </div>
                  <span className="text-slate-450 mt-0.5">Loved by 3 students</span>
                </div>
              </div>

            </div>

            {/* Right Illustration column */}
            <div className="lg:col-span-5 relative flex justify-center items-center h-[420px]">
              <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
                {/* Background soft glow blur */}
                <div className="absolute inset-0 bg-brand-200/35 rounded-full blur-3xl opacity-60"></div>
                
                {/* 3D Character image */}
                <img
                  src={heroImg}
                  alt="AcadVault Hero Illustration"
                  className="relative z-10 w-full object-contain max-h-[380px] drop-shadow-xl animate-float"
                />

                {/* Floating Card 1 (HII) */}
                <div className="absolute -top-4 left-0 z-20 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-premium backdrop-blur-md hover:scale-105 transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-xs text-slate-850 leading-none">HII</span>
                    <span className="text-[10px] text-slate-400 mt-1">1 Download</span>
                  </div>
                </div>

                {/* Floating Card 2 (JAVA Full Course) */}
                <div className="absolute top-16 -right-8 z-20 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-premium backdrop-blur-md hover:scale-105 transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-650 text-white shadow-sm">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-xs text-slate-850 leading-none">JAVA Full Course</span>
                    <span className="text-[10px] text-slate-400 mt-1">1 Download</span>
                  </div>
                </div>

                {/* Floating Card 3 (Java Concepts) */}
                <div className="absolute bottom-16 -left-8 z-20 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-premium backdrop-blur-md hover:scale-105 transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white shadow-sm">
                    <Code className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-xs text-slate-850 leading-none">Java Concepts</span>
                    <span className="text-[10px] text-slate-400 mt-1">1.2k Downloads</span>
                  </div>
                </div>

                {/* Floating Card 4 (Previous Papers) */}
                <div className="absolute -bottom-4 right-0 z-20 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-premium backdrop-blur-md hover:scale-105 transition-all">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-xs text-slate-850 leading-none">Previous Papers</span>
                    <span className="text-[10px] text-slate-400 mt-1">3.6k Downloads</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Bottom Statistics Row */}
          <div className="border-t border-slate-100/70 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-3xl font-extrabold text-brand-600">{stats.resources || 2}</h3>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1.5">Notes</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-3xl font-extrabold text-brand-600">{stats.downloads || 2}</h3>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1.5">Downloads</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-3xl font-extrabold text-brand-600">{stats.students || 3}</h3>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1.5">Students</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-3xl font-extrabold text-brand-600">{stats.contributors || 3}</h3>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1.5">Colleges</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Slider: Trending Resources */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Trending Resources</h2>
            <p className="text-sm text-slate-500 mt-0.5">Most downloaded notes and study materials today.</p>
          </div>
          <Link to="/resources?sort=Most+Downloaded" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} type="slider" />
        ) : trendingResources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-450 text-sm">
            No trending resources available. Upload some now!
          </div>
        ) : (
          <div className="slider-container">
            <Slider {...carouselSettings}>
              {trendingResources.map((res) => (
                <ResourceCard
                  key={res._id}
                  resource={res}
                  onPreviewClick={setPreviewResource}
                  onReportClick={setReportResource}
                />
              ))}
            </Slider>
          </div>
        )}
      </section>

      {/* 4. Slider: Latest Uploads */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Latest Materials</h2>
            <p className="text-sm text-slate-500 mt-0.5">Recently added resources from colleges across India.</p>
          </div>
          <Link to="/resources?sort=Newest" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} type="slider" />
        ) : latestResources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-450 text-sm">
            No resources available.
          </div>
        ) : (
          <div className="slider-container">
            <Slider {...carouselSettings}>
              {latestResources.map((res) => (
                <ResourceCard
                  key={res._id}
                  resource={res}
                  onPreviewClick={setPreviewResource}
                  onReportClick={setReportResource}
                />
              ))}
            </Slider>
          </div>
        )}
      </section>

      {/* 5. Slider: Placement & Interview Materials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Placement Preparation & Interview Materials</h2>
            <p className="text-sm text-slate-500 mt-0.5">Aptitude guides, coding questions, and resumes templates.</p>
          </div>
          <Link to="/resources?branch=Placement" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            Explore Placement Portal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} type="slider" />
        ) : placementResources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-450 text-sm">
            No placement resources available.
          </div>
        ) : (
          <div className="slider-container">
            <Slider {...carouselSettings}>
              {placementResources.map((res) => (
                <ResourceCard
                  key={res._id}
                  resource={res}
                  onPreviewClick={setPreviewResource}
                  onReportClick={setReportResource}
                />
              ))}
            </Slider>
          </div>
        )}
      </section>

      {/* 6. Mid Banner: Call to Action (Start Sharing Card) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-accent-600 p-8 md:p-12 text-white text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-white/5 blur-3xl"></div>
          
          <div className="space-y-2 relative">
            <h3 className="text-3xl font-bold md:text-4xl">Start Sharing. Start Learning.</h3>
            <p className="text-brand-100 max-w-xl text-sm leading-relaxed">
              Join the student community. Upload your notes to earn contributor badges, help classmates study, and prepare for placement tests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative justify-center md:justify-start">
            <button
              onClick={() => handleActionClick('/upload')}
              className="flex items-center justify-center gap-2 rounded-xl bg-white text-brand-700 px-6 py-3 font-bold hover:bg-slate-50 transition-all shadow-md"
            >
              <FileUp className="h-4.5 w-4.5" />
              Upload Notes
            </button>
            <Link
              to="/resources"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3 font-bold text-white transition-all"
            >
              Explore Resources
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Grid Section: Top Contributors */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Top Uploader & Contributors</h2>
            <p className="text-sm text-slate-500 mt-0.5">Highlighting students with the highest upload and download interactions.</p>
          </div>
          <Link to="/leaderboard" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View Leaderboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-50 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : topContributors.length === 0 ? (
          <div className="text-center text-slate-400 py-6 text-sm">No contributors logged.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {topContributors.map((contributor, i) => (
              <div
                key={contributor._id}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-premium hover:shadow-premium-hover transition-all group hover:-translate-y-1"
              >
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-100 to-brand-50 text-brand-700 font-extrabold text-xl shadow-sm">
                    {contributor.name ? contributor.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                    #{i + 1}
                  </span>
                </div>
                
                <h4 className="font-bold text-sm text-slate-800 mt-4 line-clamp-1">{contributor.name}</h4>
                <span className="text-[10px] text-brand-500 font-semibold mt-1 bg-brand-50 border border-brand-100 rounded px-1.5 py-0.5">
                  {contributor.badge}
                </span>
                
                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-slate-700">{contributor.points}</span> pts
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Preview Modal */}
      {previewResource && (
        <PreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}

      {/* Report Modal */}
      {reportResource && (
        <ReportModal
          resource={reportResource}
          onClose={() => setReportResource(null)}
          onReportSuccess={() => {
            alert('Report filed successfully! Administrators will review the issue.');
            setReportResource(null);
          }}
        />
      )}

    </div>
  );
};

export default Home;
