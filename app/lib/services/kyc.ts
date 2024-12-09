// app/lib/services/kyc.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { KYCVerification, KYCStatusType, KYCInfo, KYCEligibility } from '@/app/types/kyc';
import supabase from "@/lib/supabase/client";

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
        status: 'pending' as KYCStatusType,
        verification_data: data,
        attempt_count: 1,
        last_attempt_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('kyc_status_tracking')
        .insert(verificationData);

      if (error) throw error;

    } catch (error) {
      console.error(`${type} verification error:`, error);
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
      
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nin,
          selfieImage: base64Image,
          metadata: {
            user_id: userId,
            verification_type: 'nin'
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'NIN verification failed');
      }

      // Update user's KYC status in user_profiles table
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          kyc_level: 1,
          kyc_status: 'pending',
          verification_ref: data.reference,
          kyc_documents: {
            nin: nin,
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
      console.error('NIN verification error:', error);
      throw error;
    }
  }

  static async getKYCStatus(userId: string) {
    try {
      const { data: profileData, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('kyc_tier, kyc_status')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Create initial profile if it doesn't exist
          const { data: newProfile, error: createError } = await this.supabase
            .from('user_profiles')
            .insert([{
              user_id: userId,
              kyc_tier: 'unverified',
              kyc_status: 'pending'
            }])
            .select()
            .single();

          if (createError) throw createError;
          return { isVerified: false, tier: 'unverified' };
        }
        throw profileError;
      }

      return {
        isVerified: profileData.kyc_status === 'approved',
        tier: profileData.kyc_tier
      };
    } catch (error) {
      console.error('KYC status check failed:', error);
      return { isVerified: false, tier: 'unverified' };
    }
  }

  static async getKYCInfo(userId: string): Promise<KYCInfo> {
    try {
      // First clean up any duplicate profiles
      await this.supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId)
        .neq('id', (
          await this.supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        ).data?.id);

      // Now proceed with normal flow
      const { data: existingProfile, error: checkError } = await this.supabase
        .from('user_profiles')
        .select('kyc_tier, kyc_status, kyc_documents')
        .eq('user_id', userId)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          // Create initial profile if it doesn't exist
          const { data: newProfile, error: createError } = await this.supabase
            .from('user_profiles')
            .insert([{
              user_id: userId,
              kyc_tier: 'unverified',
              kyc_status: 'pending',
              kyc_documents: {}
            }])
            .select()
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
            return {
              currentTier: 'unverified',
              status: 'pending',
              documents: {}
            };
          }

          return {
            currentTier: newProfile.kyc_tier,
            status: newProfile.kyc_status,
            documents: newProfile.kyc_documents || {}
          };
        }
        throw checkError;
      }

      return {
        currentTier: existingProfile.kyc_tier,
        status: existingProfile.kyc_status,
        documents: existingProfile.kyc_documents || {}
      };
    } catch (error) {
      console.error('KYC fetch error:', error);
      return {
        currentTier: 'unverified',
        status: 'pending',
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
        status: 'pending' as KYCStatusType,
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

  static async isEligibleForTrade(userId: string): Promise<KYCEligibility> {
    try {
      const response = await fetch(`/api/kyc/eligibility/${userId}`);
      const data = await response.json();
      
      return {
        eligible: data.eligible,
        status: data.status as KYCStatusType,
        reason: data.reason
      };
    } catch (error) {
      return {
        eligible: false,
        status: 'unverified',
        reason: 'Failed to verify KYC status'
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