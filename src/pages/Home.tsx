import React from 'react';
import Hero from '../components/Hero';
import WhyUs from '../components/WhyUs';
import Process from '../components/Process';
import Services from '../components/Services';
import Audience from '../components/Audience';
import CEOCommitment from '../components/CEOCommitment';
import Results from '../components/Results';
import Contact from '../components/Contact';

const Home: React.FC = () => {
    return (
        <>
            <Hero />
            <WhyUs />
            <Process />
            <Services />
            <Audience />
            <CEOCommitment />
            <Results />
            <Contact />
        </>
    );
};

export default Home;
