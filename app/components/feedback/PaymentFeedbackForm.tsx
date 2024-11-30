import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/app/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PaymentFeedbackProps } from '@/app/types/feedback';

export function PaymentFeedbackForm({ 
  tradeId, 
  onSubmit 
}: PaymentFeedbackProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({ tradeId, rating, comment });
      toast('Thank you for your feedback', {
        description: 'Your feedback helps us improve our services.'
      });
    } catch (error) {
      toast('Failed to submit feedback', {
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Rate Your Experience</h3>
          <p className="text-sm text-gray-500">
            How was your payment experience with TrustBank?
          </p>
        </div>

        <div className="flex justify-center">
          <StarRating
            value={rating}
            onChange={setRating}
            size={32}
            className="text-primary"
          />
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your feedback (optional)"
          className="w-full h-24"
        />

        <Button
          onClick={handleSubmit}
          disabled={!rating || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
}