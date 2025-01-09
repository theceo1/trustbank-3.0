import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">We&apos;re here to help you succeed in your crypto journey</h1>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">&ldquo;How can we help?&rdquo;</h2>
            <p className="text-sm text-muted-foreground mb-10">
              We&apos;re here to help you with any questions or concerns you may have about trustBank&apos;s services.
            </p>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Get in touch with our support team</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold">Email Support</h3>
                      <p className="text-sm text-muted-foreground">support@trustbank.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold">Phone Support</h3>
                      <p className="text-sm text-muted-foreground">+1 (800) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MessageCircle className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold">Live Chat</h3>
                      <p className="text-sm text-muted-foreground">Available 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Questions</CardTitle>
                  <CardDescription>Quick answers to frequently asked questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li>
                      <h3 className="font-semibold">How do I create an account?</h3>
                      <p className="text-sm text-muted-foreground">Click the &quot;Get Started&quot; button and follow the registration process.</p>
                    </li>
                    <li>
                      <h3 className="font-semibold">How do I buy cryptocurrency?</h3>
                      <p className="text-sm text-muted-foreground">Visit our Trade page, select your desired cryptocurrency, and follow the purchase instructions.</p>
                    </li>
                    <li>
                      <h3 className="font-semibold">What are the trading fees?</h3>
                      <p className="text-sm text-muted-foreground">Our trading fees vary by transaction type. Visit our pricing page for detailed information.</p>
                    </li>
                  </ul>
                  <Button asChild className="mt-6 w-full">
                    <Link href="/about/faq">View All FAQs</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 