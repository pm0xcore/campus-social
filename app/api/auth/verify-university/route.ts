import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { findUniversityVC } from '@/lib/vc-api';

/**
 * POST /api/auth/verify-university
 * Verifies a user's university membership via VC and caches the result
 * 
 * Body: { ocid: string, authToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { ocid, authToken } = await request.json();

    if (!ocid) {
      return NextResponse.json({ error: 'OCID is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if user already has a verified university
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, university_id')
      .eq('ocid', ocid)
      .maybeSingle() as { data: { id: string; university_id: string | null } | null };

    if (existingUser?.university_id) {
      // Already verified, return cached university
      const { data: university } = await supabase
        .from('universities')
        .select('*')
        .eq('id', existingUser.university_id)
        .single();

      return NextResponse.json({
        verified: true,
        university,
        cached: true,
      });
    }

    // Fetch known universities from DB
    const { data: universities } = await supabase
      .from('universities')
      .select('id, name, issuer_did');

    if (!universities || universities.length === 0) {
      return NextResponse.json({
        verified: false,
        message: 'No universities configured',
      });
    }

    const knownIssuers = universities.map(u => u.issuer_did);

    // If we have an auth token, try to verify via VC API
    if (authToken) {
      const universityVC = await findUniversityVC(ocid, authToken, knownIssuers);

      if (universityVC) {
        // Find the matching university in our DB
        const matchedUniversity = universities.find(
          u => u.issuer_did === universityVC.issuerDid
        );

        if (matchedUniversity) {
          // Update user with verified university
          await supabase
            .from('users')
            .update({ university_id: matchedUniversity.id })
            .eq('ocid', ocid);

          return NextResponse.json({
            verified: true,
            university: matchedUniversity,
            vcId: universityVC.vcId,
          });
        }
      }
    }

    // For demo/development: Allow domain-based matching as fallback
    // In production, you'd rely solely on VC verification
    const domain = ocid.split('@')[1] || ocid.split('.').slice(-2).join('.');
    const domainMatch = universities.find(u => 
      u.issuer_did.includes(domain) || domain.includes(u.name.toLowerCase().replace(/\s+/g, ''))
    );

    if (domainMatch) {
      // Update user with matched university (demo mode)
      if (existingUser) {
        await supabase
          .from('users')
          .update({ university_id: domainMatch.id })
          .eq('ocid', ocid);
      }

      return NextResponse.json({
        verified: true,
        university: domainMatch,
        demoMode: true,
      });
    }

    return NextResponse.json({
      verified: false,
      message: 'No matching university VC found',
    });
  } catch (error) {
    console.error('University verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
