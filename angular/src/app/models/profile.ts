// src/app/models/profile.ts

export interface Profile {
    id?: string;
    
    role: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    tagLine?: string;
    bio?: string;
    searchStatus?: string;
    roleType?: string[];
    roleLevel?: string[];
    website?: string;
    github?: string;
    twitter?: string;
    linkedIn?: string;
    stackoverflow?: string;
    // Add other relevant fields as needed
  }
  