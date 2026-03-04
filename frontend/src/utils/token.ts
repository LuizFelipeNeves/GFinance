export const TOKEN_KEY = '@GFinance:token';

export const SetAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const GetAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const RemoveAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};