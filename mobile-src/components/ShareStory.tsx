import React, { useState } from 'react';
import { Share2, Copy, Link, MessageCircle, Mail } from 'lucide-react';
import { Share } from '@capacitor/share';

interface ShareStoryProps {
  story: {
    id: string;
    title: string;
    author: string;
    url?: string;
  };
}

export default function ShareStory({ story }: ShareStoryProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const shareText = `Check out "${story.title}" by ${story.author} on Ulimi - Stories & Audiobooks`;
  const shareUrl = story.url || `https://ulimi.app/story/${story.id}`;

  const handleNativeShare = async () => {
    try {
      setIsSharing(true);
      
      await Share.share({
        title: story.title,
        text: shareText,
        url: shareUrl,
        dialogTitle: 'Share this story',
      });
      
      setShowOptions(false);
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      
      // Show success feedback
      const button = document.getElementById('copy-button');
      if (button) {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy Link';
        }, 2000);
      }
      
      setShowOptions(false);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Great story: ${story.title}`);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowOptions(false);
  };

  const handleSMSShare = () => {
    const message = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`sms:?body=${message}`);
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isSharing}
        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
      >
        {isSharing ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Share2 size={16} />
        )}
        Share
      </button>

      {showOptions && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 min-w-48">
          <div className="p-2 space-y-1">
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Share2 size={16} className="text-blue-500" />
              <span className="text-sm">Share via...</span>
            </button>

            <button
              id="copy-button"
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Copy size={16} className="text-green-500" />
              <span className="text-sm">Copy Link</span>
            </button>

            <button
              onClick={handleEmailShare}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Mail size={16} className="text-red-500" />
              <span className="text-sm">Email</span>
            </button>

            <button
              onClick={handleSMSShare}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <MessageCircle size={16} className="text-purple-500" />
              <span className="text-sm">Text Message</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close options */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}