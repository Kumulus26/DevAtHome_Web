"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({ answer1: "", answer2: "" });
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isStrongPassword = (password) =>
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "User not found");
      setQuestions(data.questions);
      setUserId(data.userId);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answer1: answers.answer1, answer2: answers.answer2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Answers incorrect");
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!isStrongPassword(newPassword)) {
      setError("Password must be at least 12 characters, include uppercase, lowercase, number, and special character.");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/forgot-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-xl">
        <div className="mb-4 text-left">
          <button
            type="button"
            className="text-blue-400 hover:underline text-sm"
            onClick={() => router.push('/')}
          >
            ← Back to Home
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h1>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">{error}</div>}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400"
            />
            <button type="submit" className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium" disabled={loading}>
              {loading ? "Loading..." : "Next"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleAnswersSubmit} className="space-y-6">
            <div>
              {questions[0] && (
                <>
                  <label className="block text-zinc-400 mb-1">{questions[0].question}</label>
                  <input
                    type="text"
                    value={answers.answer1}
                    onChange={e => setAnswers(a => ({ ...a, answer1: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 mb-4"
                  />
                </>
              )}
              {questions[1] && (
                <>
                  <label className="block text-zinc-400 mb-1">{questions[1].question}</label>
                  <input
                    type="text"
                    value={answers.answer2}
                    onChange={e => setAnswers(a => ({ ...a, answer2: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400"
                  />
                </>
              )}
            </div>
            <button type="submit" className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium" disabled={loading}>
              {loading ? "Checking..." : "Verify"}
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400"
            />
            <div className="text-xs text-zinc-400 mt-1">
              Password must be at least 12 characters, include uppercase, lowercase, number, and special character.
            </div>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400"
            />
            <button type="submit" className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        {step === 4 && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-lg text-green-400 font-semibold">Password changed successfully!</div>
            <button
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
              onClick={() => router.push('/login')}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 