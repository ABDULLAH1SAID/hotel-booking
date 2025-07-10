export interface IUser {
  _id: string;
  userName: string;
  email: string;
  password: string;
  isConfirmed: boolean;
  gender?: "male" | "female";
  phone?: string;
  role: "user" | "seller";
  forgetCode?: string;
  profileImage: {
    url: string;
    id: string;
  };
  coverImages: Array<{
    url: string;
    id: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender?: "male" | "female";
  phone?: string;
  role?: "user" | "seller";
}

export interface RegisterResponse {
  success: boolean,
  message: string,
}

export interface loginRequest {
  email: string;
  password: string;
}

export interface loginResponse {
  success: boolean;
  results: string;
}

export interface forgetCodeRequest {
  email: string;
}



export interface resetPasswordRequest {
  email:string; 
  password: string,
  forgetCode: string
}