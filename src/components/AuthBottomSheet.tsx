import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Mail, Lock, User, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { ref, set } from 'firebase/database';

interface AuthBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthBottomSheet({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthBottomSheetProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Update mode if initialMode changes while closed
  useEffect(() => {
    if (!isOpen) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile
        await updateProfile(user, { displayName: fullName });
        
        // Save to RTDB
        await set(ref(db, `users/${user.uid}`), {
          uid: user.uid,
          fullName,
          email,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save/Update in RTDB
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        fullName: user.displayName || 'Google User',
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString()
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 h-[70%] bg-zinc-950 border-t border-zinc-800 rounded-t-[2.5rem] z-[101] flex flex-col overflow-hidden touch-none"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-8 flex items-center justify-between mt-2">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white leading-none">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                  {mode === 'login' ? 'Login to continue your order' : 'Signup for exclusive benefits'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-8 mt-8">
              <div className="flex p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-tighter text-sm transition-all ${
                    mode === 'login' 
                      ? 'bg-zinc-800 text-brand-red shadow-lg' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-tighter text-sm transition-all ${
                    mode === 'signup' 
                      ? 'bg-zinc-800 text-brand-red shadow-lg' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Signup
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <div className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-tight">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                
                {mode === 'signup' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-red transition-colors" />
                    <input 
                      type="text"
                      placeholder="FULL NAME"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold uppercase tracking-tight text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-red/50 focus:bg-zinc-900 transition-all"
                    />
                  </div>
                )}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-red transition-colors" />
                  <input 
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold uppercase tracking-tight text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-red/50 focus:bg-zinc-900 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-red transition-colors" />
                  <input 
                    type="password"
                    placeholder="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold uppercase tracking-tight text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-red/50 focus:bg-zinc-900 transition-all"
                  />
                </div>

                <div className="pt-4 space-y-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    onClick={handleAuth}
                    className="w-full bg-brand-red hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black uppercase tracking-tighter text-base shadow-[0_4px_20px_rgba(185,28,28,0.3)] group flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' ? 'Login Now' : 'Create Account'}
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-800/50"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                      <span className="bg-zinc-950 px-4 text-zinc-500">Or continue with</span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-tighter text-sm flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </motion.button>
                </div>

                <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-tight mt-8">
                  By continuing, you agree to our <span className="text-zinc-400">Terms of Service</span> and <span className="text-zinc-400">Privacy Policy</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
