export const TOKEN_KEY = '@GFinance:token';
export const USER_KEY = '@GFinance:user';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
}

export const SetAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const GetAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const RemoveAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const SetAuthUser = (user: StoredUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const GetAuthUser = (): StoredUser | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};