import Cookies from "js-cookie";

export function saveToken(token) {
  localStorage.setItem("token", token);
  Cookies.set("token", token, { expires: 1 });
}

export function clearToken() {
  localStorage.removeItem("token");
  Cookies.remove("token");
}

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}
