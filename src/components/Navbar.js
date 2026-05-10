import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { X } from 'lucide-react';
import brainAnimation from '../animation/DeepLearning.json';

const navLinks = [
    { href: '/', label: 'Vision' },
    { href: '/workflow', label: 'Workflow' },
    { href: '/roles', label: 'Roles' },
    { href: '/tech', label: 'Tech' },
];

const menuPanel = {
    closed: { x: '100%', opacity: 0 },
    open: {
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 320, damping: 36, mass: 0.9 },
    },
    exit: {
        x: '100%',
        opacity: 0,
        transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
    },
};

const staggerContainer = {
    closed: {},
    open: {
        transition: { staggerChildren: 0.07, delayChildren: 0.12 },
    },
};

const staggerItem = {
    closed: { opacity: 0, x: 28 },
    open: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 400, damping: 28 },
    },
};

export default function Navbar() {
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = useCallback(() => setMenuOpen(false), []);

    useEffect(() => {
        closeMenu();
    }, [pathname, closeMenu]);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => {
            if (e.key === 'Escape') closeMenu();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [menuOpen, closeMenu]);

    return (
        <header className="fixed top-0 left-0 right-0 z-[1000] flex h-[10vh] min-h-[10vh] w-full items-center bg-[#FEFFFF]/95 backdrop-blur-sm">
            <nav className="mx-auto flex h-full w-[85%] items-center justify-between font-sans">
                {/* Logo */}
                <Link to="/" className="flex items-center text-2xl font-bold tracking-tight z-[10002]">
                    <div className="flex items-center justify-start">
                        <div className="flex">
                            <Lottie
                                animationData={brainAnimation}
                                loop={true}
                                className="h-[min(7vh,48px)] w-[min(7vh,48px)] lg:h-[min(8vh,72px)] lg:w-[min(8vh,72px)]"
                            />
                        </div>
                        <div className="text-2xl tracking-tight text-gray-900 flex items-center lg:-ml-4 -ml-1 justify-start gap-1">
                            <span className="text-black text-3xl">syntra</span>
                            <span className="text-[#7E1487] text-3xl font-semibold">.ai</span>
                        </div>
                    </div>
                </Link>

                <div className="flex items-center justify-end lg:gap-12 gap-6">
                    {/* Desktop nav */}
                    <div className="hidden md:flex lg:gap-10 gap-6 font-medium lg:text-base text-sm">
                        {navLinks.map(({ href, label }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    to={href}
                                    className={`relative py-2 transition-colors duration-200 ${
                                        isActive ? 'text-[#7E1487] font-semibold' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {label}
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-pill"
                                            className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#7E1487]"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 35,
                                            }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <Link
                        to="/profile"
                        className="hidden md:block bg-[#0094BD] text-white px-8 py-2.5 rounded-full lg:text-base text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        Profile
                    </Link>

                    {/* Mobile: creative hamburger */}
                    <button
                        type="button"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-nav-panel"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        onClick={() => setMenuOpen((o) => !o)}
                        className="md:hidden relative z-[10002] flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200/80 bg-white/90 shadow-[0_4px_24px_rgba(19,135,174,0.12)] backdrop-blur-sm transition-shadow hover:shadow-[0_8px_28px_rgba(126,20,135,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1387AE]/40"
                    >
                        <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
                        <div className="flex h-5 w-6 flex-col items-center justify-center gap-[5px]">
                            <motion.span
                                className="block h-[2.5px] w-5 rounded-full bg-gradient-to-r from-[#1387AE] to-[#7E1487] origin-center"
                                animate={
                                    menuOpen
                                        ? { rotate: 45, y: 8, width: '1.25rem' }
                                        : { rotate: 0, y: 0, width: '1.25rem' }
                                }
                                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                            />
                            <motion.span
                                className="block h-[2.5px] w-5 rounded-full bg-gray-700"
                                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                                transition={{ duration: 0.2 }}
                            />
                            <motion.span
                                className="block h-[2.5px] w-5 rounded-full bg-gradient-to-r from-[#7E1487] to-[#1387AE] origin-center"
                                animate={
                                    menuOpen
                                        ? { rotate: -45, y: -8, width: '1.25rem' }
                                        : { rotate: 0, y: 0, width: '1.25rem' }
                                }
                                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                            />
                        </div>
                    </button>
                </div>
            </nav>

            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {menuOpen && (
                            <>
                                <motion.button
                                    type="button"
                                    aria-label="Close menu"
                                    className="md:hidden fixed inset-0 z-[10000] bg-[#0f172a]/45 backdrop-blur-[2px]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    onClick={closeMenu}
                                />

                                <motion.div
                                    id="mobile-nav-panel"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Main navigation"
                                    className="md:hidden fixed inset-y-0 right-0 z-[10001] flex w-[min(100%,20rem)] flex-col overflow-hidden border-l border-white/60 bg-gradient-to-b from-[#FEFFFF] via-[#F0F9FF] to-[#E8E0FF]/90 shadow-[-12px_0_48px_rgba(19,135,174,0.18)]"
                                    variants={menuPanel}
                                    initial="closed"
                                    animate="open"
                                    exit="exit"
                                >
                                    <div className="pointer-events-none absolute -left-24 top-1/4 h-48 w-48 rounded-full bg-[#1387AE]/15 blur-3xl" />
                                    <div className="pointer-events-none absolute -right-8 bottom-1/4 h-40 w-40 rounded-full bg-[#7E1487]/12 blur-3xl" />

                                    <div className="relative flex flex-1 flex-col px-6 pb-8 pt-[calc(10vh+0.75rem)]">
                                        <div className="mb-10 flex shrink-0 items-center justify-end">
                                            <button
                                                type="button"
                                                onClick={closeMenu}
                                                aria-label="Close menu"
                                                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200/90 bg-white/95 text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 active:scale-95"
                                            >
                                                <X className="h-5 w-5 stroke-[2.5]" aria-hidden />
                                            </button>
                                        </div>

                                        <motion.ul
                                            className="flex flex-1 flex-col gap-6"
                                            variants={staggerContainer}
                                            initial="closed"
                                            animate="open"
                                        >
                                            {navLinks.map(({ href, label }, i) => {
                                                const isActive = pathname === href;
                                                return (
                                                    <motion.li key={href} variants={staggerItem}>
                                                        <Link
                                                            to={href}
                                                            onClick={closeMenu}
                                                            className={`group flex items-baseline gap-3 rounded-xl py-4 pl-2 pr-3 transition-colors ${
                                                                isActive ? 'bg-white/70' : 'hover:bg-white/50'
                                                            }`}
                                                        >
                                                            <span className="font-mono text-xs text-[#1387AE]/70 tabular-nums">
                                                                {String(i + 1).padStart(2, '0')}
                                                            </span>
                                                            <span
                                                                className={`text-lg font-semibold tracking-tight ${
                                                                    isActive
                                                                        ? 'bg-gradient-to-r from-[#7E1487] to-[#1387AE] bg-clip-text text-transparent'
                                                                        : 'text-gray-800 group-hover:text-gray-950'
                                                                }`}
                                                            >
                                                                {label}
                                                            </span>
                                                            {isActive && (
                                                                <motion.span
                                                                    layoutId="mobile-nav-dot"
                                                                    className="ml-auto h-2 w-2 rounded-full bg-[#7E1487]"
                                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                                />
                                                            )}
                                                        </Link>
                                                    </motion.li>
                                                );
                                            })}
                                        </motion.ul>

                                        <motion.div
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 28 }}
                                        >
                                            <Link
                                                to="/profile"
                                                onClick={closeMenu}
                                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1387AE] to-[#7E1487] py-3.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(19,135,174,0.35)] transition-transform active:scale-[0.98]"
                                            >
                                                Profile
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </motion.div>
                                    </div>

                                    <div className="relative border-t border-gray-200/60 px-6 py-3 text-center text-[10px] text-gray-400">
                                        Syntra.AI · mobile
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </header>
    );
}
