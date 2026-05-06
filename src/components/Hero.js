const features = [
    'Personalized AI Roadmaps',
    'Auto-Generated CVs',
    'Verified Project Data',
    'Direct Employer Hiring',
];

export default function Hero() {
    return (
        <div className="relative z-0 flex flex-col lg:flex-row items-center justify-between w-[90%] lg:w-[85%] mx-auto lg:h-[90vh] py-12 lg:py-0 gap-10 lg:gap-12 mt-4 lg:mt-0">

            {/* Left Content */}
            <div className="relative z-10 flex-1 space-y-6 lg:space-y-8 max-w-4xl text-center lg:text-left flex flex-col items-center lg:items-start">

                <h1 className="text-4xl md:text-5xl xl:text-4xl 2xl:text-7xl font-bold text-gray-900 leading-[1.15]">
                    An{' '}
                    <span className="inline-block bg-gradient-to-r from-[#1387AE] to-[#DC9DEE] text-white px-4 py-1 rounded-full text-3xl md:text-4xl xl:text-3xl 2xl:text-6xl align-middle transform -rotate-1">
                        intelligent
                    </span>
                    <br />
                    learning &amp; work ecosystem.
                </h1>

                <p className="text-sm 2xl:text-lg xl:text-md text-gray-600 leading-relaxed max-w-xs sm:max-w-sm lg:max-w-lg">
                    Syntra.AI merges personalized education, team collaboration, and automated recruitment into one seamless verified workflow.
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 2xl:gap-6">
                    <button className="bg-gradient-to-r from-[#1387AE] to-[#DC9DEE] text-white cursor-pointer px-6 py-2.5 2xl:px-8 2xl:py-3 rounded-full font-semibold text-sm 2xl:text-lg hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20">
                        Get Started
                    </button>
                    <button className="text-[#7E1487] font-bold text-sm 2xl:text-lg hover:underline decoration-2 underline-offset-2 cursor-pointer">
                        View Tech Stack
                    </button>
                </div>

                <hr className="border-gray-300 w-full" />

                {/* Features */}
                <div className="space-y-4 w-full">
                    <div className="inline-block bg-gradient-to-r from-[#1387AE] via-[#8FBFFA] to-[#1387AE] text-white text-sm font-bold px-4 py-1.5 rounded-full">
                        Our Features
                    </div>

                    {/* Grid with cross lines */}
                    <div className="relative grid grid-cols-2 gap-y-6 gap-x-8 p-4">

                        {/* Horizontal line */}
                        <div
                            className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2"
                            style={{ background: 'linear-gradient(90deg, #1387AE 0%, #8FBFFA 50%, #1387AE 100%)', opacity: 0.8 }}
                        />

                        {/* Vertical line */}
                        <div
                            className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2"
                            style={{ background: 'linear-gradient(180deg, #1387AE 0%, #8FBFFA 50%, #1387AE 100%)', opacity: 0.8 }}
                        />

                        {features.map((feat) => (
                            <div key={feat} className="flex items-center gap-3 relative z-10">
                                <div className="w-5 h-5 rounded-full bg-[#4FBBE3] flex items-center justify-center text-white text-xs shrink-0">✓</div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-800">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Robot image (hidden on mobile) */}
            <div className="relative z-10 hidden lg:flex flex-1 w-full justify-end items-end self-stretch">
                <div className="relative w-[350px] h-[450px] lg:w-[550px] lg:h-[550px] xl:w-[650px] xl:h-[650px] 2xl:w-[750px] 2xl:h-[750px]">
                    <img
                        src="/robot.svg"
                        alt="AI Robot"
                        className="h-full w-full object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.25)]"
                    />
                </div>
            </div>
            <div className="pointer-events-none absolute inset-0 z-[-1]">
                <div className="relative hidden h-full w-full lg:block">
                    <img
                          src={'/artificialIntelligence.svg'}
                          alt='background AI pattern'
                          className='h-full w-full object-contain object-right opacity-70 lg:ml-40'
                    />
                </div>
            </div>  

        </div>
    );
}
