'use client'

import { useState } from "react"
import { supabase } from "../utils/supabase/client"
import { useRouter } from "next/navigation"

export default function AuthForm(){
    const [isNewUser, setIsNewUser] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [isSigningUp, setIsSigningUp] = useState(false)
    const router = useRouter()

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSigningIn(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        console.log({ error, data });
        if (!error) {
            router.push('/profile');
        } else {
            setIsSigningIn(false);
        }
    }

    async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSigningUp(true); // Indicate signup is in progress
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        setIsSigningUp(false); // Reset the signup indicator
        if (!error && data.user) {
            console.log('Signup successful, user:', data.user);
            // Optionally, handle verification email sent info
            // Redirect to profile or another page as needed
            router.push('/profile');
        } else {
            console.log({ error });
            // Handle error, show message to the user
        }
    }

    let signInMessage = 'Sign In';

    if (isSigningIn){
        signInMessage = 'Signing In'
    } else if (isNewUser){
        signInMessage = 'Sign Up'
    }

    const signUpMessage = <p className="text-center text-white">Email sent! Check your email to confirm sign up.</p>

    return (
        <form onSubmit={isNewUser ? handleSignUp : handleLogin} className="space-y-8">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
            />
            <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {signInMessage}
            </button>
            <p className="text-center text-white">
                {isNewUser ? (
                <>
                    Already have an account? {' '}
                    <button
                    type="button"
                    onClick={() => setIsNewUser(false)}
                    className="text-indigo-400 hover:text-indigo-600"
                    >
                    Sign In
                    </button>
                </>
                ) : (
                <>
                    Don't have an account? {' '}
                    <button
                    type="button"
                    onClick={() => setIsNewUser(true)}
                    className="text-indigo-400 hover:text-indigo-600"
                    >
                    Sign Up
                    </button>
                </>
                )}
            </p>
            {isSigningUp && signUpMessage}
        </form>
  );
}