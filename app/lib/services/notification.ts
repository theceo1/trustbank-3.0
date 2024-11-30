import supabase from "@/lib/supabase/client";

interface NotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
}

export class NotificationService {
  static async create(data: NotificationData) {
    await supabase.from('notifications').insert(data);
  }
}