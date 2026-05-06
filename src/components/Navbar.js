import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import brainAnimation from '../animation/DeepLearning.json';

const navLinks = [
    { href: '/', label: 'Vision' },
    { href: '/workflow', label: 'Workflow' },
    { href: '/roles', label: 'Roles' },
    { href: '/tech', label: 'Tech' },
];

export default function Navbar() {
    const { pathname } = useLocation();

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] flex h-[10vh] min-h-[10vh] w-full items-center bg-[#FEFFFF]/95 backdrop-blur-sm">
            <nav className="mx-auto flex h-full w-[85%] items-center justify-between font-sans">
            {/* Logo */}
            <Link to="/" className="flex items-center text-2xl font-bold tracking-tight">
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
                {/* Nav Links */}
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

                {/* CTA Button */}
                <Link
                    to="/profile"
                    className="hidden md:block bg-[#0094BD] text-white px-8 py-2.5 rounded-full lg:text-base text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    Profile
                </Link>
            </div>
            </nav>
        </header>
    );
}
