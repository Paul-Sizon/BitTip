import { type NextRequest } from 'next/server'
import {createMiddlewareClient} from '@supabase/auth-helpers-nextjs';
import {NextResponse} from 'next/server'
import { createServerClient } from "@supabase/ssr";


export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
            get(name){
                return req.cookies.get(name)?.value;
            },
            set(name, value, options){
                req.cookies.set({
                    name, value, ...options
                })
                const response = NextResponse.next({
                    request: {
                        headers: req.headers
                    }
                })
                response.cookies.set({
                    name, value, ...options
                })
            },
            remove(name, options){
                req.cookies.set({
                    name, value: '', ...options
                })
                const response = NextResponse.next({
                    request: {
                        headers: req.headers
                    }
                })
                response.cookies.set({
                    name, value: '', ...options
                })
            }
        }
    }
)


    const {data: {user}} = await supabase.auth.getUser();    

    if (user && req.nextUrl.pathname === '/login'){
        return NextResponse.redirect(new URL('/', req.url))
    }

    if (!user && req.nextUrl.pathname === '/profile'){
        return NextResponse.redirect(new URL('/login', req.url))
    }

    return res;
}

export const config = {
  matcher: ['/', '/profile']
}