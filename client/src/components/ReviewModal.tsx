import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Movie } from "@/lib/types";
import { updateReview } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ReviewModal({ movie, isOpen, onClose, onSave }: ReviewModalProps) {
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const maxLength = 140;

  useEffect(() => {
    if (movie && isOpen) {
      setReview(movie.review || "");
    }
  }, [movie, isOpen]);

  const handleSave = async () => {
    if (!movie) return;
    
    try {
      setIsLoading(true);
      await updateReview(movie.id, review);
      
      toast({
        title: "Review saved",
        description: "Your review has been saved successfully.",
      });
      
      onSave();
    } catch (error) {
      console.error("Failed to save review:", error);
      toast({
        title: "Failed to save review",
        description: "There was an error saving your review.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium font-heading">Add Your Review</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <h4 className="text-base font-medium mb-2">
            {movie.title} ({movie.year})
          </h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Your Review</label>
            <Textarea 
              value={review}
              onChange={(e) => setReview(e.target.value.slice(0, maxLength))}
              rows={4}
              placeholder="What did you think? (max 140 characters)"
              className="w-full p-3 border border-neutral-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className={`text-xs text-right mt-1 ${review.length >= maxLength ? 'text-[#F44336]' : 'text-neutral-600'}`}>
              {review.length}/{maxLength} characters
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline"
              onClick={onClose}
              className="py-2 px-4 border border-neutral-200 text-neutral-600 rounded-md hover:bg-neutral-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Save Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { updateReview } from "@/lib/api";
import type { Movie } from "@/lib/types";

interface ReviewModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ReviewModal({ movie, isOpen, onClose, onSave }: ReviewModalProps) {
  const [review, setReview] = useState(movie?.review || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!movie) return;
    
    try {
      setIsLoading(true);
      await updateReview(movie.id, review);
      toast({ description: "Review saved successfully" });
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save review:", error);
      toast({ 
        variant: "destructive",
        description: "Failed to save review" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {movie?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={140}
            rows={4}
            className="w-full p-2 border rounded-md"
            placeholder="Write your review (max 140 characters)"
          />
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Save Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
