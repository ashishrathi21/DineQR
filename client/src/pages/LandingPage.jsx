import React from 'react'
import Navbar from '../components/landingPage/Navbar'
import Hero from '../components/landingPage/Hero'
import Features from '../components/landingPage/Features'
import Pricing from '../components/landingPage/Pricing'
import Footer from '../components/landingPage/Footer'


const LandingPage = () => {
  return (
    <div>
        <Navbar/>
        <Hero/>
        <Features/>
        <Pricing/>
        <Footer/>
    </div>
  )
}

export default LandingPage