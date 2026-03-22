import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2, Bot, CalendarDays, Users, LineChart, UtensilsCrossed, Smartphone, ShieldCheck } from 'lucide-react';
import api from '../../services/centralApi';

const BENTO_ICONS = [Smartphone, UtensilsCrossed, LineChart, ShieldCheck, Users, CalendarDays, Bot];

export default function LandingPage() {
  const { t } = useTranslation();
  const [s, setS] = useState({});

  useEffect(() => {
    api.get('/saas/settings').then(res => {
      if (res.data) setS(res.data);
    }).catch(() => {});
  }, []);

  const val = (key, fallback) => s[key] || fallback;

  const badgeText = val('landing_badge_text', t('hero.badge'));
  const heroTitle = val('landing_hero_title', t('hero.title'));
  const heroSubtitle = val('landing_hero_subtitle', t('hero.subtitle'));
  const ctaPrimary = val('landing_cta_primary', t('hero.cta'));
  const ctaSecondary = val('landing_cta_secondary', t('nav.features'));
  const trialTagline = val('landing_trial_tagline', t('hero.trial'));
  const heroImageUrl = s.landing_hero_image_url || '';
  const socialProofLabel = val('landing_social_proof_label', t('landing.socialProof'));
  const brandsText = val('landing_social_proof_brands', 'The Grill House,Bistro Uno,Saveur,Urban Plates,Coast & Co');
  
  const feature1Title = val('landing_feature1_title', t('landing.feature1.title'));
  const feature1Subtitle = val('landing_feature1_subtitle', t('landing.feature1.subtitle'));
  const feature1BulletsStr = val('landing_feature1_bullets', `${t('landing.feature1.bullet1')}\n${t('landing.feature1.bullet2')}\n${t('landing.feature1.bullet3')}`);
  
  const feature2Title = val('landing_feature2_title', t('landing.feature2.title'));
  const feature2Subtitle = val('landing_feature2_subtitle', t('landing.feature2.subtitle'));
  const feature2BulletsStr = val('landing_feature2_bullets', `${t('landing.feature2.bullet1')}\n${t('landing.feature2.bullet2')}\n${t('landing.feature2.bullet3')}`);
  
  const bentoHeading = val('landing_bento_heading', t('landing.bento.heading'));
  const bentoSubheading = val('landing_bento_subheading', t('landing.bento.subheading'));
  const bentoItemsStr = val('landing_bento_items', `${t('landing.bento.item1_title')} | ${t('landing.bento.item1_desc')}\n${t('landing.bento.item2_title')} | ${t('landing.bento.item2_desc')}\n${t('landing.bento.item3_title')} | ${t('landing.bento.item3_desc')}\n${t('landing.bento.item4_title')} | ${t('landing.bento.item4_desc')}`);
  
  const ctaSectionTitle = val('landing_cta_section_title', t('landing.cta_section.title'));
  const ctaSectionBody = val('landing_cta_section_body', t('landing.cta_section.body'));
  const ctaSectionButton = val('landing_cta_section_button', t('landing.cta_section.button'));

  const brands = brandsText.split(',').map(b => b.trim()).filter(Boolean);
  const feature1Bullets = feature1BulletsStr.split('\n').filter(Boolean);
  const feature2Bullets = feature2BulletsStr.split('\n').filter(Boolean);
  const bentoItems = bentoItemsStr.split('\n').filter(Boolean).map((line, i) => {
    const [title, desc] = line.split('|').map(x => x.trim());
    return { title, desc: desc || '', icon: BENTO_ICONS[i % BENTO_ICONS.length] };
  });

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: 'easeOut' }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true, margin: '-100px' }
  };

  return (
    <div className="w-full overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-32 md:pt-40 md:pb-48 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            {badgeText && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-sm font-medium mb-8">
                <SparkleIcon /> {badgeText}
              </div>
            )}

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.1] mb-8">
              {heroTitle}
            </h1>

            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
              {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 group"
              >
                {ctaPrimary}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/features"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white rounded-full font-bold text-lg transition-all flex items-center justify-center"
              >
                {ctaSecondary}
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">{trialTagline}</p>
          </motion.div>
        </div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto mt-24 relative z-10"
        >
          <div className="rounded-2xl md:rounded-[2rem] border border-slate-800 bg-slate-900/50 p-2 md:p-4 backdrop-blur-xl shadow-2xl shadow-blue-900/20 overflow-hidden">
            {s.landing_hero_image_url ? (
              <img
                src={s.landing_hero_image_url}
                alt="Resevit Dashboard"
                className="w-full rounded-xl md:rounded-2xl object-cover object-top"
                style={{ maxHeight: '520px' }}
              />
            ) : (
              <div className="rounded-xl md:rounded-2xl border border-slate-800 bg-slate-950 aspect-[16/9] w-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-4 p-8 opacity-20">
                  <div className="col-span-1 row-span-3 border border-slate-700 rounded-xl bg-slate-900" />
                  <div className="col-span-3 row-span-1 border border-slate-700 rounded-xl bg-slate-900" />
                  <div className="col-span-2 row-span-2 border border-slate-700 rounded-xl bg-slate-900" />
                  <div className="col-span-1 row-span-1 border border-slate-700 rounded-xl bg-slate-900" />
                  <div className="col-span-1 row-span-1 border border-slate-700 rounded-xl bg-slate-900" />
                </div>
                <div className="z-10 flex flex-col items-center">
                  <Bot className="w-16 h-16 text-blue-500 mb-4 opacity-50" />
                  <span className="text-slate-600 font-mono text-sm tracking-widest uppercase">Add a hero image URL in admin to replace this</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 to-transparent" />
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Social Proof ── */}
      {brands.length > 0 && (
        <section className="py-12 border-y border-slate-800/50 bg-slate-900/20">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">{socialProofLabel}</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {brands.map((name, i) => (
                <div key={i} className="text-xl md:text-2xl font-black text-slate-300 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-400" />
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Feature 1 ── */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" className="flex flex-col md:flex-row items-center gap-16 mb-32">
            <div className="flex-1 space-y-8">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <CalendarDays className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{feature1Title}</h2>
              <p className="text-xl text-slate-400 leading-relaxed">{feature1Subtitle}</p>
              {feature1Bullets.length > 0 && (
                <ul className="space-y-4">
                  {feature1Bullets.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-square md:aspect-[4/3] rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent" />
                <div className="w-full max-w-md bg-slate-950 rounded-xl border border-slate-800 shadow-2xl p-6 relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-4 w-32 bg-slate-800 rounded" />
                    <div className="h-6 w-20 bg-blue-500/20 rounded-full" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 w-full bg-slate-900 rounded-lg flex items-center px-4 gap-4 border border-slate-800/50">
                        <div className="h-10 w-10 bg-slate-800 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-2 w-1/2 bg-slate-700 rounded" />
                          <div className="h-2 w-1/4 bg-slate-800 rounded" />
                        </div>
                        <div className="h-6 w-16 bg-emerald-500/10 rounded-full border border-emerald-500/20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Feature 2 ── */}
          <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" className="flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{feature2Title}</h2>
              <p className="text-xl text-slate-400 leading-relaxed">{feature2Subtitle}</p>
              {feature2Bullets.length > 0 && (
                <ul className="space-y-4">
                  {feature2Bullets.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-square md:aspect-[4/3] rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-transparent" />
                <div className="w-full max-w-sm bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative z-10">
                  <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-semibold text-white">{t('landing.bento.item3_title')}</span>
                  </div>
                  <div className="p-6 space-y-4">
                    {[t('demo.guest_note1'), t('demo.guest_note2'), t('demo.guest_note3')].map((note, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="h-8 w-8 rounded-full bg-purple-500/20 flex-shrink-0" />
                        <p className="text-slate-300 text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      {bentoItems.length > 0 && (
        <section className="py-24 px-6 bg-slate-900/30 border-y border-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">{bentoHeading}</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">{bentoSubheading}</p>
            </div>

            <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px]">
              {bentoItems.map((feature, i) => {
                const colSpans = ['md:col-span-2', 'md:col-span-1', 'md:col-span-1', 'md:col-span-2'];
                const bgs = [
                  'bg-gradient-to-br from-blue-900/20 to-slate-900',
                  'bg-gradient-to-br from-orange-900/20 to-slate-900',
                  'bg-gradient-to-br from-emerald-900/20 to-slate-900',
                  'bg-gradient-to-br from-rose-900/20 to-slate-900',
                  'bg-gradient-to-br from-purple-900/20 to-slate-900',
                  'bg-gradient-to-br from-amber-900/20 to-slate-900',
                ];
                return (
                  <motion.div
                    key={i}
                    variants={fadeIn}
                    className={`rounded-3xl border border-slate-800 p-8 flex flex-col justify-between group overflow-hidden relative ${colSpans[i % colSpans.length]} ${bgs[i % bgs.length]}`}
                  >
                    <div className="absolute inset-0 bg-slate-800/0 group-hover:bg-slate-800/10 transition-colors duration-500" />
                    <feature.icon className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors relative z-10" />
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                      {feature.desc && <p className="text-slate-500 text-sm mt-1">{feature.desc}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeIn} initial="initial" whileInView="whileInView"
            className="rounded-[3rem] bg-gradient-to-b from-blue-600 to-indigo-900 p-12 md:p-20 text-center relative overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-900/20"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-white/5 blur-[100px] pointer-events-none" />
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 relative z-10">
              {ctaSectionTitle}
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 relative z-10">
              {ctaSectionBody}
            </p>
            <div className="flex justify-center relative z-10">
              <Link
                to="/register"
                className="px-10 py-5 bg-white text-blue-900 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                {ctaSectionButton}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
