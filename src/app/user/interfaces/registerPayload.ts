export interface RegisterPayload {
  name: string;
  mail: string;
  password: string;
  address: {
    street: string;
    location: string;
    city: string;
    country: string;
    cp: string;
  };
  phone: string;
  birthday: string;
}
