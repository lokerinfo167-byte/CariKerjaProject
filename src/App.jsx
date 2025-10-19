import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true); // ⬅️ loading state
  const [transitioning, setTransitioning] = useState(false); // ⬅️ smooth transition

  useEffect(() => {
    fetchCategories();
    fetchJobs();
    fetchArticles();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Ambil kategori
  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) console.error("Gagal ambil kategori:", error);
    else setCategories(data || []);
  }

  // Ambil lowongan kerja
  async function fetchJobs() {
    setLoading(true);
    let query = supabase
      .from("jobs")
      .select(
        `
        id,
        title,
        company,
        location,
        job_type,
        date_posted,
        apply_link,
        poster_url,
        category_id,
        categories (name)
      `
      )
      .order("id", { ascending: false });

    if (selectedCategory) query = query.eq("category_id", selectedCategory);

    const { data, error } = await query;
    if (error) console.error(error);
    else setJobs(data || []);

    // Tambahkan delay kecil agar transisi lebih natural
    setTimeout(() => setLoading(false), 400);
  }

  // Ambil artikel
  async function fetchArticles() {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("date_posted", { ascending: false });
    if (error) console.error("Gagal ambil artikel:", error);
    else setArticles(data || []);
  }

  // Filter pencarian realtime
  const filteredJobs = jobs.filter((job = {}) =>
    [job.title, job.company, job.location, job.job_type]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Transisi halus saat mengetik search
  useEffect(() => {
    setTransitioning(true);
    const timeout = setTimeout(() => setTransitioning(false), 200);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-blue-50 text-gray-800">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-[#0A66C2] to-[#004a99] backdrop-blur-md shadow-md border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-3xl md:text-4xl font-extrabold text-white tracking-tight"
          >
            Cari<span className="text-blue-200">Kerja</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-white font-semibold hover:text-blue-200 transition"
            >
              Beranda
            </Link>
            <Link
              to="/lowongan"
              className="text-white font-semibold hover:text-blue-200 transition"
            >
              Lowongan
            </Link>
            <Link
              to="/artikel"
              className="text-white font-semibold hover:text-blue-200 transition"
            >
              Artikel
            </Link>
            <Link
              to="/tentang"
              className="text-white font-semibold hover:text-blue-200 transition"
            >
              Tentang Kami
            </Link>
          </nav>

          <Link
            to="/login"
            className="ml-4 bg-white text-[#0A66C2] px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-sm md:text-lg shadow-md hover:bg-blue-50 transition"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative w-full min-h-[480px] flex flex-col justify-center items-center text-white mt-[78px]"
        style={{
          backgroundImage: "url('/images/header1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A66C2]/70 via-[#0A66C2]/45 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 w-full px-6 mt-14"
        >
          <div className="max-w-7xl mx-auto">
            <div className="mx-auto w-full max-w-3xl">
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white/45 backdrop-blur-xl rounded-full flex flex-col sm:flex-row items-center shadow-lg p-3 border border-white/40 transition hover:shadow-2xl hover:bg-white/55"
              >
                {/* DROPDOWN */}
                <div className="relative group w-full sm:w-auto mb-2 sm:mb-0 sm:mr-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                    className="flex items-center justify-between w-full sm:w-48 bg-white/60 text-gray-700 font-medium px-4 py-2 rounded-full focus:outline-none shadow-sm hover:bg-white/70"
                  >
                    {selectedCategory
                      ? categories.find((c) => c.id === selectedCategory)?.name
                      : "Semua Kategori"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full mt-2 w-full sm:w-48 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 z-50"
                    >
                      <ul className="max-h-48 overflow-y-auto">
                        <li
                          onClick={() => {
                            setSelectedCategory("");
                            setDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-[#0A66C2]/10 cursor-pointer text-gray-700"
                        >
                          Semua Kategori
                        </li>
                        {categories.map((cat) => (
                          <li
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setDropdownOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-[#0A66C2]/10 cursor-pointer text-gray-700"
                          >
                            {cat.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* SEARCH INPUT */}
                <div className="flex-grow flex items-center bg-white/30 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-[#0A66C2]/40 transition backdrop-blur-md">
                  <Search className="text-gray-400 w-5 h-5 mr-2" />
                  <input
                    type="text"
                    placeholder="Cari perusahaan, pekerjaan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-grow bg-transparent outline-none text-gray-700 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full px-8 lg:px-16 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[8fr_2fr] gap-10">
          {/* BAGIAN KIRI — Lowongan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <h3 className="text-2xl font-bold text-[#0A66C2] mb-5">
              Lowongan Kerja Terbaru
            </h3>

            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-lg font-medium">Memuat data lowongan...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center min-h-[45vh] text-center space-y-5"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-200 blur-2xl opacity-40 rounded-full"></div>
                    <div className="relative bg-white shadow-xl rounded-full p-5 border border-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-16 h-16 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 9V5.25m4.5 3.75V5.25M4.5 9h15m-1.125 2.25v6.75A2.25 2.25 0 0116.125 20.25H7.875a2.25 2.25 0 01-2.25-2.25v-6.75m14.25 0H4.5"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-2xl font-semibold text-gray-700">
                      Tidak ada hasil yang cocok
                    </h4>
                    <p className="text-gray-500 text-base mt-1">
                      Coba gunakan kata kunci atau kategori lain untuk menemukan
                      peluang baru.
                    </p>
                  </div>

                  <button
                    onClick={() => setSearch("")}
                    className="mt-4 px-5 py-2 bg-[#0A66C2] text-white rounded-full text-sm font-medium shadow-md hover:bg-blue-700 transition-all"
                  >
                    Lihat semua lowongan
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid gap-8"
                >
                  {filteredJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-transform hover:-translate-y-1"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {job.title}
                          </h2>
                          <p className="text-lg text-gray-600 mt-1">
                            {job.company} • {job.location}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {job.job_type && (
                              <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full border border-green-200">
                                {job.job_type}
                              </span>
                            )}
                            {job.categories && (
                              <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full border border-blue-200">
                                {job.categories.name}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-3">
                            Diposting:{" "}
                            {new Date(job.date_posted).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <Link
                          to={`/job/${job.id}`}
                          className="bg-[#0A66C2] text-white px-6 py-3 rounded-xl text-lg font-medium hover:bg-blue-700 transition"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* BAGIAN KANAN — Artikel */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <h3 className="text-2xl font-bold text-[#0A66C2] mb-5">
              Artikel Terbaru
            </h3>

            <div className="space-y-6">
              {articles.length === 0 ? (
                <p className="text-gray-500 text-sm">Belum ada artikel.</p>
              ) : (
                articles.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-transform hover:-translate-y-1 overflow-hidden"
                  >
                    <img
                      src={a.image}
                      alt={a.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                        {a.title}
                      </h4>
                      {a.date_posted && (
                        <p className="text-xs text-gray-400 mb-2">
                          {new Date(a.date_posted).toLocaleDateString("id-ID")}
                        </p>
                      )}
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {a.excerpt}
                      </p>
                      <Link
                        to={`/article/${a.id}`}
                        className="text-[#0A66C2] font-medium hover:underline text-sm"
                      >
                        Baca Selengkapnya →
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative w-full bg-gradient-to-br from-[#0A66C2] to-[#004182] text-white pt-10 pb-8 mt-16 overflow-hidden">
        {/* Background Accent */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[360px] h-[360px] bg-white/10 blur-3xl opacity-20 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            {/* Brand Info */}
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Carikerja<span className="text-blue-200">.</span>
              </h2>
              <p className="text-blue-100 text-sm max-w-sm leading-relaxed">
                Platform pencarian kerja modern untuk membantu masyarakat
                Indonesia menemukan karier terbaik — cepat, akurat, dan penuh
                inspirasi.
              </p>
            </div>

            {/* Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-blue-100 font-medium">
              <Link to="/" className="hover:text-white transition">
                Beranda
              </Link>
              <Link to="/lowongan" className="hover:text-white transition">
                Lowongan
              </Link>
              <Link to="/artikel" className="hover:text-white transition">
                Artikel
              </Link>
              <Link to="/tentang" className="hover:text-white transition">
                Tentang
              </Link>
            </div>

            {/* Social Media */}
            <div className="flex items-center justify-center gap-3">
              <a
                href="mailto:lokerinfo167@gmail.com"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4.5 h-4.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4h16v16H4zM4 4l8 8m8-8l-8 8"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Divider Line */}
          <div className="my-8 border-t border-white/10"></div>

          {/* Bottom Section */}
          <div className="text-center text-xs md:text-sm text-blue-100 space-y-1">
            <p className="flex flex-col md:flex-row items-center justify-center gap-1.5">
              <span>
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-white tracking-wide">
                  Carikerja
                </span>
              </span>
              <span className="hidden md:inline text-blue-300">•</span>
              <span className="text-blue-200">
                Membangun masa depan karier Indonesia yang lebih baik
              </span>
            </p>

            <p className="mt-1 text-blue-200/80 flex items-center justify-center gap-1.5">
              <span>Dibuat dengan</span>
              <span className="text-red-400 animate-pulse">❤️</span>
              <span>oleh</span>
              <span className="font-semibold text-white hover:text-blue-200 transition">
                Mas Fajar
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
