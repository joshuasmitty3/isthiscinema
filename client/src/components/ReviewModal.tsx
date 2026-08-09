
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Movie, CommonModalProps, ListChangeHandler } from '@/lib/types';
import { updateReview } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { handleError, ErrorSeverity } from '@/utils/errorHandler';

interface ReviewModalProps extends CommonModalProps {
  movie: Movie | null;
  onSave: ListChangeHandler;
}

export function ReviewModal({ movie, isOpen, onClose, onSave }: ReviewModalProps) {
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const maxLength = 140;
  const minLength = 3;

  useEffect(() => {
    if (movie && isOpen) {
      setReview(movie.review || "");
    }
  }, [movie, isOpen]);

  const handleSave = async () => {
    if (!movie) return;

    if (review.trim().length < minLength) {
      toast({
        title: "Review too short",
        description: `Please enter at least ${minLength} characters.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await updateReview(movie.id, review.trim());
      await queryClient.invalidateQueries({ queryKey: ["watchedlist"] });
      toast({
        title: "Review saved",
        description: "Your review has been saved successfully.",
      });
      onSave();
      onClose();
    } catch (error) {
      handleError(error, {
        component: "ReviewModal",
        title: "Failed to Save Review",
        fallbackMessage: "There was an error saving your review.",
        severity: ErrorSeverity.ERROR,
        showToast: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogTitle className="font-heading text-lg font-medium text-foreground">review {movie?.title}</DialogTitle>
        <div>
          <div className="mb-4">
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value.slice(0, maxLength))}
              rows={4}
              placeholder="what did you think?"
              className="w-full p-3 rounded-md border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            />
            <div className={`font-mono text-xs text-right mt-1 ${review.length >= maxLength ? 'text-destructive' : 'text-muted-foreground'}`}>
              {review.length}/{maxLength}
            </div>
          </div>

          <div className="flex justify-between">
            {movie.review && (
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await updateReview(movie.id, "");
                    toast({
                      title: "Review deleted",
                      description: "Your review has been deleted successfully.",
                    });
                    onSave();
                    onClose();
                  } catch (error) {
                    handleError(error, {
                      component: "ReviewModal",
                      title: "Failed to Delete Review",
                      fallbackMessage: "There was an error deleting your review.",
                      severity: ErrorSeverity.ERROR,
                      showToast: true
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="py-2 px-4"
              >
                delete
              </Button>
            )}
            <div className="flex space-x-3 ml-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="py-2 px-4 border-border text-muted-foreground rounded-md hover:bg-accent hover:text-foreground"
              >
                cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || review.trim().length < minLength}
                className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                save review
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
