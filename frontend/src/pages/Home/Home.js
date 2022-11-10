import React from 'react'
import { RiProductHuntLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import './Home.css'
import heroImg from '../../assets/inv-img.png'



const Home = () => {
  return (
    <div className='home'>
      <nav className='container --flex-between'>
        <div className='logo'>
            <RiProductHuntLine size={35} />
        </div>
        <ul className='home-links'>
            <li>
                <Link to="/register">Register</Link>
            </li>
            <li>
                <button className='--btn --btn-primary'>
                    <Link to="/login">Login</Link>
                </button>
            </li>
            <li>
                <button className='--btn --btn-primary'>
                    <Link to="/dashboard">Dashboard</Link>
                </button>
            </li>
        </ul>
      </nav>

      {/* hero section  */}
      <section className="container hero">
        <div className="hero-text">
            <h2>Inventory & Stock Management Solution</h2>
            <p>Inventory System to control and manage products in the warehouse in real in real time and integrated to make it easier to develop business.</p>
            <div className="hero-buttons">
                <button className='--btn --btn-secondary'>
                    <Link to="/dashboard">Free Trial 1 Month</Link>
                </button>
            </div>
            <div className="--flex-start">
                <NumberText num="14k" text="Brand Owners"/>
                <NumberText num="23k" text="Active Users"/>
                <NumberText num="500+" text="Partner"/>
            </div>
        </div>
        <div className="hero-image">
            <img src={heroImg} alt="" />
        </div>
      </section>
    </div>
  )
}

const NumberText = ({num, text}) => {
    return (
        <div className="--mr">
            <h3 className='--color-white'>{num}</h3>
            <p className='--color-white'>{text}</p>
        </div>
    )
}

export default Home
