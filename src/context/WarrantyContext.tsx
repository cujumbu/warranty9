import React, { createContext, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface WarrantyClaim {
  email: string;
  name: string;
  phoneNumber: string;
  orderNumber: string;
  returnAddress: string;
  brand: string;
  problem: string;
}

interface WarrantyContextType {
  submitClaim: (claim: WarrantyClaim) => Promise<string>;
  getBrandNotice: (brand: string) => string;
}

export const WarrantyContext = createContext<WarrantyContextType>({
  submitClaim: async () => '',
  getBrandNotice: () => '',
});

export const WarrantyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const submitClaim = async (claim: WarrantyClaim): Promise<string> => {
    try {
      console.log('Submitting claim to:', `${API_URL}/api/claims`);
      const response = await axios.post(`${API_URL}/api/claims`, claim);
      console.log('Claim submission response:', response.data);
      return response.data.claimNumber;
    } catch (error) {
      console.error('Error submitting claim:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
      }
      throw new Error('Failed to submit claim. Please check the console for more details.');
    }
  };

  const getBrandNotice = (brand: string): string => {
    const notices: Record<string, string> = {
      Seiko: "Please note that water damage is not covered under Seiko's standard warranty.",
      Casio: "For G-Shock models, impact resistance is covered, but glass scratches are not.",
      Timex: "Timex offers a 1-year limited warranty from the original purchase date.",
    };
    return notices[brand] || '';
  };

  return (
    <WarrantyContext.Provider value={{ submitClaim, getBrandNotice }}>
      {children}
    </WarrantyContext.Provider>
  );
};