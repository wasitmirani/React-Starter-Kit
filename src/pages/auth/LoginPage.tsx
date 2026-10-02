import { Link } from 'react-router-dom'
import { LoginForm } from '@/components/features/auth/LoginForm'
import { ROUTES } from '@/constants/routes.constants'

export function LoginPage() {
  const year = new Date().getFullYear()

  return (
    <div className="col-md-9 col-lg-7 col-xxl-6">
      <div className="p-4 p-md-10 pb-20 pb-md-16 pb-xl-10">
        <div className="mb-4 text-center">
          <Link to={ROUTES.HOME} className="logos">
            <img
              src="assets/images/main-logo.webp"
              loading="lazy"
              alt="Main Logo"
              className="h-7 logo-dark"
            />
            <img
              src="assets/images/logo-white.webp"
              loading="lazy"
              alt="Logo White"
              className="h-7 logo-light"
            />
          </Link>
        </div>
        <h5 className="mb-12 text-center text-gradient fs-lg fw-medium">
          Welcome Back, Emma Anderson!
        </h5>
        <div className="d-flex flex-wrap gap-2 justify-content-between mb-8">
          <h6 className="mb-0 fs-16 fw-bold">Sign In</h6>
          <p className="text-center text-muted mb-0">
            Don&apos;t have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-body fw-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        <LoginForm />

        <div className="position-relative text-center mt-8 mb-5 d-flex align-items-center gap-2">
          <div className="border-top border-dark-subtle w-50 border-dashed" />
          <p className="text-muted p-2 flex-shrink-0 mb-0">Or Sign In With</p>
          <div className="end-0 border-top border-dark-subtle w-50 border-dashed" />
        </div>
        <div className="d-flex gap-5 justify-content-center">
          <a href="#!" className="btn btn-danger gradient-dark-danger rounded-circle size-9 btn-icon">
            <i className="ri-google-fill fs-lg" />
          </a>
          <a href="#!" className="btn btn-primary gradient-dark-primary rounded-circle size-9 btn-icon">
            <i className="ri-facebook-fill fs-lg" />
          </a>
          <a href="#!" className="btn btn-dark gradient-dark-dark rounded-circle size-9 btn-icon">
            <i className="ri-github-fill fs-lg" />
          </a>
          <a href="#!" className="btn btn-secondary gradient-dark-secondary rounded-circle size-9 btn-icon">
            <i className="ri-linkedin-fill fs-lg" />
          </a>
          <a href="#!" className="btn btn-info gradient-dark-info rounded-circle size-9 btn-icon">
            <i className="ri-twitter-fill fs-lg" />
          </a>
        </div>
      </div>
      <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-center p-5 pb-xxl-0">
        <p className="mb-0 text-center fs-15 text-muted">
          © {year} Alloce. Control Panel{' '}
          <i className="ri-heart-3-fill text-danger" /> by SRBThemes
        </p>
      </div>
    </div>
  )
}
