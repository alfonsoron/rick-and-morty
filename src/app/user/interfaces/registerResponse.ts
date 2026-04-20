import { RegisterPayload } from "./registerPayload";

export interface RegisterResponse {
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
      phone: string;
      birthday: string;
    };
  };
}
