import React, { useEffect, useState } from "react";
import styles from "./Register.module.css";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../api/axiosAuthConfig";
import useLoader from "../../contexts/useLoader";
import { useUser } from "../../contexts/useUser";

const Register = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { setUser } = useUser();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      fullName: { firstName: "", lastName: "" },
      password: "",
      role: "listener",
    },
  });

  const role = watch("role");
  const emailValue = watch("email");
  const passwordValue = watch("password");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // trigger entry animation
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailValue ? emailRegex.test(emailValue) : true;

  const getPasswordStrength = (pw = "") => {
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    return score; // 0..4
  };

  const strength = getPasswordStrength(passwordValue);
  const strengthPercent = (strength / 4) * 100;
  const strengthText = passwordValue
    ? strength <= 1
      ? "Weak"
      : strength === 2
      ? "Fair"
      : strength === 3
      ? "Good"
      : "Strong"
    : "";

  const onSubmit = async (data) => {
    showLoader();
    try {
      const response = await axios.post("/api/auth/register", data);
      toast.success(response.data.message || "Registration successful!");
      reset();
      setUser(response.data.user); // Update user context immediately
      
      if (response.data.user.role === "artist") {
        navigate("/artist/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data.message || "Registration failed!");
    } finally {
      hideLoader();
    }
  };

  const onContinueWithGoogle = () => {
    // placeholder for OAuth flow
    window.location.href = `${
      import.meta.env.VITE_BACKEND_AUTH_URL
    }/api/auth/google`;
  };

  return (
    <>
      <Helmet>
        <title>Register || Rivo</title>
        <meta name="description" content="Register page for Rivo" />
      </Helmet>

      <div className={styles.container}>
        <form
          className={`${styles.form} ${
            mounted ? styles.visible : styles.hidden
          }`}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <p className={styles.tagline}>
            Join the community — create your space
          </p>
          <h2 className={styles.title}>Create an account</h2>

          <div className={`${styles.field} ${emailValue ? styles.filled : ""}`}>
            <span className={styles.icon} aria-hidden>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <input
              id="email"
              type="email"
              className={styles.input}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email",
                },
              })}
            />
            <label className={styles.floatingLabel} htmlFor="email">
              Email
            </label>
          </div>
          {errors.email && (
            <p className={styles.error}>{errors.email.message}</p>
          )}
          {!isEmailValid && emailValue && (
            <p className={styles.inlineError} role="status">
              Looks like an invalid email
            </p>
          )}

          <div className={styles.row}>
            <div className={styles.col}>
              <div
                className={`${styles.field} ${
                  watch("fullName.firstName") ? styles.filled : ""
                }`}
              >
                <span className={styles.icon} aria-hidden>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  id="firstName"
                  className={styles.input}
                  {...register("fullName.firstName", {
                    required: "First name is required",
                  })}
                />
                <label className={styles.floatingLabel} htmlFor="firstName">
                  First name
                </label>
              </div>
              {errors.fullName?.firstName && (
                <p className={styles.error}>
                  {errors.fullName.firstName.message}
                </p>
              )}
            </div>

            <div className={styles.col}>
              <div
                className={`${styles.field} ${
                  watch("fullName.lastName") ? styles.filled : ""
                }`}
              >
                <span className={styles.icon} aria-hidden>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  id="lastName"
                  className={styles.input}
                  {...register("fullName.lastName", {
                    required: "Last name is required",
                  })}
                />
                <label className={styles.floatingLabel} htmlFor="lastName">
                  Last name
                </label>
              </div>
              {errors.fullName?.lastName && (
                <p className={styles.error}>
                  {errors.fullName.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div
            className={`${styles.field} ${passwordValue ? styles.filled : ""}`}
          >
            <span className={styles.icon} aria-hidden>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 8V7C17 4.79 15.21 3 13 3C10.79 3 9 4.79 9 7V8H7C5.9 8 5 8.9 5 10V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V10C19 8.9 18.1 8 17 8ZM11 7C11 5.9 11.9 5 13 5C14.1 5 15 5.9 15 7V8H11V7Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <input
              id="password"
              type="password"
              className={styles.input}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            <label className={styles.floatingLabel} htmlFor="password">
              Password
            </label>
          </div>
          {errors.password && (
            <p className={styles.error}>{errors.password.message}</p>
          )}

          <div className={styles.passwordMeta}>
            <div className={styles.strengthBar} aria-hidden>
              <div
                className={styles.strengthFill}
                style={{ width: `${strengthPercent}%` }}
              />
            </div>
            <div className={styles.strengthText}>{strengthText}</div>
          </div>

          <fieldset className={styles.radioGroup}>
            <legend className={styles.label}>Role</legend>
            <div className={styles.segmented} role="tablist" aria-label="Role">
              <button
                type="button"
                className={`${styles.segmentedButton} ${
                  role === "listener" ? styles.active : ""
                }`}
                onClick={() => setValue("role", "listener")}
                aria-pressed={role === "listener"}
              >
                Listener
              </button>

              <button
                type="button"
                className={`${styles.segmentedButton} ${
                  role === "artist" ? styles.active : ""
                }`}
                onClick={() => setValue("role", "artist")}
                aria-pressed={role === "artist"}
              >
                Artist
              </button>
            </div>
          </fieldset>

          <button
            type="button"
            className={styles.google}
            onClick={onContinueWithGoogle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <defs>
                <radialGradient
                  id="prefix__b"
                  cx="1.479"
                  cy="12.788"
                  fx="1.479"
                  fy="12.788"
                  r="9.655"
                  gradientTransform="matrix(.8032 0 0 1.0842 2.459 -.293)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset=".368" stop-color="#ffcf09" />
                  <stop offset=".718" stop-color="#ffcf09" stop-opacity=".7" />
                  <stop offset="1" stop-color="#ffcf09" stop-opacity="0" />
                </radialGradient>
                <radialGradient
                  id="prefix__c"
                  cx="14.295"
                  cy="23.291"
                  fx="14.295"
                  fy="23.291"
                  r="11.878"
                  gradientTransform="matrix(1.3272 0 0 1.0073 -3.434 -.672)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset=".383" stop-color="#34a853" />
                  <stop offset=".706" stop-color="#34a853" stop-opacity=".7" />
                  <stop offset="1" stop-color="#34a853" stop-opacity="0" />
                </radialGradient>
                <linearGradient
                  id="prefix__d"
                  x1="23.558"
                  y1="6.286"
                  x2="12.148"
                  y2="20.299"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset=".671" stop-color="#4285f4" />
                  <stop offset=".885" stop-color="#4285f4" stop-opacity="0" />
                </linearGradient>
                <clipPath id="prefix__a">
                  <path
                    d="M22.36 10H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53h-.013l.013-.01c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09c.87-2.6 3.3-4.53 6.16-4.53 1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07 1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93v.01C3.99 20.53 7.7 23 12 23c2.97 0 5.46-.98 7.28-2.66 2.08-1.92 3.28-4.74 3.28-8.09 0-.78-.07-1.53-.2-2.25z"
                    fill="none"
                  />
                </clipPath>
              </defs>
              <path
                d="M22.36 10H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53h-.013l.013-.01c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09c.87-2.6 3.3-4.53 6.16-4.53 1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07 1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93v.01C3.99 20.53 7.7 23 12 23c2.97 0 5.46-.98 7.28-2.66 2.08-1.92 3.28-4.74 3.28-8.09 0-.78-.07-1.53-.2-2.25z"
                fill="#fc4c53"
              />
              <g clip-path="url(#prefix__a)">
                <ellipse
                  cx="3.646"
                  cy="13.572"
                  rx="7.755"
                  ry="10.469"
                  fill="url(#prefix__b)"
                />
                <ellipse
                  cx="15.538"
                  cy="22.789"
                  rx="15.765"
                  ry="11.965"
                  transform="rotate(-7.12 15.539 22.789)"
                  fill="url(#prefix__c)"
                />
                <path
                  fill="url(#prefix__d)"
                  d="M11.105 8.28l.491 5.596.623 3.747 7.362 6.848 8.607-15.897-17.083-.294z"
                />
              </g>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            className={styles.submit}
            type="submit"
            disabled={isSubmitting}
          >
            <span className={styles.btnContent}>
              {isSubmitting && <span className={styles.spinner} aria-hidden />}
              {isSubmitting ? "Registering..." : "Register"}
            </span>
          </button>
          <p className={styles["register-loginpage"]}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Register;
