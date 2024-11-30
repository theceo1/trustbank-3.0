"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { KYCService } from "@/app/lib/services/kyc";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const advancedFormSchema = z.object({
  idType: z.enum(["drivers_license", "international_passport"], {
    required_error: "Please select an ID type",
  }),
  idNumber: z.string().min(1, "Please enter your ID number"),
  idDocument: z.instanceof(File, { message: "Please upload your ID document" }),
});

type AdvancedFormValues = z.infer<typeof advancedFormSchema>;

export function KYCAdvancedForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<AdvancedFormValues>({
    resolver: zodResolver(advancedFormSchema),
  });

  const onSubmit = async (data: AdvancedFormValues) => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      const idDocumentUrl = await KYCService.uploadDocument(data.idDocument);

      await KYCService.submitVerification(user.id, 'advanced', {
        idType: data.idType,
        idNumber: data.idNumber,
        idDocumentUrl,
        tier: "tier3",
      });

      toast({
        id: "advanced-verification-submitted",
        title: "Verification Submitted",
        description: "Your advanced verification is being processed.",
      });
      
      router.push("/profile/verification");
    } catch (error) {
      toast({
        id: "advanced-verification-error",
        title: "Submission Failed",
        description: "There was an error submitting your verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="idType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                  <SelectItem value="international_passport">International Passport</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your ID number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idDocument"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Upload ID Document</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                    {...field}
                  />
                  <Upload className="h-4 w-4" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Advanced Verification
        </Button>
      </form>
    </Form>
  );
}