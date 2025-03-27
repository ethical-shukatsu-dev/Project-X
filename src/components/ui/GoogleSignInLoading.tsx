import React from "react";

interface GoogleSignInLoadingProps {
  visible: boolean;
}

const GoogleSignInLoading: React.FC<GoogleSignInLoadingProps> = ({visible}) => {
  if (!visible) return null;

  return (
    <div
      id="google-register-loading"
      className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black/70 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center p-6 bg-white rounded-lg">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-700">
          Connecting with Google...
        </p>
      </div>
    </div>
  );
};

export default GoogleSignInLoading; 