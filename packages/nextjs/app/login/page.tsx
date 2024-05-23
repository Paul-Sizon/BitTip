'use client';

import { useAccount } from 'wagmi'


export default function Login() {

    const account = useAccount().address

    return (
        <div>
            {account ? <p>Hi, {account}</p> : <p>Connect to continue</p>}
        </div>
    );
}