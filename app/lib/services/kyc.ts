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
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nin,
          selfieImage
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('NIN verification failed');
      }

      // Update user's KYC status
      const { error } = await this.supabase
        .from('profiles')
        .update({
          kyc_tier: 'tier1',
          kyc_status: 'verified',
          kyc_documents: {
            nin: nin,
            verified_at: new Date().toISOString(),
            verification_data: data.data
          }
        })
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('NIN verification error:', error);
      throw error;
    }
  }

  static async getKYCStatus(userId: string): Promise<{ isVerified: boolean }> {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('KYC fetch error:', error);
        return { isVerified: false };
      }

      return { isVerified: !!data?.verified_at };
    } catch (error) {
      console.error('KYC fetch error:', error);
      return { isVerified: false };
    }
  }

  static async getKYCInfo(userId: string): Promise<KYCInfo> {
    try {
      // First check if the columns exist
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('KYC fetch error:', profileError);
        return {
          currentTier: 'unverified',
          status: 'pending',
          documents: {}
        };
      }

      // Return default values if columns don't exist
      return {
        currentTier: profileData?.kyc_tier || 'unverified',
        status: profileData?.kyc_status || 'pending',
        documents: profileData?.kyc_documents || {}
      };
    } catch (error) {
      console.error('KYC service error:', error);
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
}