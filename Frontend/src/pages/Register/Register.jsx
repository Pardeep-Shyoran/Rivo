import React, { useEffect, useState } from "react";
import styles from "./Register.module.css";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../api/axiosconfig";

const Register = () => {
  const navigate = useNavigate();

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
      role: "user",
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
    // TODO: replace with real submit logic (API call)
    // console.log("Register form submitted:", data);

    try {
      const response = await axios.post("/api/auth/register", data);
      // console.log('Registration successful:', response.data);
      toast.success(response.data.message || "Registration successful!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data.message || "Registration failed!");
    }

    navigate("/");
    reset();
  };

  const onContinueWithGoogle = () => {
    // placeholder for OAuth flow
    window.location.href = `${
      import.meta.env.VITE_BACKEND_URL
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
                  role === "user" ? styles.active : ""
                }`}
                onClick={() => setValue("role", "user")}
                aria-pressed={role === "user"}
              >
                User
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
