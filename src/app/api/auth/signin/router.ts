import { signIn } from 'next-auth/react';
import { NextResponse } from 'next/server';
import { signOut } from '~/auth';

export async function POST() {
  await signIn();
  return NextResponse.redirect('/dashboard');
}