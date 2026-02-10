/**
 * Open Campus VC Analytics API client
 * Used to query VCs and verify university membership
 */

const VC_API_URL = process.env.OC_VC_ANALYTICS_API_URL || 'https://api.analytics.vc.staging.opencampus.xyz';

export interface VC {
  vcId: string;
  ocid: string;
  walletAddress: string;
  achievementType: string;
  awardedDate: string;
  validUntil: string | null;
  status: 'issuing' | 'active' | 'revoking' | 'revoked';
  tokenId: string;
  nftCollection: string;
  credentialName: string;
  identifier: string;
  credentialImage: string;
  metadataEndpoint: string;
}

export interface VCQueryResponse {
  total: number;
  page: number;
  pageSize: number;
  next: string | null;
  prev: string | null;
  data: VC[];
}

export interface UniversityVC {
  vcId: string;
  universityName: string;
  issuerDid: string;
  status: string;
  awardedDate: string;
}

/**
 * Fetch VCs for a holder by their OCID
 */
export async function getVCsByHolder(
  holderOcid: string,
  authToken: string,
  options?: {
    pageSize?: number;
    page?: number;
    statuses?: string[];
  }
): Promise<VCQueryResponse> {
  const params = new URLSearchParams();
  params.set('holderOcid', holderOcid);
  
  if (options?.pageSize) params.set('pageSize', String(options.pageSize));
  if (options?.page) params.set('page', String(options.page));
  if (options?.statuses) params.set('statuses', options.statuses.join(','));

  const response = await fetch(`${VC_API_URL}/vcs?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`VC API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch VCs issued by a specific issuer (university)
 */
export async function getVCsByIssuer(
  issuerDid: string,
  authToken: string,
  options?: {
    pageSize?: number;
    page?: number;
  }
): Promise<VCQueryResponse> {
  const params = new URLSearchParams();
  params.set('issuerDid', issuerDid);
  
  if (options?.pageSize) params.set('pageSize', String(options.pageSize));
  if (options?.page) params.set('page', String(options.page));

  const response = await fetch(`${VC_API_URL}/vcs?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`VC API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if a user holds a VC from any of the known universities
 * Returns the matched university issuer DID if found
 */
export async function findUniversityVC(
  holderOcid: string,
  authToken: string,
  knownUniversityIssuers: string[]
): Promise<UniversityVC | null> {
  try {
    // Fetch active VCs for this user
    const response = await getVCsByHolder(holderOcid, authToken, {
      pageSize: 50,
      statuses: ['active'],
    });

    // Check if any VC's issuer matches a known university
    // Note: The current API response doesn't include issuerDid directly in the VC data
    // This may need adjustment based on actual API response structure
    // For now, we'll check against the identifier or credentialName
    
    for (const vc of response.data) {
      // The identifier field might contain the issuer info
      // Format may vary - adjust based on actual VC structure
      for (const issuerDid of knownUniversityIssuers) {
        // Check if this VC is from a known university
        // This logic may need adjustment based on actual VC data structure
        if (vc.identifier?.includes(issuerDid) || 
            vc.nftCollection?.toLowerCase().includes('university') ||
            vc.achievementType?.toLowerCase().includes('degree') ||
            vc.achievementType?.toLowerCase().includes('enrollment')) {
          return {
            vcId: vc.vcId,
            universityName: vc.credentialName,
            issuerDid: issuerDid,
            status: vc.status,
            awardedDate: vc.awardedDate,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching user VCs:', error);
    return null;
  }
}
