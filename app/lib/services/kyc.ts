// app/lib/services/kyc.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  KYCVerification, 
  KYCStatus, 
  KYCInfo, 
  KYCEligibility,
  KYCTier,
  KYC_LIMITS 
} from '@/app/types/kyc';
import { toast } from '@/components/ui/use-toast';

export class KYCService {
  private static supabase = createClientComponentClient();

  static async submitVerification(
    userId: string,
    type: KYCVerification['verification_type'],
    data: any
  ) {
    try {
      const verificationData = {
        user_id: userId,
        verification_type: type,
        status: 'pending' as KYCStatus,
        verification_data: data,
        attempt_count: 1,
        last_attempt_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('kyc_status_tracking')
        .insert(verificationData);

      if (error) throw error;

      // Show toast notification
      toast({
        title: "Verification Submitted",
        description: "Your verification request has been submitted. Please wait while we process it.",
      });

    } catch (error) {
      console.error(`${type} verification error:`, error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to submit verification",
        variant: "destructive"
      });
      throw error;
    }
  }

  static async uploadDocument(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `kyc-documents/${fileName}`;

      const { error: uploadError } = await this.supabase
        .storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = this.supabase
        .storage
        .from('kyc-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  static async verifyNIN(userId: string, nin: string, selfieImage: string): Promise<boolean> {
    try {
      const base64Image = selfieImage.split(',')[1];
      
      // First check if user has already completed NIN verification
      const { data: existingProfile } = await this.supabase
        .from('user_profiles')
        .select('kyc_level, kyc_status, kyc_verified')
        .eq('user_id', userId)
        .single();
        
      if (existingProfile?.kyc_verified) {
        toast({
          title: "Already Verified",
          description: "Your identity has already been verified.",
        });
        return true;
      }
      
      // Call Dojah API for NIN verification
      const response = await fetch('/api/verify/nin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'AppId': process.env.NEXT_PUBLIC_DOJAH_APP_ID!,
          'Authorization': process.env.DOJAH_API_SECRET!
        },
        body: JSON.stringify({
          nin,
          selfie_image: base64Image
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.entity?.selfie_verification?.match) {
        // Log failed attempt
        await this.submitVerification(userId, 'nin', {
          status: 'failed',
          error: 'NIN verification failed - Selfie mismatch',
          attempt_at: new Date().toISOString()
        });

        toast({
          title: "Verification Failed",
          description: "Failed to verify your identity. Please ensure your selfie matches your NIN photo.",
          variant: "destructive"
        });

        throw new Error('NIN verification failed - Selfie mismatch');
      }

      // Update user's KYC status in user_profiles table
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          kyc_level: KYCTier.BASIC,
          kyc_status: 'unverified',
          verification_ref: data.entity.nin,
          kyc_documents: {
            nin: nin,
            submitted_at: new Date().toISOString(),
            verification_data: {
              first_name: data.entity.first_name,
              last_name: data.entity.last_name,
              middle_name: data.entity.middle_name,
              gender: data.entity.gender,
              phone_number: data.entity.phone_number,
              date_of_birth: data.entity.date_of_birth
            }
          }
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Profile update error:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update verification status. Please contact support.",
          variant: "destructive"
        });
        throw new Error('Failed to update verification status');
      }

      // Log successful verification attempt
      await this.submitVerification(userId, 'nin', {
        status: 'success',
        reference: data.entity.nin,
        verified_at: new Date().toISOString(),
        verification_data: data.entity
      });

      toast({
        title: "Verification Successful",
        description: "Your identity has been verified successfully.",
      });

      return true;
    } catch (error) {
      console.error('NIN verification error:', error);
      throw error;
    }
  }

  static async getKYCStatus(userId: string) {
    try {
      const { data: profileData, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('kyc_level, kyc_status, is_verified, kyc_documents')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Create new profile for user with unverified status
          const { data: newProfile, error: createError } = await this.supabase
            .from('user_profiles')
            .insert([{
              user_id: userId,
              kyc_level: KYCTier.NONE,
              kyc_status: 'unverified',
              is_verified: false,
              kyc_documents: null
            }])
            .select()
            .single();

          if (createError) throw createError;
          return { 
            isVerified: false, 
            tier: KYCTier.NONE,
            status: 'unverified',
            documents: null,
            limits: KYC_LIMITS[KYCTier.NONE]
          };
        }
        throw profileError;
      }

      const tierLevel = profileData.kyc_level as KYCTier;
      
      return {
        isVerified: profileData.is_verified,
        tier: tierLevel,
        status: profileData.kyc_status,
        documents: profileData.kyc_documents,
        limits: KYC_LIMITS[tierLevel]
      };
    } catch (error) {
      console.error('KYC status check failed:', error);
      return { 
        isVerified: false, 
        tier: KYCTier.NONE,
        status: 'unverified',
        documents: null,
        limits: KYC_LIMITS[KYCTier.NONE]
      };
    }
  }

  static async getKYCInfo(userId: string): Promise<KYCInfo> {
    try {
      const { data: existingProfile, error: checkError } = await this.supabase
        .from('user_profiles')
        .select('kyc_level, kyc_status, kyc_documents, daily_limit, monthly_limit')
        .eq('user_id', userId)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          // Create initial profile if it doesn't exist
          const { data: newProfile, error: createError } = await this.supabase
            .from('user_profiles')
            .insert([{
              user_id: userId,
              kyc_level: KYCTier.NONE,
              kyc_status: 'unverified',
              is_verified: false,
              kyc_documents: {},
              daily_limit: KYC_LIMITS[KYCTier.NONE].dailyLimit,
              monthly_limit: KYC_LIMITS[KYCTier.NONE].monthlyLimit
            }])
            .select()
            .single();

          if (createError) throw createError;
          return {
            currentTier: KYCTier.NONE,
            status: 'unverified',
            documents: {}
          };
        }
        throw checkError;
      }

      return {
        currentTier: existingProfile.kyc_level as KYCTier,
        status: existingProfile.kyc_status,
        documents: existingProfile.kyc_documents || {}
      };
    } catch (error) {
      console.error('KYC fetch error:', error);
      return {
        currentTier: KYCTier.NONE,
        status: 'unverified',
        documents: {}
      };
    }
  }

  static async submitIntermediateVerification(
    userId: string,
    data: {
      idType: string;
      idNumber: string;
      address: string;
      idDocumentUrl: string;
      proofOfAddressUrl: string;
      tier: string;
    }
  ) {
    try {
      const verificationData = {
        user_id: userId,
        verification_type: 'intermediate',
        status: 'pending' as KYCStatus,
        verification_data: {
          id_type: data.idType,
          id_number: data.idNumber,
          address: data.address,
          id_document_url: data.idDocumentUrl,
          proof_of_address_url: data.proofOfAddressUrl,
          tier: data.tier
        },
        attempt_count: 1,
        last_attempt_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('kyc_status_tracking')
        .insert(verificationData);

      if (error) throw error;

      // Update user profile with new tier status
      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({
          kyc_tier: 'intermediate',
          kyc_status: 'pending',
          kyc_documents: {
            ...data,
            submitted_at: new Date().toISOString()
          }
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

    } catch (error) {
      console.error('Intermediate verification error:', error);
      throw error;
    }
  }

  static async isEligibleForTrade(userId: string, action: 'view' | 'receive' | 'trade' = 'trade'): Promise<KYCEligibility> {
    try {
      const status = await this.getKYCStatus(userId);
      
      // Allow viewing and receiving crypto without KYC
      if (!status.isVerified && ['view', 'receive'].includes(action)) {
        return {
          eligible: true,
          status: status.status,
          reason: 'Basic wallet functions available without KYC'
        };
      }

      // Require at least BASIC tier for trading
      if (status.tier === KYCTier.NONE) {
        return {
          eligible: false,
          status: status.status,
          reason: 'KYC verification required for trading'
        };
      }

      return {
        eligible: status.isVerified,
        status: status.status,
        reason: status.isVerified ? 'Verified' : 'Verification pending'
      };
    } catch (error) {
      console.error('Error checking KYC eligibility:', error);
      return {
        eligible: false,
        status: 'unverified' as KYCStatus,
        reason: 'Failed to check eligibility'
      };
    }
  }

  static async getVerificationHistory(userId: string) {
    const { data, error } = await this.supabase
      .from('verification_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching verification history:', error);
      return [];
    }

    return data;
  }

  static async verifyBVN(userId: string, bvn: string): Promise<boolean> {
    try {
      const response = await fetch('/api/verify/bvn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bvn,
          metadata: {
            user_id: userId,
            verification_type: 'bvn'
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'BVN verification failed');
      }

      // Update user's KYC status
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          kyc_level: 2,
          kyc_status: 'pending',
          verification_ref: data.reference,
          kyc_documents: {
            bvn: bvn,
            submitted_at: new Date().toISOString(),
            verification_data: data.data
          }
        })
        .eq('id', userId);

      if (error) {
        console.error('Profile update error:', error);
        throw new Error('Failed to update verification status');
      }

      return true;
    } catch (error) {
      console.error('BVN verification error:', error);
      throw error;
    }
  }

  static async verifyPhotoID(
    userId: string, 
    data: {
      idType: 'passport' | 'drivers_license';
      selfieImage: string;
      idImage: string;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/verify/photo-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          metadata: {
            user_id: userId,
            verification_type: 'photo_id'
          }
        })
      });

      const responseData = await response.json();
      
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Photo ID verification failed');
      }

      // Update user's KYC status
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          kyc_level: 3,
          kyc_status: 'pending',
          verification_ref: responseData.reference,
          kyc_documents: {
            id_type: data.idType,
            submitted_at: new Date().toISOString(),
            verification_data: responseData.data
          }
        })
        .eq('id', userId);

      if (error) {
        console.error('Profile update error:', error);
        throw new Error('Failed to update verification status');
      }

      return true;
    } catch (error) {
      console.error('Photo ID verification error:', error);
      throw error;
    }
  }
}