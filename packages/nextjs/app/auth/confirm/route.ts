import { createServerClient } from "@supabase/ssr";
import {cookies} from 'next/headers'
import { NextResponse, NextRequest } from "next/server";
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest){
    const {searchParams} = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const next = searchParams.get('next');
    const type = searchParams.get('type');
    const cookieStore = cookies();


    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
            cookies: {
                get(name){
                    return cookieStore.get(name)?.value
                },
                set(name, value, options){
                    cookieStore.set({name, value, ...options})
                },
                remove(name, options){
                    cookieStore.set({name, value: '', ...options})
                }
            }
        }
    )

    if (token_hash && type){
      const {error} = await supabase.auth.verifyOtp({
        type: type as EmailOtpType, token_hash
      })
      console.log({error})
      if (!error){
        return NextResponse.redirect(next || '/login')
      }
    }
    return NextResponse.redirect('/error')
}