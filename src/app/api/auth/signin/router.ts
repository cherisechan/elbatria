import { NextResponse } from 'next/server';
import { signIn } from '~/auth';

export async function POST() {
  await signIn();
  return NextResponse.redirect('/dashboard');
}