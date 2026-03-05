import React from 'react'
import Navbar from '../components/landingPage/Navbar'
import Hero from '../components/landingPage/Hero'
import Features from '../components/landingPage/Features'
import Pricing from '../components/landingPage/Pricing'
import Contact from '../components/landingPage/Contact'
import Footer from '../components/landingPage/Footer'


const LandingPage = () => {
  return (
    <div>
        <Navbar/>
        <Hero/>
        <Features/>
        <Pricing/>
        <Contact/>
        <Footer/>
    </div>
  )
}

export default LandingPage