import { Link } from 'react-router-dom'
import './Landing.css'

function Landing({ isLoggedIn = false }) {
  return (
    <div className={`landing-page${isLoggedIn ? '' : ' landing-page--guest'}`}>
      <div className="landing-content">
        <h1 className="landing-title">
          Paw Check <span className="landing-emoji" aria-hidden="true">🐾</span>
        </h1>
        <p className="landing-description">
          Keep your pup safe and healthy — check food ingredients for toxins and track
          what your dog eats every day
        </p>
        <div className="landing-actions">
          {isLoggedIn ? (
            <>
              <Link to="/log" className="landing-btn landing-btn--primary">
                Daily Log
              </Link>
              <Link to="/checker" className="landing-btn landing-btn--outline">
                Ingredient Checker
              </Link>
            </>
          ) : (
            <Link to="/login" className="landing-btn landing-btn--primary">
              Log In
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Landing
