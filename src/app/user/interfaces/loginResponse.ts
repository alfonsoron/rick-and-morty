import { RegisterPayload } from "./registerPayload";

export interface LoginResponse {
  header: {
    message: string;
    resultCode: number;
  };
  data: {
    user: {
      id: string;
      role: string;
      name: string;
      mail: string;
      address?: RegisterPayload['address'];
      birthday: string;
      phone: string;
    };
    token: string;
  };
}
