import React from 'react';
import Hero from '../components/Hero';
import PainSection from '../components/PainSection';
import SolutionSection from '../components/SolutionSection';
import Services from '../components/Services';
import SocialProof from '../components/SocialProof';
import Contact from '../components/Contact';

const Home: React.FC = () => {
    return (
        <>
            <Hero />
            <PainSection />
            <SolutionSection />
            <Services />
            <SocialProof />
            <Contact />
        </>
    );
};

export default Home;
