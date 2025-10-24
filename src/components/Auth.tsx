import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import * as db from '../services/db';
import { EyeIcon, EyeOffIcon, ChevronDownIcon } from './Icons';

type AuthView = 'login' | 'signup' | 'forgot_email' | 'forgot_question' | 'forgot_reset';

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  onSignup: (userData: Omit<User, 'password'> & {password: string}) => Promise<{success: boolean; error?: string; requiresConfirmation?: boolean}>;
}

const INPUT_CLASS = "w-full bg-white border border-zinc-300 rounded-md px-3 py-2.5 text-sm ring-offset-white focus:outline-none focus:ring-0 transition-colors";
const BUTTON_PRIMARY_CLASS = "w-full bg-zinc-900 text-zinc-50 px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

const securityQuestions = [
    "What was your first pet's name?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "In what city were you born?",
    "What is your favorite book?",
];

interface PasswordInputProps {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({id, value, onChange, placeholder}) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative">
            <input type={isVisible ? 'text' : 'password'} id={id} value={value} onChange={onChange} placeholder={placeholder} className={`${INPUT_CLASS} pr-10`} required />
            <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-zinc-700 transition-colors" aria-label={isVisible ? 'Hide password' : 'Show password'}>
                {isVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5"/>}
            </button>
        </div>
    );
};

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  id: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        id={id}
        type="button"
        className={`${INPUT_CLASS} flex justify-between items-center text-left`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{value}</span>
        <ChevronDownIcon className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 w-full bg-white border border-zinc-200 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option}
              className="text-zinc-900 cursor-pointer select-none relative py-2.5 px-3 hover:bg-zinc-100"
              role="option"
              aria-selected={option === value}
              onClick={() => handleOptionClick(option)}
            >
              <span className={`block truncate ${option === value ? 'font-semibold' : 'font-normal'}`}>
                {option}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const Auth: React.FC<AuthProps> = ({ onLogin, onSignup }) => {
  const [view, setView] = useState<AuthView>('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(securityQuestions[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [retrievedQuestion, setRetrievedQuestion] = useState('');
  const [resetAnswer, setResetAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const resetFormState = () => {
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSecurityAnswer('');
    setSecurityQuestion(securityQuestions[0]);
    setIsLoading(false);
  };

  const handleViewChange = (newView: AuthView) => {
    resetFormState();
    setView(newView);
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const { error } = await onLogin(email.trim(), password);
    if (error) {
        setError(error);
    }
    setIsLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Oops! These passwords don't match.");
      return;
    }
    setError('');
    setIsLoading(true);
    const { success, error, requiresConfirmation } = await onSignup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        securityQuestion,
        securityAnswer: securityAnswer.trim(),
    });
     if (error) {
        setError(error);
    }
    if (success && requiresConfirmation) {
        setShowConfirmationMessage(true);
    }
    setIsLoading(false);
  };
  
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);
      const question = await db.getSecurityQuestionForEmail(resetEmail.trim().toLowerCase());
      if(question) {
          setRetrievedQuestion(question);
          handleViewChange('forgot_question');
      } else {
          setError("We couldn't find an account with that email. Try another?");
      }
      setIsLoading(false);
  };

  const handleForgotQuestionSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      const allUsers = await db.getUsers();
      const user = allUsers.find(u => u.email === resetEmail.trim().toLowerCase());

      // In a real app, this check should be on the backend, and answer comparison should be constant-time.
      if (user && user.securityAnswer === resetAnswer.trim()) {
        handleViewChange('forgot_reset');
      } else {
        setError("That's not the answer we have on file. Please try again.");
      }
      setIsLoading(false);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(newPassword !== confirmNewPassword) {
          setError('Oops! These passwords don\'t match.');
          return;
      }
      setError('');
      setIsLoading(true);
      const { success, error } = await db.resetPassword(resetEmail.trim().toLowerCase(), resetAnswer.trim(), newPassword);
      if(success) {
          alert('Success! Your password has been updated. Please log in to continue.');
          setResetEmail('');
          setRetrievedQuestion('');
          setResetAnswer('');
          setNewPassword('');
          setConfirmNewPassword('');
          handleViewChange('login');
      } else {
          setError(error || "An unknown error occurred.");
      }
      setIsLoading(false);
  };

  if (showConfirmationMessage) {
    return (
      <div className="w-full h-screen lg:grid lg:grid-cols-2">
        <div
          className="hidden lg:block bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/1200x/e2/b0/c9/e2b0c9bf17cb00736d148080e0b1da77.jpg')",
          }}
          role="img"
          aria-label="A vibrant arrangement of colorful sticky notes on a wall, symbolizing decision-making and brainstorming."
        ></div>
        <div className="flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-[350px] gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">One Last Step!</h1>
            <p className="text-zinc-600">
              We've sent a confirmation link to{' '}
              <strong className="text-zinc-900">{email}</strong>. Please check your inbox (and spam folder!) to activate your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderLogin = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={INPUT_CLASS} required />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">Password</label>
            <button type="button" onClick={() => handleViewChange('forgot_email')} className="text-sm font-semibold text-zinc-900 hover:underline">Forgot?</button>
        </div>
        <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div className="pt-2">
          <button type="submit" disabled={isLoading || !email || !password} className={BUTTON_PRIMARY_CLASS}>
              {isLoading ? 'Signing In...' : 'Let\'s Go'}
          </button>
      </div>
    </form>
  );

  const renderSignup = () => (
    <form onSubmit={handleSignupSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className={INPUT_CLASS} required />
      </div>
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
        <input type="email" id="signup-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={INPUT_CLASS} required />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
        <PasswordInput id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="A strong, secret password" />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700 mb-1.5">Confirm Password</label>
        <PasswordInput id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your secret password" />
      </div>
       <div>
            <label htmlFor="security-question" className="block text-sm font-medium text-zinc-700 mb-1.5">Security Question</label>
            <CustomSelect
                id="security-question"
                options={securityQuestions}
                value={securityQuestion}
                onChange={setSecurityQuestion}
            />
        </div>
        <div>
            <label htmlFor="security-answer" className="block text-sm font-medium text-zinc-700 mb-1.5">Security Answer</label>
            <input type="text" id="security-answer" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} placeholder="Your answer (case-sensitive)" className={INPUT_CLASS} required />
        </div>
      <div className="pt-2">
          <button type="submit" disabled={isLoading || !name || !email || !password || !confirmPassword || !securityAnswer} className={BUTTON_PRIMARY_CLASS}>
              {isLoading ? 'Creating Account...' : 'Create My Account'}
          </button>
      </div>
    </form>
  );

  const renderForgotEmail = () => (
    <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
        <p className="text-sm text-zinc-600">Enter your account's email address and we'll help you get back in.</p>
        <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
            <input type="email" id="reset-email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@example.com" className={INPUT_CLASS} required />
        </div>
        <div className="pt-2">
            <button type="submit" disabled={isLoading || !resetEmail} className={BUTTON_PRIMARY_CLASS}>
                {isLoading ? 'Searching...' : 'Find My Account'}
            </button>
        </div>
    </form>
  );
  
  const renderForgotQuestion = () => (
    <form onSubmit={handleForgotQuestionSubmit} className="space-y-4">
        <div>
            <p className="block text-sm font-medium text-zinc-700 mb-1.5">Your Security Question:</p>
            <p className="p-3 bg-zinc-100 rounded-md text-zinc-800">{retrievedQuestion}</p>
        </div>
        <div>
            <label htmlFor="reset-answer" className="block text-sm font-medium text-zinc-700 mb-1.5">Your Answer</label>
            <input type="text" id="reset-answer" value={resetAnswer} onChange={e => setResetAnswer(e.target.value)} placeholder="Enter your answer" className={INPUT_CLASS} required />
        </div>
        <div className="pt-2">
            <button type="submit" disabled={isLoading || !resetAnswer} className={BUTTON_PRIMARY_CLASS}>
                {isLoading ? 'Verifying...' : 'Confirm My Identity'}
            </button>
        </div>
    </form>
  );

  const renderResetPassword = () => (
    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
         <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-zinc-700 mb-1.5">New Password</label>
            <PasswordInput id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
        </div>
        <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-zinc-700 mb-1.5">Confirm New Password</label>
            <PasswordInput id="confirm-new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" />
        </div>
        <div className="pt-2">
            <button type="submit" disabled={isLoading || !newPassword || !confirmNewPassword} className={BUTTON_PRIMARY_CLASS}>
                {isLoading ? 'Resetting...' : 'Save New Password'}
            </button>
        </div>
    </form>
  );

  const renderContent = () => {
      switch(view) {
          case 'login': return renderLogin();
          case 'signup': return renderSignup();
          case 'forgot_email': return renderForgotEmail();
          case 'forgot_question': return renderForgotQuestion();
          case 'forgot_reset': return renderResetPassword();
      }
  }

  const getTitle = () => {
      switch(view) {
          case 'login': return "Welcome Back! Let's Get Deciding.";
          case 'signup': return "Join the Community of Deciders.";
          case 'forgot_email': return "Let's Get You Back In.";
          case 'forgot_question': return "Just a Quick Security Check.";
          case 'forgot_reset': return "Create Your New Key.";
      }
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div
        className="hidden lg:block bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/e2/b0/c9/e2b0c9bf17cb00736d148080e0b1da77.jpg')",
        }}
        role="img"
        aria-label="A vibrant arrangement of colorful sticky notes on a wall, symbolizing decision-making and brainstorming."
      ></div>
      <div className="flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-[350px] gap-4">
          <div className="grid gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight">Squareboard</h1>
            <p className="text-zinc-600">{getTitle()}</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          {renderContent()}

          <div className="mt-2 text-center text-sm">
            {view === 'login' && (
              <button
                onClick={() => handleViewChange('signup')}
                className="font-semibold text-zinc-900 hover:underline"
              >
                New here? Create an account
              </button>
            )}
            {view === 'signup' && (
              <button
                onClick={() => handleViewChange('login')}
                className="font-semibold text-zinc-900 hover:underline"
              >
                Already a member? Sign in
              </button>
            )}
            {(view === 'forgot_email' ||
              view === 'forgot_question' ||
              view === 'forgot_reset') && (
              <button
                onClick={() => handleViewChange('login')}
                className="font-semibold text-zinc-900 hover:underline"
              >
                Nevermind, I remember!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
