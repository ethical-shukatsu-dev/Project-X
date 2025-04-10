import { NextRequest, NextResponse } from 'next/server';
import { updateCompanyLogos } from '@/lib/companies/client';

export async function GET(request: NextRequest) {
  try {
    // Check for a secret key to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.API_SECRET_KEY;

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update company logos
    await updateCompanyLogos();

    return NextResponse.json(
      { success: true, message: 'Company logos update process started' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in update-logos API route:', error);
    return NextResponse.json({ error: 'Failed to update company logos' }, { status: 500 });
  }
}
