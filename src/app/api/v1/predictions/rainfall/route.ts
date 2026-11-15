import { NextResponse } from 'next/server';
import rainfallModel from '@/data/experimentalRainfallGpr.json';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(rainfallModel, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
