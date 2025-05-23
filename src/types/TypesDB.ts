
export type UserType = {
  id: string;
  username: string;
  email: string;
  createdAt?: Date;
};

export type TaskType = {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
};
