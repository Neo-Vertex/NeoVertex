import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import WhyUs from '../components/WhyUs';
import Contact from '../components/Contact';

const Home: React.FC = () => {
    return (
        <>
            <Hero />
            <Services />
            <WhyUs />
            <Contact />
        </>
    );
};

export default Home;
