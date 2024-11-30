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

const intermediateFormSchema = z.object({
  idType: z.enum(["nationalId", "driversLicense", "passport"]),
  idNumber: z.string().min(5, "ID number must be at least 5 characters"),
  address: z.string().min(10, "Please enter your full address"),
  idDocument: z.instanceof(File, { message: "Please upload your ID document" }),
  proofOfAddress: z.instanceof(File, { message: "Please upload proof of address" }),
});

type IntermediateFormValues = z.infer<typeof intermediateFormSchema>;

export function KYCIntermediateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<IntermediateFormValues>({
    resolver: zodResolver(intermediateFormSchema),
  });

  const onSubmit = async (data: IntermediateFormValues) => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      // Handle file uploads first
      const idDocumentUrl = await KYCService.uploadDocument(data.idDocument);
      const proofOfAddressUrl = await KYCService.uploadDocument(data.proofOfAddress);

      await KYCService.submitIntermediateVerification(user.id, {
        idType: data.idType,
        idNumber: data.idNumber,
        address: data.address,
        idDocumentUrl,
        proofOfAddressUrl,
        tier: "tier2"
      });

      toast({
        id: "intermediate-verification-submitted",
        title: "Verification Submitted",
        description: "Your intermediate verification is being processed.",
      });
      
      router.push("/profile/verification");
    } catch (error) {
      toast({
        id: "intermediate-verification-error",
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
                  <SelectItem value="nationalId">National ID</SelectItem>
                  <SelectItem value="driversLicense">Driver&apos;s License</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Residential Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your full address" />
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
                    accept="image/*,.pdf"
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

        <FormField
          control={form.control}
          name="proofOfAddress"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Upload Proof of Address</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
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
          Submit Intermediate Verification
        </Button>
      </form>
    </Form>
  );
}