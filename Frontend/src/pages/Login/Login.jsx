import React, { useEffect, useState } from "react";
import styles from "./Login.module.css";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../api/axiosconfig";

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const emailValue = watch("email");
  const passwordValue = watch("password");

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
    // Frontend-only: no auth logic here
    // You can wire this up to your API later
    // console.log("Login form submitted:", data);

    try {
      const response = await axios.post("/api/auth/login", data);
      // console.log('Login successful:', response.data);
      toast.success(response.data.message || "Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data.message || "Login failed!");
    }

    navigate("/");
    reset();
  };

  const onContinueWithGoogle = () => {
    window.location.href = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/auth/google`;
  };

  return (
    <>
      <Helmet>
        <title>Login || Rivo</title>
        <meta name="description" content="Login to your account" />
      </Helmet>

      <div className={styles.container}>
        <form
          className={`${styles.form} ${
            mounted ? styles.visible : styles.hidden
          }`}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <p className={styles.tagline}>Welcome back — we missed you</p>
          <h2 className={styles.title}>Sign in to Rivo</h2>

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

          <button
            type="button"
            className={styles.google}
            onClick={onContinueWithGoogle}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M21.35 11.1h-9.18v2.92h5.26c-.23 1.39-1.46 3.39-5.26 3.39-3.16 0-5.73-2.6-5.73-5.8s2.57-5.8 5.73-5.8c1.8 0 3.02.77 3.71 1.44l2.53-2.44C17.36 3.34 15.37 2.4 12.86 2.4 7.9 2.4 4 6.34 4 11.2s3.9 8.8 8.86 8.8c5.06 0 8.34-3.56 8.34-8.6 0-.58-.06-.99-.05-1.3z"
                fill="currentColor"
              />
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
              {isSubmitting ? "Signing in..." : "Login"}
            </span>
          </button>

          <p className={styles["login-registerpage"]}>
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;
