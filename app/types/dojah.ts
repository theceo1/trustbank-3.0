export interface DojahKYCWebhookResponse {
    aml: {
      status: boolean;
    };
    data: {
      id?: {
        data: {
          id_url: string;
          id_data: {
            last_name: string;
            first_name: string;
            date_issued?: string;
            expiry_date?: string;
            middle_name?: string;
            nationality?: string;
            date_of_birth: string;
            document_type: string;
            document_number: string;
          };
        };
        status: boolean;
        message: string;
      };
      selfie?: {
        data: {
          selfie_url: string;
        };
        status: boolean;
        message: string;
      };
      government_data?: {
        data: {
          nin?: {
            entity: {
              nin: string;
              firstname: string;
              surname: string;
              gender: string;
              telephoneno: string;
              birthdate: string;
              image_url: string;
              [key: string]: any;
            };
          };
          bvn?: {
            entity: {
              bvn: string;
              first_name: string;
              last_name: string;
              [key: string]: any;
            };
          };
        };
        status: boolean;
        message: string;
      };
    };
    status: boolean;
    message: string;
    selfie_url?: string;
    reference_id: string;
    verification_status: 'Ongoing' | 'Completed' | 'Pending' | 'Failed';
    metadata?: Record<string, any>;
  }