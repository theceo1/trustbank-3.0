"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import BackButton from "../../../components/ui/back-button";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Globe } from 'lucide-react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  occupation: string;
  nationality: string;
  state_of_origin: string;
  gender: string;
}

// Add these animation variants after the PersonalInfo interface
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function PersonalInfoPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState<PersonalInfo>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    occupation: '',
    nationality: '',
    state_of_origin: '',
    gender: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            email: user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            date_of_birth: data.date_of_birth || '',
            occupation: data.occupation || '',
            nationality: data.nationality || '',
            state_of_origin: data.state_of_origin || '',
            gender: data.gender || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          id: "personal-info-error",
          title: "Error",
          description: "Failed to load your information",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [supabase, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        id: "personal-info-success",
        title: "Success",
        description: "Your personal information has been updated.",
        variant: "default",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        id: "personal-info-error",
        title: "Error",
        description: "Failed to update your information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = (icon: React.ReactNode, label: string, name: keyof PersonalInfo, type: string = 'text') => (
    <motion.div variants={itemVariants} className="flex items-center space-x-4">
      <div className="text-green-600">{icon}</div>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <Input
          type={type}
          disabled={!isEditing}
          value={formData[name]}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          className="w-full"
        />
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <BackButton />
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">Personal Information</CardTitle>
          <CardDescription>
            Manage your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormField(<User className="w-5 h-5" />, "Full Name", "full_name")}
            {renderFormField(<Mail className="w-5 h-5" />, "Email Address", "email", "email")}
            {renderFormField(<Phone className="w-5 h-5" />, "Phone Number", "phone", "tel")}
            {renderFormField(<MapPin className="w-5 h-5" />, "Address", "address")}
            {renderFormField(<Calendar className="w-5 h-5" />, "Date of Birth", "date_of_birth", "date")}
            {renderFormField(<Briefcase className="w-5 h-5" />, "Occupation", "occupation")}
            {renderFormField(<Globe className="w-5 h-5" />, "Nationality", "nationality")}
            {renderFormField(<MapPin className="w-5 h-5" />, "State of Origin", "state_of_origin")}

            <motion.div variants={itemVariants} className="flex items-center space-x-4">
              <div className="text-green-600"><User className="w-5 h-5" /></div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Gender</label>
                <Select
                  disabled={!isEditing}
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-end space-x-4 pt-6">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Edit Information
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
